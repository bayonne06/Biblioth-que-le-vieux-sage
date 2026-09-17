const pool = require('../config/db.js');
//créer l'emprunt uniquement si le livre existe
const { Parser } = require('json2csv');
//créer une variable cont contenant le module json2csv pour l'export de notre liste d'emprunts en retards

exports.liste= async (req,res,next)=> {
  try {
	const result=await pool.query(`SELECT e.*, a.nom AS adherent_nom,l.titre FROM emprunts e
  JOIN adherents a ON a.id=e.id_adherent
  JOIN livres l ON l.id=e.id_livres
  WHERE e.date_retour_reelle IS NULL ORDER BY id`); //requête sql
res.json(result.rows); //renvoi une reponse contenant un tableau de ligne en json
} catch (err) {
    
	next(err); //en cas d'erreur, transmission dans la gestion d'erreurs
}
}
exports.creer=async (req,res,next)=>{
  try {
	const {id_adherent,id_livres,date_retour_prevue}= req.body; //les données du formulaire
    const livres= await pool.query(
      `SELECT * FROM livres WHERE id=$1`, [id_livres]
    );
    if(livres.rows.length===0){// livres n'existe pas
      const e = new Error ("le livre n'existe pas");
      e.status=404;
      throw e;
    }
    if(!livres.rows[0].disponible){ //pas de doublon
      const e = new Error ('ce livre est déjà emprunté');
      e.status=400;
      throw e;
    }
    const emprunts = await pool.query(//création d'un emprunt
      `INSERT INTO emprunts(id_adherent,id_livres,date_retour_prevue) VALUES($1, $2, $3) RETURNING *`,[id_adherent,id_livres,date_retour_prevue]
    );
  await pool.query(// par defaut dans la base le livre est disponible=true donc pour pour que livre soit en état d'emprunt disponible doit être = false
    `UPDATE livres SET disponible=FALSE WHERE id=$1`,[id_livres]
  );
    res.status(201).json(emprunts.rows[0]);
} catch (err) {
	next(err);
}
}

//enregistrement du retour d'un livre
exports.retour= async (req,res,next)=>{
  const client = await pool.connect(); //une seule connexion pour tout enchainer proprement
  try {
	await client.query('BEGIN');

	const {id}= req.params;
    const { date_retour_reelle } = req.body; // optionnel : si absent, on prend aujourd'hui

    // On recupere d'abord l'emprunt SANS le modifier, pour valider la date choisie
    const empruntExistant = await client.query(`SELECT * FROM emprunts WHERE id=$1`, [id]);
    if (empruntExistant.rows.length === 0) {
      const e = new Error('emprunt introuvable');
      e.status = 404;
      throw e;
    }
    const emprunt = empruntExistant.rows[0];

    const aujourdHui = new Date().toISOString().slice(0, 10);
    const dateEmprunt = new Date(emprunt.date_emprunt).toISOString().slice(0, 10);
    const dateChoisie = date_retour_reelle || aujourdHui;

    // Seules deux regles sont valides : pas de retour dans le futur, et pas
    // de retour avant la date d'emprunt. Rendre le livre AVANT la date prevue
    // (date_retour_prevue) est parfaitement normal et ne doit JAMAIS etre bloque :
    // c'est justement ce qui distingue un retour a l'heure d'un retour en retard.
    if (dateChoisie > aujourdHui) {
      const e = new Error('La date de retour ne peut pas etre dans le futur');
      e.status = 400;
      throw e;
    }
    if (dateChoisie < dateEmprunt) {
      const e = new Error("La date de retour ne peut pas etre avant la date d'emprunt");
      e.status = 400;
      throw e;
    }

    const emprunts = await client.query(
      `UPDATE emprunts SET date_retour_reelle=$1
      WHERE id=$2 RETURNING *`,[dateChoisie, id]
    );

    const id_livres = emprunts.rows[0].id_livres; // le livre concerne par CET emprunt precis

    // Cherche la reservation la plus ancienne encore "en attente" sur ce livre
    const reservation = await client.query(
      `SELECT id, id_adherent FROM reservation
       WHERE id_livres = $1 AND statut = 'en attente'
       ORDER BY date_reservation LIMIT 1`,
      [id_livres]
    );

    if (reservation.rows.length > 0) {
      // Quelqu'un attendait ce livre : on lui cree directement un nouvel
      // emprunt, avec une date de retour par defaut a 14 jours
      await client.query(
        `INSERT INTO emprunts (id_adherent, id_livres, date_retour_prevue)
         VALUES ($1, $2, CURRENT_DATE + INTERVAL '14 days')`,
        [reservation.rows[0].id_adherent, id_livres]
      );

      // Le livre repart directement en emprunt : il ne redevient donc PAS disponible
      await client.query('UPDATE livres SET disponible=FALSE WHERE id=$1', [id_livres]);

      // La reservation est marquee comme honoree
      await client.query(
        `UPDATE reservation SET statut='realisee' WHERE id=$1`,
        [reservation.rows[0].id]
      );
    } else {
      // Personne n'attendait ce livre : il redevient simplement disponible
      await client.query('UPDATE livres SET disponible=TRUE WHERE id=$1', [id_livres]);
    }

    await client.query('COMMIT');
    res.json(emprunts.rows[0]);
} catch (err) {
	await client.query('ROLLBACK');
	next(err);
} finally {
	client.release();
}
}

//lister tous les emprunts en retard --> non rendus et la date prévue depasser

exports.enretard= async (req,res,next)=>{
  try {
	const result= await pool.query(
    `SELECT e.*, a.nom AS adherent_nom, l.titre FROM  emprunts e
    JOIN adherents a ON a.id=e.id_adherent
    JOIN livres l ON l.id=e.id_livres
    WHERE e.date_retour_reelle IS NULL AND e.date_retour_prevue < CURRENT_DATE`
  );
    res.json(result.rows)
} catch (err) {
	next(err);
}
}

exports.exportRetardsCSV = async (req, res, next) => {
    try {
        const query = `
            SELECT e.id, a.nom AS adherent_nom, l.titre AS livre_titre,
                   e.date_emprunt, e.date_retour_prevue
            FROM emprunts e
            JOIN adherents a ON e.id_adherent = a.id
            JOIN livres l ON e.id_livres = l.id
            WHERE e.date_retour_reelle IS NULL
              AND e.date_retour_prevue < CURRENT_DATE
            ORDER BY e.date_retour_prevue
        `;
        const result = await pool.query(query);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Aucun emprunt en retard' });
        }

        const fields = ['id', 'adherent_nom', 'livre_titre', 'date_emprunt', 'date_retour_prevue'];
        const parser = new Parser({ fields });
        const csv = parser.parse(result.rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=emprunts_retard.csv');
        res.send(csv);
    } catch (err) {
        next(err);
    }
};

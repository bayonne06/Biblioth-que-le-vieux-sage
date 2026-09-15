const pool = require('../config/db.js');
//créer l'emprunt uniquement si le livre existe
const { Parser } = require('json2csv');
//créer une variable cont contenant le module json2csv pour l'export de notre liste d'emprunts en retards


exports.creer=async (req,res,next)=>{
  try {
	const {id_adherent,id_livres,date_retour_prevue}= req.body; //les données du formulaire
    const livres= await pool.query(
      `SELECT * FROM emprunts WHERE id=$1`, [id_livres]
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
  try {
	const {id}= req.params;
    const emprunts = await pool.query(
      `UPDATE emprunts SET date_retour_reelle= CURRENT_DATE
      WHERE id=$1 RETURNING *`,[id]
    );
    if(emprunts.rows.length===0){
      const e= new Error('emprunt introuvable');
      e.status=404;
      throw e;
    }
    await pool.query(
      `UPDATE livres SET disponible=TRUE 
      WHERE id=$1`,[emprunts.rows[0].id_livres]
    );
    // Récupérer la première réservation en attente pour ce livre
const reservation = await client.query(
    `SELECT id, id_adherent FROM reservation
     WHERE id_livres = $1 AND statut = 'en attente'
     ORDER BY date_reservation LIMIT 1`,
    [id_livres]
);
    if (reservation.rows.length > 0) {
    // On peut automatiquement créer un emprunt pour ce réservataire
    // ou simplement marquer la réservation comme réalisée sans emprunt automatique.
    // Pour l'exemple, on marque la réservation comme réalisée
    await client.query(
        'UPDATE reservation SET statut = $1 WHERE id = $2',
        ['realisee', reservation.rows[0].id]
    );
    // Option : créer un emprunt automatique avec une date de retour prévue (par exemple +14 jours)
    // Ici on laisse le choix à l'utilisateur de créer l'emprunt manuellement.
    }
    res.json(emprunts.rows[0]);
} catch (err) {
	next(err);
}
}

//lister tous les emprunts en retard --> non rendus et la date prévue depasser

exports.enRetard= async (req,res,next)=>{
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
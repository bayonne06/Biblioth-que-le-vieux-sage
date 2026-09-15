const pool = require('../config/db');

exports.creer= async (req,res,next)=>{
  const { id_adherent, id_livres } = req.body;
  const client = await pool.connect();
  try {
	await client.query('BEGIN');
    // verification si le livre existe et qu'il est disponible
    const livreResult= await client.query(
      `SELECT disponible FROM livres WHERE id=$1 FOR UPDATE`,[id_livres]
    );
    if (livreResult.rows.length === 0) {
            const err = new Error('Livre non trouvé');
            err.status = 404;
            throw err;
    }
    if (livreResult.rows[0].disponible) {
            const err = new Error('Ce livre est disponible, vous pouvez l’emprunter directement');
            err.status = 400;
            throw err;
    }
// Vérifier que l'adhérent existe
        const adherentCheck = await client.query('SELECT id FROM adherents WHERE id = $1', [id_adherent]);
        if (adherentCheck.rows.length === 0) {
            const err = new Error('Adhérent non trouvé');
            err.status = 404;
            throw err;
        }
    
// Vérifier que l'adhérent n'a pas déjà une réservation en attente pour ce livre
        const existing = await client.query(
            'SELECT id FROM reservation WHERE id_adherent = $1 AND id_livres = $2 AND statut = $3',
            [id_adherent, id_livres, 'en attente']
        );
        if (existing.rows.length > 0) {
            const err = new Error('Vous avez déjà une réservation en attente pour ce livre');
            err.status = 400;
            throw err;
}

        const result = await client.query(
            'INSERT INTO reservation (id_livres, id_livres) VALUES ($1, $2) RETURNING *',
            [id_adherent, id_livres]
        );

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);


    
} catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
  }
};

exports.annuler = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE reservation SET statut = $1 WHERE id = $2 AND statut = $3 RETURNING *',
            ['annulee', id, 'en_attente']
        );
        if (result.rows.length === 0) {
            const err = new Error('Réservation non trouvée ou déjà traitée');
            err.status = 404;
            return next(err);
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

exports.parLivre = async (req, res, next) => {
    const { id_livres } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.*, a.nom AS adherent_nom
             FROM reservation r
             JOIN adherents a ON r.id_adherent = a.id
             WHERE r.id_livres = $1 AND r.statut = 'en_attente'
             ORDER BY r.date_reservation`,
            [id_livres]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
};

exports.parAdherent = async (req, res, next) => {
    const { id_adherent } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.*, l.titre AS livre_titre
             FROM reservation r
             JOIN livres l ON r.id_livres = l.id
             WHERE r.id_adherent = $1 AND r.statut = 'en_attente'
             ORDER BY r.date_reservation`,
            [id_adherent]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
};
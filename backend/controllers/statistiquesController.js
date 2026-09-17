const pool= require('../config/db');

exports.liste= async (req,res,next)=>{
try {
	  //Nombre de livres
  const totalLivres=await pool.query(`SELECT COUNT(*)::int AS total FROM livres`);
  const totalAdherents=await pool.query(`SELECT COUNT(*) FROM adherents`);
  //Nombre d'emprunts encours
  const totalEmpruntEncours=await pool.query(`SELECT COUNT(*) FROM emprunts WHERE date_retour_reelle IS NULL`);

  //--- // en retard
  const totalEmpruntEnRetards= await pool.query(`SELECT COUNT(*) FROM emprunts WHERE date_retour_reelle IS NULL AND date_retour_prevue < CURRENT_DATE`);

  // Livre le plus emprunté
 const livrePlusEmprunte = await pool.query(`
 SELECT l.id, l.titre, COUNT(e.id) AS nb_emprunts
 FROM livres l
 JOIN emprunts e ON l.id = e.id_livres
 GROUP BY l.id
 ORDER BY nb_emprunts DESC
 LIMIT 1
 `);
 // Adhérent le plus actif
 const adherentPlusActif = await pool.query(`
 SELECT a.id, a.nom, COUNT(e.id) AS nb_emprunts
 FROM adherents a
 JOIN emprunts e ON a.id = e.id_adherent
 GROUP BY a.id
 ORDER BY nb_emprunts DESC
 LIMIT 1
 `);

  res.json({
    totalLivres:totalLivres.rows[0].total,
 totalAdherents:parseInt(totalAdherents.rows[0].count),
totalEmpruntEncours:parseInt(totalEmpruntEncours.rows[0].count),
    totalEmpruntEnRetards: parseInt(totalEmpruntEnRetards.rows[0].count),
    adherentPlusActif:adherentPlusActif.rows[0] || null,
    livrePlusEmprunte: livrePlusEmprunte.rows[0] || null
  });
} catch (err) {
	next(err);
}
}
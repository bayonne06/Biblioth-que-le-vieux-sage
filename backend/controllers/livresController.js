const pool = require('../config/db.js');


//lister les livres avec le nom de l'auteur et filtre plus pagination
exports.liste= async (req,res,next)=>{
  //par defaut si l'url ne contient pas de paramètre
  try {
	const {recherche='',page=1,limite=10,disponible,auteur_id}=req.query;
  const offset= (page-1)*limite;//saut de ligne avant la page voulu
    const searchTerm = `%${recherche}%`;
    let conditions = [];
    let params = [];
    let paramIndex = 1;
    //construction dynamique des conditions where
    
  if (search) {
        conditions.push(`(l.titre ILIKE $${paramIndex} OR a.nom ILIKE $${paramIndex})`);
        params.push(searchTerm);
        paramIndex++;
    }
    if (disponible !== undefined) {
        const isDispo = disponible === 'true';
        conditions.push(`l.disponible = $${paramIndex}`);
        params.push(isDispo);
        paramIndex++;
    }
    if (auteur_id) {
        conditions.push(`l.auteur_id = $${paramIndex}`);
        params.push(auteur_id);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const query = `
        SELECT l.*, a.nom AS auteur_nom
        FROM livre l
        JOIN auteur a ON l.auteur_id = a.id
        ${whereClause}
        ORDER BY l.titre
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM livre l
        JOIN auteur a ON l.auteur_id = a.id
        ${whereClause}
    `;

    const queryParams = [...params, limit, offset];
    try {
        const [rowsResult, countResult] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, params)
        ]);

        const total = parseInt(countResult.rows[0].total);
        res.json({
            data: rowsResult.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
  });
} catch (err) {
	next(err);
}
}

exports.creer= async (req,res,next)=>{
  const {titre,annee_publication,auteur_id}= req.body;

  try {
	const auteurCheck=await pool.query(`SELECT id FROM auteurs WHERE id=$1`,[auteur_id]);
    if(auteurCheck.rows.length===0){
      const e = new Error ("Auteur non existant");
      e.status=400;
      return next(e);
    }
    
    const result = await pool.query(`INSERT INTO livres(titre,annee_publication,auteur_id) VALUES ($1, $2, $3) RETURNING *`, [titre,annee_publication,auteur_id]);
   res.status(201).json(result.rows[0]);
} catch (err) {
	next(err);
}
}

exports.modifier= async (req,res,next)=>{
  const {id}=req.params;
  const {titre,annee_publication,auteur_id}= req.body;

  try {
	const auteurCheck=await pool.query(`SELECT id FROM auteurs WHERE id=$1`,[auteur_id]);
    if(auteurCheck.rows.length===0){
      const e = new Error ("Auteur non existant");
      e.status=400;
      return next(e);
    }
    
    const result = await pool.query(`UPDATE livres SET titre=$1,annee_publication=$2,auteur_id=$3 WHERE id=$4 RETURNING * `, [titre,annee_publication,auteur_id,id]);
   res.status(200).json(result.rows[0]);
} catch (err) {
	next(err);
}
}

exports.supprimer= async (req,res,next)=>{
  try {
    const test=false;
    const checkLivre= await pool.query(`SELECT disponible FROM livres WHERE id=$1`,[req.params.id]);
    if(checkLivre.rows.length===0){
      const e= new Error ("Livre introuvable");
      e.status=404;
      return next(e);
    }
    if(checkLivre.rows[0].disponible===test){
      const e= new Error ("Le livre est en cours d'emprunt, donc impossible de supprimer");
      e.status=400;
      return next(e);
    }
	await pool.query(`DELETE FROM livres WHERE id=$1 `, [req.params.id]);
    res.status(204).end()
} catch (err) {
	next(err);
}
}
const pool = require('../config/db'); //connexion a la base Postgresql


//recupération de tous les auteurs, trié par nom 
exports.liste= async (req,res,next)=> {
  try {
	const result=await pool.query(`SELECT * FROM auteurs ORDER BY nom`); //requête sql
res.json(result.rows); //renvoi une reponse contenant un tableau de ligne en json
} catch (err) {
	next(err); //en cas d'erreur, transmission dans la gestion d'erreurs
}
}

//création d'un nouveau auteurs
exports.creer=async (req,res,next)=>{
  try {
	const {nom,nationalite}=req.body; //recupération des champs envoyé dans la requête
  if(!nom){ //vérification et validation minimale
    const e= new Error ('le nom est obligatoire');
    e.status=400;
    throw e;}
    const result = await pool.query('INSERT INTO  auteurs(nom,nationalite) VALUES ($1,$2) RETURNING *',[nom,nationalite]); //empêche les injections sql $1 $2
    res.status(201).json(result.rows[0]); //ressource créer
} catch (err) {
	next(err)
}
  }

// modifier un auteurs à partir de son id
exports.modifier= async (req,res,next)=>{
  try {
	const {id}=req.params //l'id present dans l'Url /api/:id
  const {nom,nationalite}=req.body //les valeurs envoyé
    const result=await pool.query(`UPDATE auteurs SET nom=$1, nationalite=$2 WHERE id=$3 RETURNING *`,[nom,nationalite,id]);
    if(result.rows.length===0)//aucun auteurs a cet id
    {
      const e= new Error ('auteur introuvable');
      e.status=404; //code http non trouver
      throw e;
    }
    res.json(result.rows[0]); //renvoie l'auteur modifier
} catch (err) {
	next(err);
}
}

//suprimer un auteur à partir de son id
exports.supprimer= async (req,res,next)=>{
  try {
	await pool.query(`DELETE FROM auteurs WHERE id=$1 `, [req.params.id]);
    res.status(204).end()
} catch (err) {
	next(err);
}
}
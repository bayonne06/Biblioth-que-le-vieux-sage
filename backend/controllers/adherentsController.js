//const pool =require('../config/db.js');

const pool = require('../config/db'); //connexion a la base Postgresql


//recupération de tous les auteurs, trié par nom 
exports.liste= async (req,res,next)=> {
  try {
	const result=await pool.query(`SELECT * FROM adherents ORDER BY nom`); //requête sql
res.json(result.rows); //renvoi une reponse contenant un tableau de ligne en json
} catch (err) {
	next(err); //en cas d'erreur, transmission dans la gestion d'erreurs
}
}

//création d'un nouveau auteurs
exports.creer=async (req,res,next)=>{
  try {
	const {nom,contact}=req.body; //recupération des champs envoyé dans la requête
  if(!nom){ //vérification et validation minimale
    const e= new Error ('le nom est obligatoire');
    e.status=400;
    throw e;}
    const result = await pool.query(`INSERT INTO  adherents(nom,contact) VALUES ($1,$2) RETURNING *`,[nom,contact]); //empêche les injections sql $1 $2
    res.status(201).json(result.rows[0]); //ressource créer
} catch (err) {
	next(err)
}
  }

// modifier un auteurs à partir de son id
exports.modifier= async (req,res,next)=>{
  try {
	const {id}=req.params //l'id present dans l'Url /api/:id
  const {nom,contact}=req.body //les valeurs envoyé
    const result=await pool.query(`UPDATE adherents SET nom=$1 ,contact=$2 WHERE id=$3 RETURNING *`,[nom,contact,id]);
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
	await pool.query(`DELETE FROM adherents WHERE id=$1 `, [req.params.id]);
    res.status(204).end()
} catch (err) {
	next(err);
}
}
exports.historique= async (req, res, next)=>{
  
  try {
	const {id}= req.params;
    const result = await pool.query(
      `SELECT e.id, l.titre, e.date_emprunt, e.date_retour_prevu, e.date_retour_prevenu FROM emprunt e JOIN livres  l ON l.id =e.id_livres WHERE e.id_adherent = $1 ORDER BY e.date_emprunt DESC`,[id]);
  res.json(result.rows);  
} catch (err) {
next(err);
}
}
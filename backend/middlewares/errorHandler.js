//intercepte toutes les erreurs transmises par next(err)

module.exports= (req,res,next)=>{
  console.error(error);

  const status= err.status || 500;
  res.status(status).json({
    erreur: err.message || "erreur serveur Bibliothèque",
  });
};
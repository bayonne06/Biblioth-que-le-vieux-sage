module.exports= (req,res,next)=>{
  const debut = Date.now(); //enregistre l'heure d'arrivé de la requete

  res.on('finish',()=>{
    const duree= Date.now()-debut;
    console.log(`${req.method} ${req.originalUrl} ---> ${res.statusCode} (${duree}ms)`);
    //exemple affiche : GET /api/livres -> 200 (12ms)
  });
  next();
}
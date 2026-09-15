const router = require('express').Router(); //création d'un route dédier
const ctrlStat= require('../controllers/statistiquesController'); //import du fichier auteursController

router.get('/', ctrlStat.liste); //Get 
module.exports=router;
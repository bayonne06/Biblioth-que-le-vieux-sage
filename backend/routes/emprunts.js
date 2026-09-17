const router = require('express').Router(); //création d'un route dédier
const ctrlEmprunt = require('../controllers/empruntsController'); //import du fichier empruntsController

router.get('/', ctrlEmprunt.liste);                       //GET /api/emprunts -> emprunts en cours
router.get('/enretard', ctrlEmprunt.enretard);             //GET /api/emprunts/enretard -> emprunts en retard
router.get('/enretard/csv', ctrlEmprunt.exportRetardsCSV); //GET /api/emprunts/enretard/csv -> export CSV
router.post('/', ctrlEmprunt.creer);                       //POST /api/emprunts -> creer un emprunt
router.put('/:id/retour', ctrlEmprunt.retour);             //PUT /api/emprunts/:id/retour -> enregistrer un retour

module.exports = router;

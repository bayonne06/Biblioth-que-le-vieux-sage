const router = require('express').Router(); //création d'un route dédier
const ctrlEmprunt = require('../controllers/empruntsController'); //import du fichier auteursController

router.get('/', ctrlEmprunt.enRetard); //Get /api/auteurs liste tout les auteurs
router.post('/', ctrlEmprunt.creer); //Post /api/auteurs crée un auteur
router.put('/:id', ctrlEmprunt.retour); //put /api/auteurs/:id modifier un auteur
router.get('/en-retard/csv', ctrlEmprunt.exportRetardsCSV);

module.exports= router;
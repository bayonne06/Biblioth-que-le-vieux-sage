const router = require('express').Router(); //création d'un route dédier
const ctrlLivres = require('../controllers/livresController'); //import du fichier auteursController

router.get('/', ctrlLivres.liste); //Get /api/auteurs liste tout les auteurs
router.post('/', ctrlLivres.creer); //Post /api/auteurs crée un auteur
router.put('/:id', ctrlLivres.modifier); //put /api/auteurs/:id modifier un auteur
router.delete('/:id', ctrlLivres.supprimer); //delete /api/auteurs/:id supprimer un auteur

//lister l'historique d'emprunt de l'adherent
module.exports= router; //exporter pour une utilisation dans le fichier server.js
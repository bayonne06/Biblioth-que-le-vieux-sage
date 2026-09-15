const router = require('express').Router(); //création d'un route dédier
const ctrlAuteur = require('../controllers/auteursController.js'); //import du fichier auteursController

router.get('/', ctrlAuteur.liste); //Get /api/auteurs liste tout les auteurs
router.post('/', ctrlAuteur.creer); //Post /api/auteurs crée un auteur
router.put('/:id', ctrlAuteur.modifier); //put /api/auteurs/:id modifier un auteur
router.delete('/:id', ctrlAuteur.supprimer); //delete /api/auteurs/:id supprimer un auteur

module.exports= router; //exporter pour une utilisation dans le fichier server.js
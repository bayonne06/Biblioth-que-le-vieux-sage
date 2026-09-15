const router = require('express').Router();
const ctrl = require('../controllers/adherentsController')

router.get('/', ctrl.liste); //Get /api/auteurs liste tout les auteurs
router.post('/', ctrl.creer); //Post /api/auteurs crée un auteur
router.put('/:id', ctrl.modifier); //put /api/auteurs/:id modifier un auteur
router.delete('/:id', ctrl.supprimer); //delete /api/auteurs/:id supprimer un auteur
router.get('/:id', ctrl.historique);
//lister l'historique d'emprunt de l'adherent
module.exports= router; //exporter pour une utilisation dans le fichier server .js
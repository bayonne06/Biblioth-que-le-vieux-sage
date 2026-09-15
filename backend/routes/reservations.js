const express= require('express');
const router= new express.Router();
const ctrl= require('../controllers/reservationsController');

router.post('/',ctrl.creer);
router.delete('/:id', ctrl.annuler);
route.get('/livres/id_livres/:id', ctrl.parLivre);
route.get('/adherents/id_adheren/:id',ctrl.parAdherent);

module.exports= router;
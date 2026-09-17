const router = require('express').Router();
const ctrl = require('../controllers/reservationsController');

router.post('/', ctrl.creer);                              // POST /api/reservations -> reserver un livre
router.delete('/:id', ctrl.annuler);                        // DELETE /api/reservations/:id -> annuler
router.get('/livre/:id_livres', ctrl.parLivre);              // GET /api/reservations/livre/:id_livres
router.get('/adherent/:id_adherent', ctrl.parAdherent);      // GET /api/reservations/adherent/:id_adherent

module.exports = router;

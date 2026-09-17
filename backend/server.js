require('dotenv').config();
const express = require('express');
const app = express();

const logger = require('./middlewares/logger'); // le middlewares pour la journalisation
const errorHandler = require('./middlewares/errorHandler'); //middlewares pour la gestion d'erreurs

app.use(express.json()); //pour lire le json envoyé par la requête >> req.body

app.use(logger); //active le logger sur toutes les requêtes

//branche les routes adherents
app.use('/api/adherents', require('./routes/adherents'));
app.use('/api/auteurs', require('./routes/auteurs')); //branche les routes auteurs
app.use('/api/emprunts', require('./routes/emprunts')); //branche  les routes emprunts
app.use('/api/livres', require('./routes/livres')); //branches les routes livres
app.use('/api/reservations', require('./routes/reservations')); //branche les routes reservations
app.use('/api/statistiques', require('./routes/statistiques')); //branches les routes statistiques

const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(errorHandler); // toujours en dernier pour capter toutes les erreurs

const PORT = process.env.PORT || 3000; // port lu depuis le fichier .env

app.listen(PORT, () => {
  console.log(`le serveur demarre sur le port ${PORT}`);
});

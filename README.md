# Bibliothèque Le Vieux Sage

Application de gestion d'une bibliothèque de quartier — gestion des auteurs, des adhérents,
des livres et des emprunts, avec statistiques et système de réservation.

Projet réalisé dans le cadre du Module 3 — Akieni Academy, Cohorte 2 (Semaines 14-15).

## Stack technique

- **Backend** : Node.js, Express, PostgreSQL (module `pg`)
- **Frontend** : HTML / CSS / JavaScript natif (aucun framework), communication avec l'API via `fetch()`
- **Base de données** : PostgreSQL

## Structure du projet

```
Bibliotheque-le-vieux-sage/
├── database/
│   ├── schema.sql          <- script de création des tables
│   └── diagramme-er.png    <- diagramme entité-relation
├── backend/
│   ├── config/db.js        <- connexion PostgreSQL
│   ├── routes/              <- déclaration des URLs
│   ├── controllers/         <- logique métier
│   ├── middlewares/         <- logger, gestion d'erreurs
│   ├── .env                 <- identifiants (jamais versionné)
│   └── server.js            <- point d'entrée
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/                  <- un fichier par domaine (auteurs, adherents, livres, emprunts, reservations, statistiques)
├── package.json
└── README.md
```

## Installation

### 1. Prérequis
- Node.js (v18 ou plus)
- PostgreSQL, démarré et accessible

### 2. Cloner le dépôt et installer les dépendances
```bash
git clone <url-du-depot>
cd Bibliotheque-le-vieux-sage
npm install
```

### 3. Configurer les variables d'environnement
Copier `.env.example` vers `backend/.env` et renseigner tes propres identifiants PostgreSQL :
```bash
cp .env.example backend/.env
```

Contenu de `.env.example` :
```
PGHOST=localhost
PGPORT=5432
PGUSER=ton_utilisateur
PGPASSWORD=ton_mot_de_passe
PGDATABASE=bibliotheque
PORT=3000
```

### 4. Créer la base de données et charger le schéma
```bash
createdb bibliotheque
psql -d bibliotheque -f database/schema.sql
```

### 5. Démarrer le serveur
```bash
cd backend
node server.js
```

Le frontend est servi automatiquement par Express : ouvre **http://localhost:3000/** dans le navigateur.

## Choix de modélisation

- **`livres.disponible`** (booléen) évite une table de statuts séparée : un livre est soit
  disponible, soit emprunté, jamais les deux.
- **`emprunts.date_retour_reelle`** reste `NULL` tant que le livre n'est pas rendu. C'est cette
  colonne, combinée à `date_retour_prevue` et à la date du jour, qui permet de calculer un
  retard sans avoir besoin d'un champ « statut » redondant à maintenir à la main.
- **`reservation`** modélise la file d'attente sur un livre déjà emprunté : quand un emprunt est
  retourné, la réservation la plus ancienne (`date_reservation` la plus petite) est
  automatiquement transformée en nouvel emprunt pour l'adhérent concerné.
- Toutes les clés étrangères vers `auteurs`, `adherents` et `livres` utilisent `ON DELETE
  CASCADE` ou `ON DELETE SET NULL` selon le cas, pour garder la base cohérente même après une
  suppression.

## Fonctionnalités

### Cœur du sujet
- CRUD complet sur auteurs, adhérents et livres (créer, lire, modifier, supprimer)
- Création d'un emprunt (refusée si le livre est déjà emprunté)
- Retour d'un livre, avec la date de retour réelle **modifiable par l'utilisateur** (un retour
  avant la date prévue est toujours accepté ; seules une date future ou une date antérieure à
  l'emprunt sont refusées)
- Détection automatique des emprunts en retard
- Recherche de livres par titre ou nom d'auteur, avec pagination
- Middlewares : journalisation des requêtes, gestion centralisée des erreurs



### 📖 Livres
- Liste paginée (10 par page)
- Recherche par titre ou nom d'auteur (debounce 300 ms)
- Filtre **Tous / Disponibles / Empruntés**
- Création, modification, suppression
- Suppression refusée si le livre est en cours d'emprunt

### ✍️ Auteurs
- Liste, création, modification, suppression
- Suppression refusée si l'auteur a encore des livres (contrainte FK)

### 👥 Adhérents
- Liste, création, modification, suppression
- **Historique des emprunts** par adhérent (panneau déroulant)

### 📅 Emprunts
- Enregistrement d'un emprunt (livre disponible + adhérent + date retour prévue)
- Retour avec date réelle (peut être antérieure à la date prévue)
- Détection automatique des retards (affichage en rouge)

### 🔖 Réservations
- Réservation d'un livre déjà emprunté
- File d'attente consultable par livre
- Annulation d'une réservation

### 📊 Tableau de bord
- Total livres / adhérents
- Emprunts en cours / en retard
- Livre le plus emprunté
- Adhérent le plus actif
- **Mise à jour automatique** après chaque action (CRUD livre, adhérent, emprunt)

---

## 🎨 Thème

Bascule **clair / sombre** via un bouton en haut à droite.
Le choix est sauvegardé dans `localStorage` ; sinon le thème système est utilisé.

---

### Bonus implémentés
- **Système de réservation** (file d'attente) sur un livre déjà emprunté, avec attribution
  automatique du livre au premier de la file lors du retour
- **Export CSV** de la liste des emprunts en retard (`GET /api/emprunts/enretard/csv`)
- **Notifications visuelles** (toasts) après chaque action réussie côté frontend
- **Filtrage des livres par disponibilité**, côté backend (`?disponible=true|false`) et
  côté frontend (menu déroulant dans la section Livres)
- Thème clair / sombre, mémorisé entre les visites

## Tests

Le projet a été testé manuellement via `httpie` (Termux) et Postman, en couvrant les cas
valides et les cas d'erreur (champs manquants, ressources inexistantes, livre déjà emprunté,
dates de retour invalides).


## 🛠️ Points techniques

- **API REST** : toutes les routes sont sous `/api`
- **Réponses JSON** : `204 No Content` pour les suppressions
- **Erreurs** : format `{ erreur: "message" }`, code HTTP approprié
- **Frontend sans framework** : manipulation DOM directe + `fetch`
- **Modale de confirmation personnalisée** (remplace `confirm()` natif)
- **Toasts** : notifications en haut de page, disparition auto après 3 s
- **Scripts en `defer`** : tous les `addEventListener` sont attachés après le parsing DOM

---

## 🐛 Corrections récentes

- ✅ Les scripts sont chargés avec `defer` → plus de `TypeError: null is not an object` au démarrage
- ✅ Ajout du `<select id="livre-filtre-disponible">` manquant → la section Livres fonctionne
- ✅ Bouton **Fermer** de l'historique adhérent opérationnel
- ✅ Statistiques mises à jour dynamiquement après création/suppression de livres, adhérents et emprunts
- ✅ Remplacement de `confirm()` par une modale stylée **Oui / Non**
- ✅ `COUNT(*)::int` côté SQL pour éviter la sérialisation en string
- ✅ Échappement HTML (`echapperHtml`) pour les noms contenant `'`, `"`, `&`

---

## 📝 Licence

Projet pédagogique — libre d'utilisation.
```



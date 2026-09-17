DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS emprunts;
DROP TABLE IF EXISTS livres;
DROP TABLE IF EXISTS adherents;
DROP TABLE IF EXISTS auteurs;

--table d'auteurs: un auteur peut avoir plusieurs livres
create table auteurs(
  id serial primary key,
  nom varchar(150) not null,
  nationalite varchar(50)
  );

--la table des adherents: les personnes inscrites
create table adherents(
  id serial primary key,
  nom varchar(150) not null,
  contact varchar(50) -- email ou numero de telephone
  );

--la table des livres: un livre appartient qu'a un seul auteur
create table livres(
  id serial primary key,
  titre varchar(150) not null,
  auteur_id integer references auteurs(id) on delete set null, --devient vide si l'auteur est supprimer
  annee_publication integer,
  disponible boolean not null default true -- disponible= vrai et emprunte= faux
  );

--la table emprunt : un adherent est relie a un livre sur une duree donnee
create table emprunts(
  id serial primary key,
  id_adherent integer references adherents(id) on delete cascade, -- l'emprunt est directement supprime si l'adherent lie est supprime
  id_livres integer references livres(id) on delete cascade, --de meme si le livre est supprime
  date_emprunt date not null default current_date, -- date de l'emprunt = aujourd'hui par defaut
  date_retour_prevue date not null, --date a laquelle le livre doit revenir
  date_retour_reelle date --reste null tant que le livre n'est pas rendu
  );

--table des reservations : file d'attente sur un livre deja emprunte
create table reservation (
  id serial primary key,
  id_adherent integer not null references adherents(id) on delete cascade,
  id_livres integer not null references livres(id) on delete cascade,
  date_reservation date not null default current_date,
  statut varchar(20) not null default 'en attente' -- 'en attente', 'annulee', 'realisee'
  );

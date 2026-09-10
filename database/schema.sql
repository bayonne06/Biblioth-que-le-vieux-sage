--table d'auteurs: un auteur peut avoir plusieurs livres
create table auteurs{
  id serial primary key,
  nom varchar(150) not null,
  nationalite varchar(50)
  };

--la table des adhérents: les personnes inscrites
create table adherents{
  id serial primary key,
  nom varchar(150) not null,
  contact varchar(50) -- email ou numéro de téléphine
  };

--la table des livres: un livre appartient qu'à un seul auteur
create table livre{
  id serial primary key,
  titre varchar(150) not null,
  auteur_id integer references auteurs(id) on delete set null, --devient vide si l'auteur est supprimer
  annee_publication integer,
  disponible boolean not null default true, -- disponible= vrai et emprunté= faux
  };

--la table emprunt : un adhérent est relier à un livre sur une durée donné

create table emprunts{
  id serial primary key,
  id_adherent integer references adherents(id) on delete cascade, -- l'emprunt est directement supprimer si l'adhérent lier est supprimer
  id_livres integer references livres(id) on delete cascade, --de même est supprimer
  date_emprunt date not null default current_date, -- la date de l'emprunt du livre = par default la date d'aujourd'hui
  date_retour_prevue date not null, --date à laquelle le livre doit revenir
  date_retour_reelle date --reste null tant que le livre n'est pas rendu
  };


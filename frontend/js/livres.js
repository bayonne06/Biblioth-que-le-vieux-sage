// ============================================================
// livres.js — section "Livres" (CRUD complet, recherche,
// pagination, filtre disponible/non)
// ============================================================

let livresPage = 1;
let livresRecherche = '';
let livresFiltreDisponible = ''; // '' = tous, 'true' = disponibles, 'false' = empruntes
let livreEnEdition = null;

async function chargerLivres() {
  const corps = document.getElementById('livres-corps');
  corps.innerHTML = '<tr><td colspan="5" class="chargement">Chargement…</td></tr>';

  try {
    const params = { recherche: livresRecherche, page: livresPage, limite: 10 };
    if (livresFiltreDisponible !== '') params.disponible = livresFiltreDisponible;

    const reponse = await api.listerLivres(params);
    const livres = reponse.data || [];
    const totalPages = reponse.pagination ? reponse.pagination.totalPages : 1;

    corps.innerHTML = livres.length
      ? livres.map((l) => `
          <tr>
            <td>${l.titre}</td>
            <td>${l.auteur_nom || '—'}</td>
            <td>${l.annee_publication || '—'}</td>
            <td class="${l.disponible ? 'statut-disponible' : 'statut-emprunte'}">
              ${l.disponible ? 'Disponible' : 'Emprunté'}
            </td>
            <td>
              <button class="action-retour" onclick='modifierLivreDepuisListe(${l.id}, ${JSON.stringify(l.titre)}, ${l.auteur_id}, ${l.annee_publication || 'null'})'>Modifier</button>
              <button class="action-annuler" onclick="supprimerLivre(${l.id})">Supprimer</button>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="5">Aucun livre ne correspond à cette recherche.</td></tr>';

    afficherPaginationLivres(totalPages);
  } catch (erreur) {
    corps.innerHTML = `<tr><td colspan="5" class="message-erreur">${erreur.message}</td></tr>`;
  }

  chargerLivresDisponiblesPourEmprunt();
  chargerLivresEmpruntesPourReservation();
}

function afficherPaginationLivres(totalPages) {
  const conteneur = document.getElementById('livres-pagination');
  if (!totalPages || totalPages <= 1) {
    conteneur.innerHTML = '';
    return;
  }
  conteneur.innerHTML = `
    <button id="page-precedente" ${livresPage <= 1 ? 'disabled' : ''}>Précédent</button>
    <span>Page ${livresPage} / ${totalPages}</span>
    <button id="page-suivante" ${livresPage >= totalPages ? 'disabled' : ''}>Suivant</button>
  `;
  document.getElementById('page-precedente')?.addEventListener('click', () => {
    livresPage -= 1;
    chargerLivres();
  });
  document.getElementById('page-suivante')?.addEventListener('click', () => {
    livresPage += 1;
    chargerLivres();
  });
}

let delaiRechercheLivres;
document.getElementById('livre-recherche').addEventListener('input', (e) => {
  clearTimeout(delaiRechercheLivres);
  delaiRechercheLivres = setTimeout(() => {
    livresRecherche = e.target.value;
    livresPage = 1;
    chargerLivres();
  }, 300);
});

// Filtre "Disponible / Emprunte / Tous" — cote backend via ?disponible=
document.getElementById('livre-filtre-disponible').addEventListener('change', (e) => {
  livresFiltreDisponible = e.target.value;
  livresPage = 1;
  chargerLivres();
});

function modifierLivreDepuisListe(id, titre, auteurId, anneePublication) {
  livreEnEdition = id;
  document.getElementById('livre-titre').value = titre;
  document.getElementById('livre-auteur').value = auteurId;
  document.getElementById('livre-annee').value = anneePublication || '';
  document.getElementById('livre-titre-formulaire').textContent = 'Modifier le livre';
  document.getElementById('livre-bouton-submit').textContent = 'Enregistrer les modifications';
  document.getElementById('livre-annuler-edition').classList.remove('masque');
  document.getElementById('livre-titre').focus();
}

function annulerEditionLivre() {
  livreEnEdition = null;
  document.getElementById('form-livre').reset();
  document.getElementById('livre-titre-formulaire').textContent = 'Ajouter un livre';
  document.getElementById('livre-bouton-submit').textContent = 'Ajouter le livre';
  document.getElementById('livre-annuler-edition').classList.add('masque');
}

document.getElementById('livre-annuler-edition').addEventListener('click', annulerEditionLivre);

document.getElementById('form-livre').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titre = document.getElementById('livre-titre').value;
  const auteur_id = document.getElementById('livre-auteur').value;
  const annee_publication = document.getElementById('livre-annee').value || null;
  document.getElementById('livre-erreur').textContent = '';

  try {
    if (livreEnEdition) {
      await api.modifierLivre(livreEnEdition, { titre, auteur_id, annee_publication });
      afficherToast('Livre modifié avec succès.');
      annulerEditionLivre();
    } else {
      await api.creerLivre({ titre, auteur_id, annee_publication });
      afficherToast('Livre ajouté avec succès.');
      e.target.reset();
    }
    chargerLivres();
    chargerStatistiques();
  } catch (erreur) {
    afficherErreurFormulaire('livre-erreur', erreur);
  }
});

async function supprimerLivre(id) {
  const ok = await confirmer('Voulez-vous supprimer ce livre ?');
  if (!ok) return;
  try {
    await api.supprimerLivre(id);
    afficherToast('Livre supprimé.');
    chargerLivres();
    chargerStatistiques();
  } catch (erreur) {
    afficherToast(erreur.message, 'erreur');
  }
}

async function chargerLivresDisponiblesPourEmprunt() {
  try {
    const reponse = await api.listerLivres({ disponible: 'true', limite: 100 });
    const livres = reponse.data || [];
    const select = document.getElementById('emprunt-livre');
    select.innerHTML = livres.length
      ? livres.map((l) => `<option value="${l.id}">${l.titre}</option>`).join('')
      : '<option value="">Aucun livre disponible</option>';
  } catch (erreur) {
    // Silencieux : ce select n'est qu'un confort
  }
}

async function chargerLivresEmpruntesPourReservation() {
  try {
    const reponse = await api.listerLivres({ disponible: 'false', limite: 100 });
    const livres = reponse.data || [];
    const options = livres.length
      ? livres.map((l) => `<option value="${l.id}">${l.titre}</option>`).join('')
      : '<option value="">Aucun livre emprunte pour l’instant</option>';

    document.getElementById('reservation-livre').innerHTML = options;
    document.getElementById('reservation-filtre-livre').innerHTML =
      '<option value="">— choisir un livre —</option>' + options;
  } catch (erreur) {
    // Silencieux
  }
}

// ============================================================
// adherents.js — section "Adherents" (CRUD complet + historique)
// ============================================================

let adherentEnEdition = null;
let cacheAdherents = {}; // id -> {nom, contact}

async function chargerAdherents() {
  const corps = document.getElementById('adherents-corps');
  try {
    const adherents = await api.listerAdherents();
    cacheAdherents = {};
    adherents.forEach(a => { cacheAdherents[a.id] = a; });

    corps.innerHTML = adherents.length
      ? adherents.map((a) => `
          <tr>
            <td>${echapperHtml(a.nom)}</td>
            <td>${echapperHtml(a.contact || '—')}</td>
            <td>
              <button class="action-retour" data-action="historique" data-id="${a.id}">Historique</button>
              <button class="action-retour" data-action="modifier" data-id="${a.id}">Modifier</button>
              <button class="action-annuler" data-action="supprimer" data-id="${a.id}">Supprimer</button>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="3">Aucun adhérent inscrit pour l’instant.</td></tr>';

    remplirSelectAdherents(adherents);
  } catch (erreur) {
    corps.innerHTML = `<tr><td colspan="3" class="message-erreur">${erreur.message}</td></tr>`;
  }
}

function remplirSelectAdherents(adherents) {
  document.querySelectorAll('.select-adherents').forEach((select) => {
    select.innerHTML = adherents.map((a) => `<option value="${a.id}">${a.nom}</option>`).join('');
  });
}

function modifierAdherentDepuisListe(id, nom, contact) {
  adherentEnEdition = id;
  document.getElementById('adherent-nom').value = nom;
  document.getElementById('adherent-contact').value = contact;
  document.getElementById('adherent-titre-formulaire').textContent = 'Modifier l’adhérent';
  document.getElementById('adherent-bouton-submit').textContent = 'Enregistrer les modifications';
  document.getElementById('adherent-annuler-edition').classList.remove('masque');
  document.getElementById('adherent-nom').focus();
}

function annulerEditionAdherent() {
  adherentEnEdition = null;
  document.getElementById('form-adherent').reset();
  document.getElementById('adherent-titre-formulaire').textContent = 'Inscrire un adhérent';
  document.getElementById('adherent-bouton-submit').textContent = 'Inscrire l’adhérent';
  document.getElementById('adherent-annuler-edition').classList.add('masque');
}

document.getElementById('adherent-annuler-edition').addEventListener('click', annulerEditionAdherent);

document.getElementById('form-adherent').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nom = document.getElementById('adherent-nom').value;
  const contact = document.getElementById('adherent-contact').value;
  document.getElementById('adherent-erreur').textContent = '';

  try {
    if (adherentEnEdition) {
      await api.modifierAdherent(adherentEnEdition, { nom, contact });
      afficherToast('Adhérent modifié avec succès.');
      annulerEditionAdherent();
    } else {
      await api.creerAdherent({ nom, contact });
      afficherToast('Adhérent inscrit avec succès.');
      e.target.reset();
    }
    chargerAdherents();
  } catch (erreur) {
    afficherErreurFormulaire('adherent-erreur', erreur);
  }
});

async function supprimerAdherent(id) {
  const ok = await confirmer('Voulez-vous supprimer cet adhérent ?');
  if (!ok) return;
  try {
    await api.supprimerAdherent(id);
    afficherToast('Adhérent supprimé.');
    chargerAdherents();
  } catch (erreur) {
    afficherToast(erreur.message, 'erreur');
  }
}

// Affiche le panneau d'historique d'un adherent (liste de ses emprunts)
async function voirHistorique(id, nom) {
  const panneau = document.getElementById('historique-panneau');
  const corps = document.getElementById('historique-corps');
  document.getElementById('historique-titre').textContent = `Historique de ${nom}`;
  panneau.classList.remove('masque');
  corps.innerHTML = '<tr><td colspan="4" class="chargement">Chargement…</td></tr>';

  try {
    const historique = await api.historiqueAdherent(id);
    corps.innerHTML = historique.length
      ? historique.map((h) => `
          <tr>
            <td>${h.titre}</td>
            <td>${formaterDate(h.date_emprunt)}</td>
            <td>${formaterDate(h.date_retour_prevue)}</td>
            <td>${h.date_retour_reelle ? formaterDate(h.date_retour_reelle) : '— pas encore rendu —'}</td>
          </tr>`).join('')
      : '<tr><td colspan="4">Aucun emprunt pour cet adhérent.</td></tr>';
  } catch (erreur) {
    corps.innerHTML = `<tr><td colspan="4" class="message-erreur">${erreur.message}</td></tr>`;
  }
}


document.getElementById('adherents-corps').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const adherent = cacheAdherents[id];
  if (!adherent) return;

  if (btn.dataset.action === 'historique') voirHistorique(id, adherent.nom);
  if (btn.dataset.action === 'modifier')   modifierAdherentDepuisListe(id, adherent.nom, adherent.contact || '');
  if (btn.dataset.action === 'supprimer')  supprimerAdherent(id);
});


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adherent-annuler-edition').addEventListener('click', annulerEditionAdherent);
  document.getElementById('historique-fermer').addEventListener('click', () => {
    document.getElementById('historique-panneau').classList.add('masque');
  });
});
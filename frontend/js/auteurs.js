// ============================================================
// auteurs.js — section "Auteurs" (liste, creation, modification, suppression)
// ============================================================

let auteurEnEdition = null; // null = mode creation, sinon id de l'auteur modifie

async function chargerAuteurs() {
  const corps = document.getElementById('auteurs-corps');
  try {
    const auteurs = await api.listerAuteurs();
    corps.innerHTML = auteurs.length
      ? auteurs.map((a) => `
          <tr>
            <td>${a.nom}</td>
            <td>${a.nationalite || '—'}</td>
            <td>
              <button class="action-retour" onclick='modifierAuteurDepuisListe(${a.id}, ${JSON.stringify(a.nom)}, ${JSON.stringify(a.nationalite || "")})'>Modifier</button>
              <button class="action-annuler" onclick="supprimerAuteur(${a.id})">Supprimer</button>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="3">Aucun auteur enregistré pour l’instant.</td></tr>';

    remplirSelectAuteurs(auteurs);
  } catch (erreur) {
    corps.innerHTML = `<tr><td colspan="3" class="message-erreur">${erreur.message}</td></tr>`;
  }
}

// Remplit le menu deroulant "Auteur" du formulaire d'ajout de livre
function remplirSelectAuteurs(auteurs) {
  const select = document.getElementById('livre-auteur');
  if (select) {
    select.innerHTML = auteurs.map((a) => `<option value="${a.id}">${a.nom}</option>`).join('');
  }
}

function modifierAuteurDepuisListe(id, nom, nationalite) {
  auteurEnEdition = id;
  document.getElementById('auteur-nom').value = nom;
  document.getElementById('auteur-nationalite').value = nationalite;
  document.getElementById('auteur-titre-formulaire').textContent = 'Modifier l’auteur';
  document.getElementById('auteur-bouton-submit').textContent = 'Enregistrer les modifications';
  document.getElementById('auteur-annuler-edition').classList.remove('masque');
  document.getElementById('auteur-nom').focus();
}

function annulerEditionAuteur() {
  auteurEnEdition = null;
  document.getElementById('form-auteur').reset();
  document.getElementById('auteur-titre-formulaire').textContent = 'Ajouter un auteur';
  document.getElementById('auteur-bouton-submit').textContent = 'Ajouter l’auteur';
  document.getElementById('auteur-annuler-edition').classList.add('masque');
}

document.getElementById('auteur-annuler-edition').addEventListener('click', annulerEditionAuteur);

document.getElementById('form-auteur').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nom = document.getElementById('auteur-nom').value;
  const nationalite = document.getElementById('auteur-nationalite').value;
  document.getElementById('auteur-erreur').textContent = '';

  try {
    if (auteurEnEdition) {
      await api.modifierAuteur(auteurEnEdition, { nom, nationalite });
      afficherToast('Auteur modifié avec succès.');
      annulerEditionAuteur();
    } else {
      await api.creerAuteur({ nom, nationalite });
      afficherToast('Auteur ajouté avec succès.');
      e.target.reset();
    }
    chargerAuteurs();
  } catch (erreur) {
    afficherErreurFormulaire('auteur-erreur', erreur);
  }
});

async function supprimerAuteur(id) {
  const ok = await confirmer('Voulez-vous supprimer cet auteur ?');
  if (!ok) return;
  try {
    await api.supprimerAuteur(id);
    afficherToast('Auteur supprimé.');
    chargerAuteurs();
  } catch (erreur) {
    afficherToast(erreur.message, 'erreur');
  }
}
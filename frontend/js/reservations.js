// ============================================================
// reservations.js — section "Reservations"
// ============================================================

// Au premier affichage de la section, on s'assure que les selects
// (adherents deja charges par ailleurs, livres empruntes) sont a jour
function chargerReservations() {
  chargerLivresEmpruntesPourReservation();
  document.getElementById('reservations-corps').innerHTML =
    '<tr><td colspan="3">Choisis un livre ci-dessus pour voir la file d’attente.</td></tr>';
}

document.getElementById('form-reservation').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id_adherent = document.getElementById('reservation-adherent').value;
  const id_livres = document.getElementById('reservation-livre').value;
  document.getElementById('reservation-erreur').textContent = '';

  try {
    await api.creerReservation({ id_adherent, id_livres });
    e.target.reset();
    // Rafraichit la file d'attente si elle est affichee pour ce meme livre
    const filtre = document.getElementById('reservation-filtre-livre');
    if (filtre.value === id_livres) {
      afficherFileAttente(id_livres);
    }
  } catch (erreur) {
    afficherErreurFormulaire('reservation-erreur', erreur);
  }
});

document.getElementById('reservation-filtre-livre').addEventListener('change', (e) => {
  if (e.target.value) {
    afficherFileAttente(e.target.value);
  } else {
    document.getElementById('reservations-corps').innerHTML =
      '<tr><td colspan="3">Choisis un livre ci-dessus pour voir la file d’attente.</td></tr>';
  }
});

async function afficherFileAttente(idLivre) {
  const corps = document.getElementById('reservations-corps');
  corps.innerHTML = '<tr><td colspan="3" class="chargement">Chargement…</td></tr>';

  try {
    const reservations = await api.reservationsParLivre(idLivre);
    corps.innerHTML = reservations.length
      ? reservations.map((r) => `
          <tr>
            <td>${r.adherent_nom}</td>
            <td>${formaterDate(r.date_reservation)}</td>
            <td><button class="action-annuler" onclick="annulerReservation(${r.id}, '${idLivre}')">Annuler</button></td>
          </tr>`).join('')
      : '<tr><td colspan="3">Aucune réservation en attente pour ce livre.</td></tr>';
  } catch (erreur) {
    corps.innerHTML = `<tr><td colspan="3" class="message-erreur">${erreur.message}</td></tr>`;
  }
}

async function annulerReservation(id, idLivre) {
  const ok = await confirmer('Voulez-vous annuler cette réservation ?');
  if (!ok) return;
  try {
    await api.annulerReservation(id);
    afficherFileAttente(idLivre);
  } catch (erreur) {
    afficherToast(erreur.message, 'erreur');
  }
}
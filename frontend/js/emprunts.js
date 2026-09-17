// ============================================================
// emprunts.js — section "Emprunts"
// ============================================================

async function chargerEmprunts() {
  const corps = document.getElementById('emprunts-corps');
  try {
    const emprunts = await api.listerEmprunts();
    const aujourdHui = new Date().toISOString().slice(0, 10);

    corps.innerHTML = emprunts.length
      ? emprunts.map((emp) => {
          const enRetard = !emp.date_retour_reelle && emp.date_retour_prevue < aujourdHui;
          return `
            <tr class="${enRetard ? 'ligne-retard' : ''}">
              <td>${emp.adherent_nom || emp.id_adherent}</td>
              <td>${emp.titre || emp.id_livres}</td>
              <td>${formaterDate(emp.date_retour_prevue)}</td>
              <td>
                <span class="pastille ${enRetard ? 'pastille-retard' : 'pastille-cours'}"></span>
                ${enRetard ? 'En retard' : 'Dans les temps'}
              </td>
              <td>
                <input type="date" id="date-retour-${emp.id}" value="${aujourdHui}" max="${aujourdHui}">
                <button class="action-retour" onclick="enregistrerRetour(${emp.id})">Retour</button>
              </td>
            </tr>`;
        }).join('')
      : '<tr><td colspan="5">Aucun emprunt en cours.</td></tr>';
  } catch (erreur) {
    corps.innerHTML = `<tr><td colspan="5" class="message-erreur">${erreur.message}</td></tr>`;
  }
}

document.getElementById('form-emprunt').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id_adherent = document.getElementById('emprunt-adherent').value;
  const id_livres = document.getElementById('emprunt-livre').value;
  const date_retour_prevue = document.getElementById('emprunt-date').value;
  document.getElementById('emprunt-erreur').textContent = '';

  try {
    await api.creerEmprunt({ id_adherent, id_livres, date_retour_prevue });
    afficherToast('Emprunt enregistré avec succès.');
    e.target.reset();
    chargerEmprunts();
    chargerLivresDisponiblesPourEmprunt();
    chargerLivresEmpruntesPourReservation();
  } catch (erreur) {
    afficherErreurFormulaire('emprunt-erreur', erreur);
  }
});

// L'adherent peut choisir la date reelle de retour (par defaut aujourd'hui).
// Rendre le livre AVANT la date prevue est normal et toujours accepte.
async function enregistrerRetour(id) {
  const champDate = document.getElementById(`date-retour-${id}`);
  const date_retour_reelle = champDate ? champDate.value : undefined;

  try {
    await api.retournerEmprunt(id, date_retour_reelle);
    afficherToast('Retour enregistré avec succès.');
    chargerEmprunts();
    chargerLivresDisponiblesPourEmprunt();
    chargerLivresEmpruntesPourReservation();
  } catch (erreur) {
    afficherToast(erreur.message, 'erreur');
  }
}

// ============================================================
// statistiques.js — section "Tableau de bord"
// ============================================================

async function chargerStatistiques() {
  const conteneur = document.getElementById('grille-stats');
  try {
    const stats = await api.statistiques();
    conteneur.innerHTML = `
      <div class="carte-stat">
        <span class="valeur">${stats.totalLivres}</span>
        <span class="label">Livres au catalogue</span>
      </div>
      <div class="carte-stat accent">
        <span class="valeur">${stats.totalAdherents}</span>
        <span class="label">Adhérents inscrits</span>
      </div>
      <div class="carte-stat secondaire">
        <span class="valeur">${stats.totalEmpruntEncours}</span>
        <span class="label">Emprunts en cours</span>
      </div>
      <div class="carte-stat alerte">
        <span class="valeur">${stats.totalEmpruntEnRetards}</span>
        <span class="label">Emprunts en retard</span>
      </div>
      <div class="carte-stat">
        <span class="valeur" style="font-size:1.1rem;">${stats.livrePlusEmprunte ? stats.livrePlusEmprunte.titre : '—'}</span>
        <span class="label">Livre le plus emprunté</span>
      </div>
      <div class="carte-stat accent">
        <span class="valeur" style="font-size:1.1rem;">${stats.adherentPlusActif ? stats.adherentPlusActif.nom : '—'}</span>
        <span class="label">Adhérent le plus actif</span>
      </div>
    `;
  } catch (erreur) {
    conteneur.innerHTML = `<p class="message-erreur">${erreur.message}</p>`;
  }
}

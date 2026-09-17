// ============================================================
// modale.js — boîte de confirmation personnalisée (Oui / Non)
// ============================================================

let resolutionModale = null;

/**
 * Affiche la modale et renvoie une Promise<boolean>.
 * @param {string} message - texte à afficher (ex: "Voulez-vous supprimer cet adhérent ?")
 * @returns {Promise<boolean>}
 */
function confirmer(message = 'Voulez-vous supprimer ?') {
  return new Promise((resolve) => {
    resolutionModale = resolve;

    const fond = document.getElementById('modale-confirmation');
    document.getElementById('modale-message').textContent = message;
    fond.classList.remove('masque');

    // Focus sur "Non" par défaut (plus sûr)
    document.getElementById('modale-non').focus();
  });
}

function fermerModale(reponse) {
  const fond = document.getElementById('modale-confirmation');
  fond.classList.add('masque');
  if (resolutionModale) {
    resolutionModale(reponse);
    resolutionModale = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modale-oui').addEventListener('click', () => fermerModale(true));
  document.getElementById('modale-non').addEventListener('click', () => fermerModale(false));

  // Clic sur le fond = annuler
  document.getElementById('modale-confirmation').addEventListener('click', (e) => {
    if (e.target.id === 'modale-confirmation') fermerModale(false);
  });

  // Touche Échap = annuler, Entrée = confirmer
  document.addEventListener('keydown', (e) => {
    const fond = document.getElementById('modale-confirmation');
    if (fond.classList.contains('masque')) return;
    if (e.key === 'Escape') fermerModale(false);
    if (e.key === 'Enter')  fermerModale(true);
  });
});
// ============================================================
// navigation.js — bascule entre les sections (onglets du haut)
// ============================================================

function afficherSection(nomSection) {
  document.querySelectorAll('.section').forEach((s) => s.classList.add('masquee'));
  document.getElementById(nomSection).classList.remove('masquee');

  document.querySelectorAll('.onglet').forEach((b) => b.classList.remove('actif'));
  document.querySelector(`.onglet[data-section="${nomSection}"]`).classList.add('actif');

  // Recharge les donnees de la section qu'on vient d'afficher
  if (nomSection === 'tableau-de-bord') chargerStatistiques();
  if (nomSection === 'livres') chargerLivres();
  if (nomSection === 'auteurs') chargerAuteurs();
  if (nomSection === 'adherents') chargerAdherents();
  if (nomSection === 'emprunts') chargerEmprunts();
  if (nomSection === 'reservations') chargerReservations();
}

document.addEventListener('DOMContentLoaded', () => {
  // écouteurs onglets
  document.querySelectorAll('.onglet').forEach((bouton) => {
    bouton.addEventListener('click', () => afficherSection(bouton.dataset.section));
  });

  chargerStatistiques();
  chargerAuteurs();
  chargerAdherents();
});

// ============================================================
// Chargement initial : tableau de bord affiche par defaut,
// mais on precharge aussi auteurs/adherents pour remplir
// les menus deroulants des autres formulaires.
// ============================================================
/*chargerStatistiques();
chargerAuteurs();
chargerAdherents();*/

// ============================================================
// toasts.js — petites notifications visuelles apres chaque action
// ============================================================

function afficherToast(message, type = 'succes') {
  const conteneur = document.getElementById('toasts');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  conteneur.appendChild(toast);

  // Disparait toute seule apres 3 secondes
  setTimeout(() => {
    toast.classList.add('toast-sortie');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================
// utils.js — petites fonctions partagees par plusieurs pages
// ============================================================

function formaterDate(dateIso) {
  if (!dateIso) return '—';
  const [annee, mois, jour] = dateIso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

function afficherErreurFormulaire(idParagraphe, erreur) {
  document.getElementById(idParagraphe).textContent = erreur.message;
}

function echapperHtml(valeur) {
  if (valeur === null || valeur === undefined) return '';
  return String(valeur)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
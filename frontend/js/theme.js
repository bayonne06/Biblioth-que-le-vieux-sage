// ============================================================
// theme.js — bascule entre le theme clair et sombre
// ============================================================

const CLE_THEME = 'bibliotheque-theme';

function appliquerTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('bouton-theme').textContent = theme === 'dark' ? '👴🏿' : '👴';
}

function chargerThemeInitial() {
  const themeSauvegarde = localStorage.getItem(CLE_THEME);
  const themeSysteme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  appliquerTheme(themeSauvegarde || themeSysteme);
}

document.getElementById('bouton-theme').addEventListener('click', () => {
  const themeActuel = document.documentElement.getAttribute('data-theme');
  const nouveauTheme = themeActuel === 'dark' ? 'light' : 'dark';
  appliquerTheme(nouveauTheme);
  localStorage.setItem(CLE_THEME, nouveauTheme);
});

chargerThemeInitial();

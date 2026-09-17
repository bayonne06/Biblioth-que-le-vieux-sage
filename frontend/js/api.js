// ============================================================
// api.js — fonctions generiques pour parler au backend
// URL relative : le frontend doit etre servi par le meme
// serveur Express que l'API (voir server.js -> express.static)
// ============================================================

const BASE_URL = '/api';

async function appelerApi(chemin, options = {}) {
  const reponse = await fetch(BASE_URL + chemin, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (reponse.status === 204) {
    return null;
  }

  const corps = await reponse.json().catch(() => ({}));

  if (!reponse.ok) {
    throw new Error(corps.erreur || `Erreur ${reponse.status}`);
  }

  return corps;
}

const api = {
  // ---------- Auteurs ----------
  listerAuteurs: () => appelerApi('/auteurs'),
  creerAuteur: (donnees) => appelerApi('/auteurs', { method: 'POST', body: JSON.stringify(donnees) }),
  modifierAuteur: (id, donnees) => appelerApi(`/auteurs/${id}`, { method: 'PUT', body: JSON.stringify(donnees) }),
  supprimerAuteur: (id) => appelerApi(`/auteurs/${id}`, { method: 'DELETE' }),

  // ---------- Adherents ----------
  listerAdherents: () => appelerApi('/adherents'),
  creerAdherent: (donnees) => appelerApi('/adherents', { method: 'POST', body: JSON.stringify(donnees) }),
  modifierAdherent: (id, donnees) => appelerApi(`/adherents/${id}`, { method: 'PUT', body: JSON.stringify(donnees) }),
  supprimerAdherent: (id) => appelerApi(`/adherents/${id}`, { method: 'DELETE' }),
  historiqueAdherent: (id) => appelerApi(`/adherents/${id}/historique`),

  // ---------- Livres ----------
  listerLivres: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return appelerApi('/livres' + (query ? `?${query}` : ''));
  },
  creerLivre: (donnees) => appelerApi('/livres', { method: 'POST', body: JSON.stringify(donnees) }),
  modifierLivre: (id, donnees) => appelerApi(`/livres/${id}`, { method: 'PUT', body: JSON.stringify(donnees) }),
  supprimerLivre: (id) => appelerApi(`/livres/${id}`, { method: 'DELETE' }),

  // ---------- Emprunts ----------
  listerEmprunts: () => appelerApi('/emprunts'),
  listerEmpruntsEnRetard: () => appelerApi('/emprunts/enretard'),
  creerEmprunt: (donnees) => appelerApi('/emprunts', { method: 'POST', body: JSON.stringify(donnees) }),
  retournerEmprunt: (id, date_retour_reelle) => appelerApi(`/emprunts/${id}/retour`, {
    method: 'PUT',
    body: JSON.stringify(date_retour_reelle ? { date_retour_reelle } : {}),
  }),

  // ---------- Reservations ----------
  creerReservation: (donnees) => appelerApi('/reservations', { method: 'POST', body: JSON.stringify(donnees) }),
  annulerReservation: (id) => appelerApi(`/reservations/${id}`, { method: 'DELETE' }),
  reservationsParLivre: (idLivre) => appelerApi(`/reservations/livre/${idLivre}`),
  reservationsParAdherent: (idAdherent) => appelerApi(`/reservations/adherent/${idAdherent}`),

  // ---------- Statistiques ----------
  statistiques: () => appelerApi('/statistiques'),
};

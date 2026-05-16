// Récupère le token depuis le LocalStorage
export const getToken = () => localStorage.getItem('token');
// Récupère l'utilisateur courant
export const getCurrentUser = () =>
  JSON.parse(localStorage.getItem('user') || 'null');
// Déconnexion : supprime token + user, redirige vers login
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = '/index.html';
}
// Headers à joindre à chaque requête fetch / Axios
export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization:  `Bearer ${getToken()}`,
});
// Redirige vers login si aucun token présent
export function requireAuth() {
  if (!getToken()) location.href = '/index.html';
}
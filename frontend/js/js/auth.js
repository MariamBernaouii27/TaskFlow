// frontend/js/auth.js

const API = 'http://localhost:5000/api/auth';

// ── Configuration Axios ──
axios.defaults.baseURL = API;

// ── Ajouter token automatiquement ──
const token = localStorage.getItem('token');

if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ── Vérification session ──
function checkAuth() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;

  const isProtected =
    currentPage.includes('dashboard');

  const isAuthPage =
    currentPage.includes('login') ||
    currentPage.includes('landing') ||
    currentPage.includes('index');

  // Pas connecté → pages protégées interdites
  if (!token && isProtected) {
    window.location.replace('login.html');
  }

  // Déjà connecté → empêcher retour login
  if (token && isAuthPage) {
    window.location.replace('dashboard.html');
  }
}

// ── Sauvegarder session ──
function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  axios.defaults.headers.common['Authorization'] =
    `Bearer ${token}`;
}

// ── Déconnexion ──
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  delete axios.defaults.headers.common['Authorization'];

  window.location.replace('login.html');
}

// ── Utilisateur connecté ──
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

// ── Initialisation ──
checkAuth();
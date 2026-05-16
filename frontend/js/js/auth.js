// frontend/js/auth.js

const API = '/api/auth';

// ── Intercepteur Axios global ──
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ── Vérification de session au chargement ──
function checkAuth() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;

  const isProtected = currentPage.includes('dashboard');
  const isAuthPage  = currentPage.includes('login') || currentPage.includes('landing');

  if (!token && isProtected) {
    window.location.replace('login.html');
  }
  if (token && isAuthPage) {
    window.location.replace('dashboard.html');
  }
}

// ── Déconnexion ──
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.replace('login.html');
}

checkAuth();
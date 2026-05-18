const POLL_INTERVAL_MS = 30000;
const LS_KEY = "taskflow_notifications_read";

let notifications = [];
let pollTimer = null;

// ── localStorage ──
function getArchived() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

function archiveNotification(n) {
  const archived = getArchived();
  if (!archived.find(a => a._id === n._id)) {
    archived.unshift({ ...n, archivedAt: new Date().toISOString() });
    if (archived.length > 100) archived.pop();
    localStorage.setItem(LS_KEY, JSON.stringify(archived));
  }
}

// ── Badge ──
function updateBadge(count) {
  const badge = document.getElementById("notif-badge");
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

// ── Polling ──
async function fetchNotifications() {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const res = await axios.get("/api/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    });
    notifications = res.data.data;
    updateBadge(res.data.unreadCount);
  } catch (err) {
    console.error("[Notifications] Erreur:", err.message);
  }
}

// ── Marquer comme lu ──
async function markAsRead(id) {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    const res = await axios.patch(`/api/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { notification, unreadCount } = res.data;
    archiveNotification(notification);
    notifications = notifications.map(n =>
      n._id === id ? { ...n, read: true } : n
    );
    updateBadge(unreadCount);
  } catch (err) {
    console.error("[Notifications] Erreur markAsRead:", err.message);
  }
}

// ── Start ──
function startPolling() {
  fetchNotifications();
  pollTimer = setInterval(fetchNotifications, POLL_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (token) startPolling();
});
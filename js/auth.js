/* ============================================================
   AssetFlow – Auth Module
   Login, token management, role checks, logout
   ============================================================ */

const Auth = (() => {

  const TOKEN_KEY    = 'af_token';
  const USER_KEY     = 'af_user';
  const REFRESH_KEY  = 'af_refresh';

  // ── Store token ─────────────────────────────────────────────
  const setToken = (token, refresh = null) => {
    localStorage.setItem(TOKEN_KEY, token);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  };

  // ── Store user ───────────────────────────────────────────────
  const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  // ── Get current user ─────────────────────────────────────────
  const getUser = () => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  // ── Get token ────────────────────────────────────────────────
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  // ── Is logged in ─────────────────────────────────────────────
  const isLoggedIn = () => !!getToken();

  // ── Get role ─────────────────────────────────────────────────
  const getRole = () => {
    const user = getUser();
    return user ? user.role : null;
  };

  // ── Has role ─────────────────────────────────────────────────
  const hasRole = (...roles) => roles.includes(getRole());

  // ── Decode JWT payload (no verification) ────────────────────
  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
  };

  // ── Check token expiry ───────────────────────────────────────
  const isTokenExpired = () => {
    const token = getToken();
    if (!token) return true;
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  };

  // ── Login ────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await API.auth.login({ email, password });
    setToken(data.token, data.refreshToken);
    setUser(data);
    return data;
  };

  // ── Logout ───────────────────────────────────────────────────
  const logout = async () => {
    try { await API.auth.logout(); } catch (_) { /* silent */ }
    localStorage.clear();
    window.location.href = getRelativePath('index.html');
  };

  // ── Resolve relative path to root ───────────────────────────
  const getRelativePath = (page) => {
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    const prefix = depth > 1 ? '../'.repeat(depth - 1) : './';
    return prefix + page;
  };

  // ── Guard – redirect if not logged in ───────────────────────
  const requireAuth = () => {
    if (!isLoggedIn() || isTokenExpired()) {
      localStorage.clear();
      window.location.href = getRelativePath('index.html');
    }
  };

  // ── Guard – redirect if logged in (for login page) ──────────
  const redirectIfLoggedIn = () => {
    if (isLoggedIn() && !isTokenExpired()) {
      window.location.href = getRelativePath('dashboard.html');
    }
  };

  // ── Get full name ────────────────────────────────────────────
  const getFullName = () => {
    const user = getUser();
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  };

  // ── Get initials ─────────────────────────────────────────────
  const getInitials = () => {
    const name = getFullName();
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return {
    login, logout, setToken, setUser,
    getToken, getUser, getRole,
    hasRole, isLoggedIn, isTokenExpired,
    requireAuth, redirectIfLoggedIn,
    getFullName, getInitials, getRelativePath,
  };

})();

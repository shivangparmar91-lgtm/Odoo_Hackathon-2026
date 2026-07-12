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
      let base64Url = token.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Pad string with '=' so it's a multiple of 4 to prevent atob() errors
      while (base64.length % 4) {
        base64 += '=';
      }
      return JSON.parse(atob(base64));
    } catch (e) {
      console.error("JWT Decode error:", e);
      return null;
    }
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
    setUser(data.user);
    return data;
  };

  // ── Logout ───────────────────────────────────────────────────
  const logout = () => {
    // Fire and forget the API call so it doesn't block the UI
    API.auth.logout().catch(() => {});
    localStorage.clear();
    window.location.href = getRelativePath('index.html');
  };

  // ── Resolve relative path to root ───────────────────────────
  const getRelativePath = (page) => {
    const script = document.querySelector('script[src*="auth.js"]');
    if (script && script.src) {
      // script.src is the absolute URL, e.g., http://.../js/auth.js
      return script.src.replace(/\/js\/auth\.js(\?.*)?$/, '/') + page;
    }
    return '/' + page;
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

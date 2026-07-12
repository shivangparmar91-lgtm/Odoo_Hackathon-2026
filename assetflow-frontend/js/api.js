/* ============================================================
   AssetFlow – API Layer (Fetch Wrapper)
   All REST communication happens through this file.
   ============================================================ */

const API = (() => {

  // ── Config ─────────────────────────────────────────────────
  const BASE_URL = 'http://localhost:8080/api/v1';
  const TIMEOUT  = 15000; // 15 seconds

  // ── Get stored token ────────────────────────────────────────
  const getToken = () => localStorage.getItem('af_token') || '';

  // ── Build headers ───────────────────────────────────────────
  const buildHeaders = (isJson = true) => {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
  };

  // ── Timeout wrapper ─────────────────────────────────────────
  const fetchWithTimeout = (url, options) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  };

  // ── Core request handler ────────────────────────────────────
  const request = async (method, path, body = null, isFormData = false) => {
    const url = `${BASE_URL}${path}`;

    const options = {
      method,
      headers: buildHeaders(!isFormData),
    };

    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    try {
      const res = await fetchWithTimeout(url, options);

      // Handle 401 Unauthorized → redirect to login
      if (res.status === 401) {
        localStorage.clear();
        if (typeof Auth !== 'undefined') {
          window.location.href = Auth.getRelativePath('index.html');
        } else {
          // Fallback if Auth is somehow missing
          window.location.href = window.location.pathname.includes('/assets/') || window.location.pathname.includes('/organization/') ? '../index.html' : 'index.html';
        }
        return;
      }

      // Parse response
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const message = (data && data.message) || `HTTP ${res.status}: ${res.statusText}`;
        throw new APIError(message, res.status, data);
      }

      return data;

    } catch (err) {
      if (err.name === 'AbortError') {
        throw new APIError('Request timed out. Please try again.', 408);
      }
      if (err instanceof APIError) throw err;
      // Network error
      throw new APIError('Network error. Please check your connection.', 0);
    }
  };

  // ── APIError class ──────────────────────────────────────────
  class APIError extends Error {
    constructor(message, status, data = null) {
      super(message);
      this.name = 'APIError';
      this.status = status;
      this.data = data;
    }
  }

  // ── Public Methods ──────────────────────────────────────────
  return {
    APIError,

    get:    (path)               => request('GET',    path),
    post:   (path, body)         => request('POST',   path, body),
    put:    (path, body)         => request('PUT',    path, body),
    patch:  (path, body)         => request('PATCH',  path, body),
    delete: (path)               => request('DELETE', path),
    upload: (path, formData)     => request('POST',   path, formData, true),
    uploadPut: (path, formData)  => request('PUT',    path, formData, true),

    // ── Auth Endpoints ────────────────────────────────────────
    auth: {
      login:          (body) => request('POST', '/auth/login', body),
      signup:         (body) => request('POST', '/auth/signup', body),
      forgotPassword: (body) => request('POST', '/auth/forgot-password', body),
      resetPassword:  (body) => request('POST', '/auth/reset-password', body),
      verifyOtp:      (body) => request('POST', '/auth/verify-otp', body),
      refreshToken:   ()     => request('POST', '/auth/refresh'),
      logout:         ()     => request('POST', '/auth/logout'),
      me:             ()     => request('GET',  '/auth/me'),
    },

    // ── Dashboard ─────────────────────────────────────────────
    dashboard: {
      metrics:   () => request('GET', '/dashboard/metrics'),
      recent:    () => request('GET', '/dashboard/recent-activity'),
      chartData: () => request('GET', '/dashboard/charts'),
    },

    // ── Departments ───────────────────────────────────────────
    departments: {
      getAll:   (params = '')       => request('GET',    `/departments?${params}`),
      getById:  (id)                => request('GET',    `/departments/${id}`),
      create:   (body)              => request('POST',   '/departments', body),
      update:   (id, body)          => request('PUT',    `/departments/${id}`, body),
      delete:   (id)                => request('DELETE', `/departments/${id}`),
      getHeads: ()                  => request('GET',    '/departments/heads'),
    },

    // ── Asset Categories ──────────────────────────────────────
    categories: {
      getAll:   (params = '')       => request('GET',    `/asset-categories?${params}`),
      getById:  (id)                => request('GET',    `/asset-categories/${id}`),
      create:   (body)              => request('POST',   '/asset-categories', body),
      update:   (id, body)          => request('PUT',    `/asset-categories/${id}`, body),
      delete:   (id)                => request('DELETE', `/asset-categories/${id}`),
    },

    // ── Employees ─────────────────────────────────────────────
    employees: {
      getAll:   (params = '')       => request('GET',    `/employees?${params}`),
      getById:  (id)                => request('GET',    `/employees/${id}`),
      create:   (body)              => request('POST',   '/employees', body),
      update:   (id, body)          => request('PUT',    `/employees/${id}`, body),
      delete:   (id)                => request('DELETE', `/employees/${id}`),
      search:   (q)                 => request('GET',    `/employees/search?q=${q}`),
    },

    // ── Assets ────────────────────────────────────────────────
    assets: {
      getAll:       (params = '')   => request('GET',    `/assets?${params}`),
      getById:      (id)            => request('GET',    `/assets/${id}`),
      create:       (fd)            => request('POST',   '/assets', fd, true),
      update:       (id, fd)        => request('PUT',    `/assets/${id}`, fd, true),
      delete:       (id)            => request('DELETE', `/assets/${id}`),
      search:       (q)             => request('GET',    `/assets/search?q=${q}`),
      getAvailable: ()              => request('GET',    '/assets/available'),
      getByTag:     (tag)           => request('GET',    `/assets/tag/${tag}`),
      getHistory:   (id)            => request('GET',    `/assets/${id}/history`),
    },

    // ── Allocations ───────────────────────────────────────────
    allocations: {
      getAll:   (params = '')       => request('GET',    `/allocations?${params}`),
      getById:  (id)                => request('GET',    `/allocations/${id}`),
      create:   (body)              => request('POST',   '/allocations', body),
      return:   (id, body)          => request('POST',   `/allocations/${id}/return`, body),
      getByEmp: (empId)             => request('GET',    `/allocations/employee/${empId}`),
      getByAsset:(assetId)          => request('GET',    `/allocations/asset/${assetId}`),
    },

    // ── Transfers ─────────────────────────────────────────────
    transfers: {
      getAll:   (params = '')       => request('GET',    `/transfers?${params}`),
      getById:  (id)                => request('GET',    `/transfers/${id}`),
      create:   (body)              => request('POST',   '/transfers', body),
      approve:  (id, body)          => request('POST',   `/transfers/${id}/approve`, body),
      reject:   (id, body)          => request('POST',   `/transfers/${id}/reject`, body),
    },

    // ── Returns ───────────────────────────────────────────────
    returns: {
      getAll:   (params = '')       => request('GET',    `/returns?${params}`),
      getById:  (id)                => request('GET',    `/returns/${id}`),
      create:   (body)              => request('POST',   '/returns', body),
      approve:  (id)                => request('POST',   `/returns/${id}/approve`),
    },

    // ── Bookings ──────────────────────────────────────────────
    bookings: {
      getAll:   (params = '')       => request('GET',    `/bookings?${params}`),
      getById:  (id)                => request('GET',    `/bookings/${id}`),
      create:   (body)              => request('POST',   '/bookings', body),
      cancel:   (id)                => request('DELETE', `/bookings/${id}`),
      checkConflict: (body)         => request('POST',   '/bookings/check-conflict', body),
      getUpcoming: ()               => request('GET',    '/bookings/upcoming'),
    },

    // ── Maintenance ───────────────────────────────────────────
    maintenance: {
      getAll:   (params = '')       => request('GET',    `/maintenance?${params}`),
      getById:  (id)                => request('GET',    `/maintenance/${id}`),
      create:   (body)              => request('POST',   '/maintenance', body),
      update:   (id, body)          => request('PUT',    `/maintenance/${id}`, body),
      approve:  (id)                => request('POST',   `/maintenance/${id}/approve`),
      reject:   (id, body)          => request('POST',   `/maintenance/${id}/reject`, body),
      complete: (id, body)          => request('POST',   `/maintenance/${id}/complete`, body),
      getHistory: (assetId)         => request('GET',    `/maintenance/asset/${assetId}/history`),
    },

    // ── Audits ────────────────────────────────────────────────
    audits: {
      getAll:   (params = '')       => request('GET',    `/audits?${params}`),
      getById:  (id)                => request('GET',    `/audits/${id}`),
      create:   (body)              => request('POST',   '/audits', body),
      update:   (id, body)          => request('PUT',    `/audits/${id}`, body),
      start:    (id)                => request('POST',   `/audits/${id}/start`),
      complete: (id, body)          => request('POST',   `/audits/${id}/complete`, body),
      getItems: (id)                => request('GET',    `/audits/${id}/items`),
      updateItem:(auditId, itemId, body) => request('PUT', `/audits/${auditId}/items/${itemId}`, body),
    },

    // ── Reports ───────────────────────────────────────────────
    reports: {
      assetSummary:    (params = '') => request('GET', `/reports/asset-summary?${params}`),
      allocationReport:(params = '') => request('GET', `/reports/allocations?${params}`),
      maintenanceReport:(params='') => request('GET', `/reports/maintenance?${params}`),
      auditReport:     (params = '') => request('GET', `/reports/audit?${params}`),
      departmentReport:(params = '') => request('GET', `/reports/department?${params}`),
      exportExcel:     (type, params)=> request('GET', `/reports/export/excel/${type}?${params}`),
      exportPdf:       (type, params)=> request('GET', `/reports/export/pdf/${type}?${params}`),
    },

    // ── Notifications ─────────────────────────────────────────
    notifications: {
      getAll:   (params = '')       => request('GET',    `/notifications?${params}`),
      markRead: (id)                => request('PATCH',  `/notifications/${id}/read`),
      markAllRead: ()               => request('PATCH',  '/notifications/read-all'),
      delete:   (id)                => request('DELETE', `/notifications/${id}`),
      getCount: ()                  => request('GET',    '/notifications/unread-count'),
    },

    // ── Activity Logs ─────────────────────────────────────────
    activityLogs: {
      getAll:   (params = '')       => request('GET', `/activity-logs?${params}`),
      getByUser:(userId, params='') => request('GET', `/activity-logs/user/${userId}?${params}`),
      getByEntity:(type,id)         => request('GET', `/activity-logs/entity/${type}/${id}`),
    },

    // ── User Profile ──────────────────────────────────────────
    profile: {
      get:            ()      => request('GET',   '/profile'),
      update:         (body)  => request('PUT',   '/profile', body),
      changePassword: (body)  => request('POST',  '/profile/change-password', body),
      uploadAvatar:   (fd)    => request('POST',  '/profile/avatar', fd, true),
    },

    // ── Settings ──────────────────────────────────────────────
    settings: {
      get:    ()      => request('GET',  '/settings'),
      update: (body)  => request('PUT',  '/settings', body),
      getRoles: ()    => request('GET',  '/settings/roles'),
      updateRole:(id,b)=> request('PUT', `/settings/roles/${id}`, b),
    },
  };

})();

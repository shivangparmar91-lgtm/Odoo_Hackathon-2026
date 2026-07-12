/* ============================================================
   AssetFlow – Utils Module
   Toast, Modal, Pagination, Validators, Formatters, Helpers
   ============================================================ */

const Utils = (() => {

  // ════════════════════════════════════════════════════════════
  // TOAST SYSTEM
  // ════════════════════════════════════════════════════════════
  let toastContainer = null;

  const getToastContainer = () => {
    if (!toastContainer) {
      toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  };

  const TOAST_ICONS = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };

  const toast = (type, title, message = '', duration = 4000) => {
    const container = getToastContainer();
    const id = `toast-${Date.now()}`;

    const el = document.createElement('div');
    el.id = id;
    el.className = `toast toast-${type === 'error' ? 'danger' : type}`;
    el.innerHTML = `
      <span class="toast-icon">${TOAST_ICONS[type] || 'ℹ️'}</span>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        ${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}
      </div>
      <button class="toast-close" onclick="Utils.closeToast('${id}')">✕</button>
      <div class="toast-progress">
        <div class="toast-progress-bar" id="${id}-bar" style="width:100%"></div>
      </div>
    `;

    container.appendChild(el);

    // Animate progress
    const bar = document.getElementById(`${id}-bar`);
    if (bar) {
      bar.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => { bar.style.width = '0%'; });
    }

    // Auto-remove
    const timer = setTimeout(() => closeToast(id), duration);
    el._timer = timer;

    return id;
  };

  const closeToast = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    clearTimeout(el._timer);
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove());
  };

  const Toast = {
    success: (title, msg, d) => toast('success', title, msg, d),
    error:   (title, msg, d) => toast('error',   title, msg, d),
    warning: (title, msg, d) => toast('warning', title, msg, d),
    info:    (title, msg, d) => toast('info',    title, msg, d),
    api:     (err)           => toast('error', 'Request Failed', err?.message || 'Something went wrong'),
  };

  // ════════════════════════════════════════════════════════════
  // MODAL SYSTEM
  // ════════════════════════════════════════════════════════════
  const openModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    m.addEventListener('click', (e) => {
      if (e.target === m) closeModal(id);
    }, { once: true });
  };

  const closeModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('open');
    document.body.style.overflow = '';
  };

  const confirmDialog = (title, message, onConfirm, type = 'danger') => {
    const id = 'confirm-dialog-modal';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = 'modal-backdrop confirm-modal';
      document.body.appendChild(el);
    }

    const icons = { danger: '🗑️', warning: '⚠️', info: 'ℹ️', success: '✅' };
    el.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-body" style="text-align:center;padding:2rem">
          <div class="confirm-icon">${icons[type] || '❓'}</div>
          <h3>${escapeHtml(title)}</h3>
          <p style="margin-top:.5rem;margin-bottom:1.5rem">${escapeHtml(message)}</p>
          <div style="display:flex;gap:.75rem;justify-content:center">
            <button class="btn btn-secondary" onclick="Utils.closeModal('${id}')">Cancel</button>
            <button class="btn btn-${type}" id="confirm-ok-btn">${type === 'danger' ? 'Delete' : 'Confirm'}</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('confirm-ok-btn').onclick = () => {
      closeModal(id);
      onConfirm();
    };

    openModal(id);
  };

  // ════════════════════════════════════════════════════════════
  // PAGINATION
  // ════════════════════════════════════════════════════════════
  const renderPagination = (container, { page, totalPages, total, pageSize, onPageChange }) => {
    if (!container) return;
    const start = (page - 1) * pageSize + 1;
    const end   = Math.min(page * pageSize, total);

    let pages = [];
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) { pages.push(1); if (range[0] > 2) pages.push('...'); }
    pages = pages.concat(range);
    if (range[range.length - 1] < totalPages) {
      if (range[range.length - 1] < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    container.innerHTML = `
      <div class="pagination-info">Showing <strong>${start}–${end}</strong> of <strong>${total}</strong></div>
      <div class="pagination-controls">
        <button class="page-btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">‹</button>
        ${pages.map(p => p === '...'
          ? `<span class="page-btn" style="border:none;background:none;cursor:default">…</span>`
          : `<button class="page-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">›</button>
      </div>
    `;

    container.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (!isNaN(p) && p >= 1 && p <= totalPages) onPageChange(p);
      });
    });
  };

  // ════════════════════════════════════════════════════════════
  // VALIDATORS
  // ════════════════════════════════════════════════════════════
  const Validate = {
    required:  (v) => v !== null && v !== undefined && String(v).trim() !== '',
    email:     (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    phone:     (v) => /^[\d\s\+\-\(\)]{7,15}$/.test(v),
    minLength: (v, n) => String(v).length >= n,
    maxLength: (v, n) => String(v).length <= n,
    number:    (v) => !isNaN(parseFloat(v)) && isFinite(v),
    positive:  (v) => parseFloat(v) > 0,
    url:       (v) => { try { new URL(v); return true; } catch { return false; } },
    password:  (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v),
    date:      (v) => !isNaN(Date.parse(v)),
    futureDate:(v) => new Date(v) > new Date(),
    pastDate:  (v) => new Date(v) < new Date(),
  };

  // Form validation helper
  const validateForm = (rules) => {
    let isValid = true;
    Object.entries(rules).forEach(([fieldId, fieldRules]) => {
      const el = document.getElementById(fieldId);
      const feedbackEl = document.getElementById(`${fieldId}-error`);
      if (!el) return;
      const value = el.value;
      let error = '';

      for (const [rule, param] of Object.entries(fieldRules)) {
        if (rule === 'required' && param && !Validate.required(value)) {
          error = 'This field is required.'; break;
        }
        if (rule === 'email' && param && value && !Validate.email(value)) {
          error = 'Enter a valid email address.'; break;
        }
        if (rule === 'minLength' && !Validate.minLength(value, param)) {
          error = `Minimum ${param} characters.`; break;
        }
        if (rule === 'maxLength' && !Validate.maxLength(value, param)) {
          error = `Maximum ${param} characters.`; break;
        }
        if (rule === 'password' && param && value && !Validate.password(value)) {
          error = 'Min 8 chars, uppercase, lowercase, and number.'; break;
        }
        if (rule === 'positive' && value && !Validate.positive(value)) {
          error = 'Must be a positive number.'; break;
        }
        if (rule === 'futureDate' && value && !Validate.futureDate(value)) {
          error = 'Date must be in the future.'; break;
        }
      }

      if (error) {
        el.classList.add('is-invalid');
        el.classList.remove('is-valid');
        if (feedbackEl) feedbackEl.textContent = error;
        isValid = false;
      } else {
        el.classList.remove('is-invalid');
        el.classList.add('is-valid');
        if (feedbackEl) feedbackEl.textContent = '';
      }
    });
    return isValid;
  };

  // ════════════════════════════════════════════════════════════
  // FORMATTERS
  // ════════════════════════════════════════════════════════════
  const Format = {
    date: (d, opts = {}) => {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: '2-digit', ...opts
      });
    },
    datetime: (d) => {
      if (!d) return '—';
      return new Date(d).toLocaleString('en-IN', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    },
    currency: (n, currency = 'INR') => {
      if (n === null || n === undefined) return '—';
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
    },
    number: (n) => {
      if (n === null || n === undefined) return '—';
      return new Intl.NumberFormat('en-IN').format(n);
    },
    fileSize: (bytes) => {
      if (!bytes) return '0 B';
      const units = ['B','KB','MB','GB'];
      let i = 0;
      while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++; }
      return `${bytes.toFixed(1)} ${units[i]}`;
    },
    timeAgo: (d) => {
      if (!d) return '—';
      const now = Date.now();
      const diff = now - new Date(d).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1)  return 'just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24)   return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 30)    return `${days}d ago`;
      return Format.date(d);
    },
    truncate: (str, len = 40) => {
      if (!str) return '—';
      return str.length > len ? str.slice(0, len) + '…' : str;
    },
    initials: (name) => {
      if (!name) return '??';
      return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    },
    badgeStatus: (status) => {
      const map = {
        ACTIVE:       'success',
        INACTIVE:     'neutral',
        AVAILABLE:    'success',
        ALLOCATED:    'primary',
        IN_MAINTENANCE:'warning',
        RETIRED:      'neutral',
        LOST:         'danger',
        PENDING:      'warning',
        APPROVED:     'success',
        REJECTED:     'danger',
        COMPLETED:    'success',
        IN_PROGRESS:  'info',
        OVERDUE:      'danger',
        CANCELLED:    'neutral',
        OPEN:         'warning',
        CLOSED:       'neutral',
      };
      return map[status] || 'neutral';
    },
  };

  // ════════════════════════════════════════════════════════════
  // DOM HELPERS
  // ════════════════════════════════════════════════════════════
  const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const setButtonLoading = (btn, loading, originalText) => {
    if (loading) {
      btn.dataset.orig = btn.innerHTML;
      btn.innerHTML = `<span class="btn-spinner"><span class="spinner spinner-sm"></span></span>${btn.textContent}`;
      btn.classList.add('btn-loading');
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.orig || originalText || btn.innerHTML;
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  };

  // Debounce
  const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  // Build query string
  const buildQuery = (params) => {
    return Object.entries(params)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  };

  // Render avatar placeholder
  const avatarHtml = (name, size = 'md', imgUrl = null) => {
    if (imgUrl) return `<img src="${escapeHtml(imgUrl)}" class="avatar avatar-${size}" alt="${escapeHtml(name)}">`;
    const initials = Format.initials(name);
    return `<div class="avatar-placeholder avatar-${size}">${initials}</div>`;
  };

  // Badge HTML
  const badgeHtml = (text, type = 'neutral', dot = false) => {
    return `<span class="badge badge-${type}${dot?' badge-dot':''}">${escapeHtml(text)}</span>`;
  };

  // Status badge
  const statusBadge = (status, label = null) => {
    const type = Format.badgeStatus(status);
    const display = label || status?.replace(/_/g, ' ') || '—';
    return badgeHtml(display, type, true);
  };

  // Skeleton row
  const skeletonRow = (cols) =>
    `<tr>${Array(cols).fill('<td><div class="skeleton skeleton-text" style="width:80%"></div></td>').join('')}</tr>`;

  const skeletonRows = (count, cols) => Array(count).fill(skeletonRow(cols)).join('');

  // Count up animation
  const countUp = (el, target, duration = 1200) => {
    const start = 0;
    const step = (timestamp) => {
      if (!el._startTime) el._startTime = timestamp;
      const progress = Math.min((timestamp - el._startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + ease * (target - start)).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ════════════════════════════════════════════════════════════
  // SEARCH + FILTER
  // ════════════════════════════════════════════════════════════
  const setupSearch = (inputId, onSearch) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', debounce((e) => onSearch(e.target.value.trim()), 350));
  };

  // ════════════════════════════════════════════════════════════
  // ACTIVE NAV DETECTION
  // ════════════════════════════════════════════════════════════
  const setActiveNav = () => {
    const path = window.location.pathname;
    
    // Clear previous active states
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active', 'open'));
    document.querySelectorAll('.nav-submenu').forEach(el => el.classList.remove('open'));

    document.querySelectorAll('.nav-item[href]').forEach(el => {
      const href = el.getAttribute('href');
      if (href && path.includes(href.replace(/^\.\.\//, '').replace('.html', ''))) {
        el.classList.add('active');
        // Open parent submenu if needed
        const sub = el.closest('.nav-submenu');
        if (sub) {
          sub.classList.add('open');
          const parent = sub.previousElementSibling;
          if (parent) parent.classList.add('open');
        }
      }
    });
  };

  // ════════════════════════════════════════════════════════════
  // TAB SYSTEM
  // ════════════════════════════════════════════════════════════
  const initTabs = (container = document) => {
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.tabGroup;
        const target = btn.dataset.tab;

        document.querySelectorAll(`.tab-btn[data-tab-group="${group}"]`)
          .forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.tab-content[data-tab-group="${group}"]`)
          .forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.querySelector(`.tab-content[data-tab="${target}"][data-tab-group="${group}"]`)
          ?.classList.add('active');
      });
    });
  };

  // ════════════════════════════════════════════════════════════
  // SUBMENU
  // ════════════════════════════════════════════════════════════
  const initSubmenus = () => {
    document.querySelectorAll('.nav-item[data-submenu]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.dataset.submenu;
        const sub = document.getElementById(targetId);
        if (!sub) return;
        const isOpen = sub.classList.contains('open');
        // Close all
        document.querySelectorAll('.nav-submenu.open').forEach(s => s.classList.remove('open'));
        document.querySelectorAll('.nav-item.open').forEach(s => s.classList.remove('open'));
        if (!isOpen) {
          sub.classList.add('open');
          item.classList.add('open');
        }
      });
    });
  };

  return {
    Toast, closeToast,
    openModal, closeModal, confirmDialog,
    renderPagination,
    Validate, validateForm,
    Format,
    escapeHtml, $, $$,
    setButtonLoading, debounce, buildQuery,
    avatarHtml, badgeHtml, statusBadge,
    skeletonRows,
    countUp, setupSearch,
    setActiveNav, initTabs, initSubmenus,
  };

})();

/* ============================================================
   AssetFlow – Sidebar Module
   Shared sidebar HTML, toggle, mobile, populate user info
   ============================================================ */

const Sidebar = (() => {

  const NAV_ITEMS = [
    { icon: '📊', label: 'Dashboard',        href: 'dashboard.html',                  section: null },
    { section: 'ORGANIZATION' },
    { icon: '🏢', label: 'Departments',      href: 'organization/departments.html',   submenu: 'sub-org', parent: true },
    { icon: '📁', label: 'Asset Categories', href: 'organization/categories.html',    submenu: 'sub-org' },
    { icon: '👥', label: 'Employee Directory',href: 'organization/employees.html',    submenu: 'sub-org' },
    { section: 'ASSETS' },
    { icon: '➕', label: 'Register Asset',   href: 'assets/registration.html',        submenu: 'sub-assets', parent: true },
    { icon: '📋', label: 'Asset Directory',  href: 'assets/directory.html',           submenu: 'sub-assets' },
    { icon: '🔗', label: 'Allocations',      href: 'assets/allocation.html',          submenu: 'sub-assets' },
    { icon: '↔️', label: 'Transfers',        href: 'assets/transfer.html',            submenu: 'sub-assets' },
    { icon: '↩️', label: 'Returns',          href: 'assets/return.html',              submenu: 'sub-assets' },
    { section: 'OPERATIONS' },
    { icon: '📅', label: 'Resource Booking', href: 'booking/resource-booking.html',   badge: null },
    { icon: '🔧', label: 'Maintenance',      href: 'maintenance/maintenance.html',    badge: null },
    { icon: '🔍', label: 'Audit Cycle',      href: 'audit/audit-cycle.html' },
    { section: 'INSIGHTS' },
    { icon: '📈', label: 'Reports',          href: 'reports/reports.html' },
    { icon: '🔔', label: 'Notifications',    href: 'notifications/notifications.html', badge: '0', badgeId: 'notif-count' },
    { icon: '📝', label: 'Activity Logs',    href: 'logs/activity-logs.html' },
    { section: 'ACCOUNT' },
    { icon: '👤', label: 'My Profile',       href: 'profile/user-profile.html' },
    { icon: '⚙️', label: 'Settings',         href: 'settings/settings.html' },
  ];

  const getBasePath = () => {
    const script = document.querySelector('script[src$="sidebar.js"]');
    if (script) {
      const src = script.getAttribute('src');
      if (src.startsWith('../')) return '../';
    }
    return '';
  };

  const buildSidebarHTML = () => {
    const prefix = getBasePath();
    let html = `
      <aside class="sidebar" id="sidebar">
        <button class="sidebar-toggle" id="sidebar-toggle" title="Toggle Sidebar">‹</button>
        <a href="${prefix}dashboard.html" class="sidebar-brand">
          <div class="brand-logo">⚡</div>
          <div class="brand-text">
            <span class="brand-name">AssetFlow</span>
            <span class="brand-tagline">ERP System</span>
          </div>
        </a>
        <nav class="sidebar-nav" id="sidebar-nav">
    `;

    NAV_ITEMS.forEach(item => {
      if (item.section) {
        html += `<div class="nav-section-label">${item.section}</div>`;
        return;
      }

      const badgeHtml = item.badgeId
        ? `<span class="nav-badge" id="${item.badgeId}" style="display:none">0</span>`
        : item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';

      const tooltip = `data-tooltip="${item.label}"`;

      html += `
        <a class="nav-item" href="${prefix}${item.href}" ${tooltip}>
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
          ${badgeHtml}
        </a>
      `;
    });

    html += `
        </nav>
        <div class="sidebar-footer">
          <a class="sidebar-user" href="../profile/user-profile.html">
            <div class="avatar-placeholder avatar-md" id="sidebar-avatar">??</div>
            <div class="user-info">
              <div class="user-name" id="sidebar-name">Loading...</div>
              <div class="user-role" id="sidebar-role"></div>
            </div>
            <div class="user-status-dot"></div>
          </a>
        </div>
      </aside>
      <div class="sidebar-overlay hidden" id="sidebar-overlay"></div>
    `;
    return html;
  };

  const inject = (containerId = 'sidebar-container') => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = buildSidebarHTML();
    }
    init();
  };

  const init = () => {
    const sidebar  = document.getElementById('sidebar');
    const toggle   = document.getElementById('sidebar-toggle');
    const overlay  = document.getElementById('sidebar-overlay');
    const mainContent = document.querySelector('.main-content');

    if (!sidebar) return;

    // Restore collapsed state
    const collapsed = localStorage.getItem('af_sidebar_collapsed') === 'true';
    if (collapsed) {
      sidebar.classList.add('collapsed');
      if (mainContent) mainContent.classList.add('collapsed');
      if (toggle) toggle.textContent = '›';
    }

    // Toggle button
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isNowCollapsed = sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('collapsed', isNowCollapsed);
        toggle.textContent = isNowCollapsed ? '›' : '‹';
        localStorage.setItem('af_sidebar_collapsed', isNowCollapsed);
      });
    }

    // Mobile toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        if (overlay) overlay.classList.toggle('hidden');
      });
    }

    // Overlay click
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.add('hidden');
      });
    }

    // Populate user info
    populateUser();

    // Set active nav item
    Utils.setActiveNav();

    // Load notification count
    loadNotifCount();
  };

  const populateUser = () => {
    const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
    const nameEl   = document.getElementById('sidebar-name');
    const roleEl   = document.getElementById('sidebar-role');
    const avatarEl = document.getElementById('sidebar-avatar');

    if (user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
      if (nameEl)   nameEl.textContent = fullName;
      if (roleEl)   roleEl.textContent = user.role?.replace(/_/g, ' ') || '';
      if (avatarEl) avatarEl.textContent = Utils.Format.initials(fullName);
    }
  };

  const loadNotifCount = async () => {
    try {
      const data = await API.notifications.getCount();
      const count = data?.count || 0;
      const badge = document.getElementById('notif-count');
      if (badge && count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = '';
      }
    } catch (_) { /* silent */ }
  };

  return { inject, init, populateUser, loadNotifCount };

})();

// Auto-init if sidebar-container exists
if (document.getElementById('sidebar-container')) {
  Sidebar.inject();
}

document.addEventListener('DOMContentLoaded', () => {
  Utils.initTabs();
  Utils.initSubmenus();
});

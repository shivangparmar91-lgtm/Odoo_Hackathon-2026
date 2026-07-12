/* ============================================================
   AssetFlow – Sidebar Module
   Shared sidebar HTML, toggle, mobile, populate user info
   ============================================================ */

const Sidebar = (() => {

  const NAV_ITEMS = [
    { icon: '📊', label: 'Dashboard',        href: '../dashboard.html',                  section: null },
    { section: 'ORGANIZATION' },
    { icon: '🏢', label: 'Departments',      href: '../organization/departments.html',   submenu: 'sub-org', parent: true },
    { icon: '📁', label: 'Asset Categories', href: '../organization/categories.html',    submenu: 'sub-org' },
    { icon: '👥', label: 'Employee Directory',href: '../organization/employees.html',    submenu: 'sub-org' },
    { section: 'ASSETS' },
    { icon: '➕', label: 'Register Asset',   href: '../assets/registration.html',        submenu: 'sub-assets', parent: true },
    { icon: '📋', label: 'Asset Directory',  href: '../assets/directory.html',           submenu: 'sub-assets' },
    { icon: '🔗', label: 'Allocations',      href: '../assets/allocation.html',          submenu: 'sub-assets' },
    { icon: '↔️', label: 'Transfers',        href: '../assets/transfer.html',            submenu: 'sub-assets' },
    { icon: '↩️', label: 'Returns',          href: '../assets/return.html',              submenu: 'sub-assets' },
    { section: 'OPERATIONS' },
    { icon: '📅', label: 'Resource Booking', href: '../booking/resource-booking.html',   badge: null },
    { icon: '🔧', label: 'Maintenance',      href: '../maintenance/maintenance.html',    badge: null },
    { icon: '🔍', label: 'Audit Cycle',      href: '../audit/audit-cycle.html' },
    { section: 'INSIGHTS' },
    { icon: '📈', label: 'Reports',          href: '../reports/reports.html' },
    { icon: '🔔', label: 'Notifications',    href: '../notifications/notifications.html', badge: '0', badgeId: 'notif-count' },
    { icon: '📝', label: 'Activity Logs',    href: '../logs/activity-logs.html' },
    { section: 'ACCOUNT' },
    { icon: '👤', label: 'My Profile',       href: '../profile/user-profile.html' },
    { icon: '⚙️', label: 'Settings',         href: '../settings/settings.html' },
  ];

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

  // ── RBAC Filtering ──
  const filterNavItems = () => {
    const role = typeof Auth !== 'undefined' ? Auth.getRole() : 'EMPLOYEE';
    return NAV_ITEMS.filter(item => {
      if (item.section) return true; // Keep sections, clean them up later
      if (item.label === 'Dashboard' || item.label === 'My Profile' || item.label === 'Settings' || item.label === 'Notifications') return true;
      if (role === 'ADMIN') return true;
      if (role === 'ASSET_MANAGER') {
        return !['Departments', 'Employee Directory'].includes(item.label);
      }
      if (role === 'DEPT_HEAD') {
        return ['Asset Directory', 'Allocations', 'Transfers', 'Resource Booking', 'Reports', 'Activity Logs'].includes(item.label);
      }
      if (role === 'EMPLOYEE') {
        return ['Asset Directory', 'Resource Booking', 'Maintenance', 'Returns'].includes(item.label);
      }
      return false;
    });
  };

  const populateUser = () => {
    const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
    const nameEl = document.getElementById('sidebar-name');
    const roleEl = document.getElementById('sidebar-role');
    const avatarEl = document.getElementById('sidebar-avatar');

    if (user && nameEl && roleEl) {
      nameEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      roleEl.textContent = (user.role || 'Employee').replace('_', ' ');
      if (avatarEl) {
        avatarEl.textContent = typeof Utils !== 'undefined' && Utils.Format 
          ? Utils.Format.initials(`${user.firstName} ${user.lastName}`) 
          : 'U';
      }
    }
  };

  const getPrefix = () => {
    const script = document.querySelector('script[src*="sidebar.js"]');
    let prefix = './';
    if (script) {
      const src = script.getAttribute('src');
      const match = src.match(/^(\.\.\/)+/);
      if (match) {
        prefix = match[0];
      }
    }
    return prefix;
  };

  const buildSidebarHTML = () => {
    const prefix = getPrefix();
    let html = `
      <aside class="sidebar" id="sidebar">
        <button class="sidebar-toggle" id="sidebar-toggle" title="Toggle Sidebar">‹</button>
        <a href="${'../dashboard.html'.replace('../', prefix)}" class="sidebar-brand nav-link">
          <div class="brand-logo">⚡</div>
          <div class="brand-text">
            <span class="brand-name">AssetFlow</span>
            <span class="brand-tagline">ERP System</span>
          </div>
        </a>
        <nav class="sidebar-nav" id="sidebar-nav">
    `;

    let lastWasSection = false;
    const filteredItems = filterNavItems();
    
    filteredItems.forEach((item, idx) => {
      if (item.section) {
        // Skip consecutive sections or trailing sections
        const nextItem = filteredItems[idx + 1];
        if (!nextItem || nextItem.section) return;
        html += `<div class="nav-section-label">${item.section}</div>`;
        lastWasSection = true;
        return;
      }
      lastWasSection = false;

      const badgeHtml = item.badgeId
        ? `<span class="nav-badge" id="${item.badgeId}" style="display:none">0</span>`
        : item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';

      const tooltip = `data-tooltip="${item.label}"`;
      const itemHref = item.href ? item.href.replace('../', prefix) : '#';

      html += `
        <a class="nav-item nav-link" href="${itemHref}" ${tooltip}>
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
          ${badgeHtml}
        </a>
      `;
    });

    html += `
        </nav>
        <div class="sidebar-footer">
          <a class="sidebar-user nav-link" href="${'../profile/user-profile.html'.replace('../', prefix)}">
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

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        overlay.classList.add('hidden');
      });
    }

    populateUser();
    Utils.setActiveNav();
    loadNotifCount();
  };

  // ── SPA Router ──
  const handleRouting = () => {
    document.body.addEventListener('click', async (e) => {
      const link = e.target.closest('a.nav-link, a.nav-item');
      if (link && link.href && link.origin === location.origin && !link.href.includes('#')) {
        e.preventDefault();
        const url = link.href;
        if (url === location.href) return; // already here

        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Page not found');
          const html = await res.text();
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          const newMain = doc.querySelector('#main-content');
          const currentMain = document.querySelector('#main-content');
          
          if (newMain && currentMain) {
            history.pushState({}, '', url);
            currentMain.innerHTML = newMain.innerHTML;
            
            // Re-highlight nav
            Utils.setActiveNav();
            document.getElementById('sidebar')?.classList.remove('mobile-open');
            document.getElementById('sidebar-overlay')?.classList.add('hidden');

            // Find all script tags in the new head/body that aren't loaded yet
            const newScripts = Array.from(doc.querySelectorAll('script[src]'));
            for (const script of newScripts) {
              const src = script.getAttribute('src');
              const absoluteUrl = new URL(src, url).href;
              const fileName = absoluteUrl.split('/').pop().split('?')[0];
              
              // Check if a script with this filename is already in the document
              const alreadyLoaded = Array.from(document.querySelectorAll('script[src]')).some(s => {
                return s.src && s.src.split('/').pop().split('?')[0] === fileName;
              });
              
              if (!alreadyLoaded) {
                await new Promise((resolve) => {
                  const s = document.createElement('script');
                  s.src = absoluteUrl;
                  s.onload = resolve;
                  s.onerror = resolve;
                  document.body.appendChild(s);
                });
              }
            }

            // Fire custom event so the newly loaded page can initialize
            window.dispatchEvent(new Event('pageLoaded'));
          } else {
            window.location.href = url; // Fallback
          }
        } catch (err) {
          window.location.href = url; // Fallback
        }
      }
    });

    window.addEventListener('popstate', () => {
      window.location.reload(); // Fallback for back button
    });
  };

  return { inject, init, populateUser, loadNotifCount, handleRouting };

})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('sidebar-container')) {
    Sidebar.inject();
    Sidebar.handleRouting();
  }
  Utils.initTabs();
  Utils.initSubmenus();
});

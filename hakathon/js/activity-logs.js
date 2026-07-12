/* Activity Logs JS */
const LogsPage = (() => {
  let state = { search: '', logs: [], users: [] };

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'badge-success', 'ALLOCATE': 'badge-primary', 'RETURN': 'badge-primary',
      'APPROVE': 'badge-success', 'COMPLETE': 'badge-success', 'AUDIT_COMPLETE': 'badge-success',
      'REPORT_ISSUE': 'badge-warning', 'TRANSFER': 'badge-primary', 'BOOK': 'badge-primary',
      'RETIRE': 'badge-danger', 'UPDATE': 'badge-neutral', 'AUDIT_START': 'badge-primary',
      'LOGIN': 'badge-neutral', 'LOGOUT': 'badge-neutral', 'DELETE': 'badge-danger',
    };
    return colors[action] || 'badge-neutral';
  };

  const load = async () => {
    state.search = document.getElementById('log-search') ? document.getElementById('log-search').value.trim() : '';
    const tbody = document.getElementById('log-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">${Utils.skeletonRows(6, 5)}</td></tr>`;

    try {
      const [res, usersRes] = await Promise.all([
        API.activityLogs.getAll(state.search ? `search=${state.search}` : ''),
        API.employees.getAll()
      ]);
      state.logs  = res.content  || res  || [];
      state.users = Array.isArray(usersRes) ? usersRes : (usersRes.content || []);
    } catch (err) {
      console.error(err);
      state.logs = [];
    }

    // Build user map to resolve userId → name
    const userMap = {};
    state.users.forEach(u => { userMap[u.id] = u; });

    if (!state.logs.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No logs found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = state.logs.map(l => {
      const user = userMap[l.userId] || userMap[l.performedById];
      const userName = user
        ? `${user.firstName} ${user.lastName}`
        : (l.user || l.performedBy || l.userName || 'System');

      return `
      <tr class="animate-fade-up">
        <td class="font-mono" style="font-size:.8125rem">${Utils.Format.datetime ? Utils.Format.datetime(l.date || l.timestamp || l.createdAt) : (l.date || '—')}</td>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem">
            ${Utils.avatarHtml ? Utils.avatarHtml(userName, 'sm') : ''}
            <span style="font-weight:600">${Utils.escapeHtml(userName)}</span>
          </div>
        </td>
        <td><span class="badge ${getActionColor(l.action)}">${Utils.escapeHtml((l.action || 'SYSTEM_EVENT').replace(/_/g, ' '))}</span></td>
        <td><span style="font-size:.8125rem;color:var(--text-secondary)">${Utils.escapeHtml(l.entityType || l.module || 'SYSTEM')}</span></td>
        <td style="font-size:.875rem;color:var(--text-secondary)">${Utils.escapeHtml(l.description || l.details || '')}</td>
      </tr>`;
    }).join('');
  };

  return { load, state };
})();

const initLogsView = () => {
  if (!document.getElementById('log-tbody')) return;
  Auth.requireAuth();
  LogsPage.load();
  Utils.setupSearch('log-search', q => { LogsPage.state.search = q; LogsPage.load(); });
};

document.addEventListener('DOMContentLoaded', initLogsView);
window.addEventListener('pageLoaded', initLogsView);

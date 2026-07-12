/* Activity Logs JS */
const LogsPage = (() => {
  let state = { search:'', logs:[] };

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'badge-success', 'ALLOCATE': 'badge-primary', 'RETURN': 'badge-primary',
      'APPROVE': 'badge-success', 'COMPLETE': 'badge-success', 'AUDIT_COMPLETE': 'badge-success',
      'REPORT_ISSUE': 'badge-warning', 'TRANSFER': 'badge-primary', 'BOOK': 'badge-primary',
      'RETIRE': 'badge-danger', 'UPDATE': 'badge-neutral', 'AUDIT_START': 'badge-primary',
    };
    return colors[action] || 'badge-neutral';
  };

  const load = async () => {
    state.search = document.getElementById('log-search') ? document.getElementById('log-search').value.trim() : '';
    const tbody = document.getElementById('log-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5">${Utils.skeletonRows(6, 5)}</td></tr>`;
    
    try {
      const params = Utils.buildQuery({ search: state.search });
      const res = await API.logs.getAll(params);
      state.logs = res.content || res || [];
    } catch (err) {
      console.error(err);
      state.logs = [];
    }

    if(!state.logs.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No logs found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = state.logs.map(l => `
      <tr class="animate-fade-up">
        <td class="font-mono" style="font-size:.8125rem">${Utils.Format.datetime(l.timestamp || l.createdAt)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem">
            ${Utils.avatarHtml ? Utils.avatarHtml(l.user || l.performedBy || 'System', 'sm') : ''}
            <span style="font-weight:600">${Utils.escapeHtml(l.user || l.performedBy || 'System')}</span>
          </div>
        </td>
        <td><span class="badge ${getActionColor(l.action)}">${(l.action || 'SYSTEM_EVENT').replace('_',' ')}</span></td>
        <td><span style="font-size:.8125rem;color:var(--text-secondary)">${Utils.escapeHtml(l.module || l.entityType || 'SYSTEM')}</span></td>
        <td style="font-size:.875rem;color:var(--text-secondary)">${Utils.escapeHtml(l.details || l.description || '')}</td>
      </tr>
    `).join('');
  };

  return { load, state };
})();

const initLogsView = () => {
  if (!document.getElementById('log-tbody')) return;
  Auth.requireAuth();
  LogsPage.load();
  Utils.setupSearch('log-search', q => { LogsPage.state.search = q.toLowerCase(); LogsPage.load(); });
};

document.addEventListener('DOMContentLoaded', initLogsView);
window.addEventListener('pageLoaded', initLogsView);

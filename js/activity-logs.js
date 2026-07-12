/* Activity Logs JS */
const LogsPage = (() => {
  let state = { search:'', page:1, pageSize:25, total:0 };

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
    const tbody = document.getElementById('log-tbody');
    tbody.innerHTML = `<tr><td colspan="5"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let logs = [];
    try {
      const params = Utils.buildQuery({ search: state.search, page: state.page - 1, size: state.pageSize });
      const res = await API.activityLogs.getAll(params);
      logs = res.content || res || [];
      state.total = res.totalElements || logs.length;
    } catch (err) {
      Utils.Toast.api(err);
      state.total = 0;
    }

    if (!logs.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">📝</div><h3>No activity logs found</h3></div></td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr class="animate-fade-up">
        <td class="font-mono" style="font-size:.8125rem">${Utils.Format.datetime(l.timestamp || l.createdAt)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem">
            ${Utils.avatarHtml ? Utils.avatarHtml(l.user || l.userName || 'System', 'sm') : ''}
            <span style="font-weight:600">${Utils.escapeHtml(l.user || l.userName || 'System')}</span>
          </div>
        </td>
        <td><span class="badge ${getActionColor(l.action)}">${Utils.escapeHtml((l.action||'').replace('_',' '))}</span></td>
        <td><span style="font-size:.8125rem;color:var(--text-secondary)">${Utils.escapeHtml(l.module || l.entityType || '')}</span></td>
        <td style="font-size:.875rem;color:var(--text-secondary)">${Utils.escapeHtml(l.details || l.description || '')}</td>
      </tr>
    `).join('');

    const pagEl = document.getElementById('log-pagination');
    if (pagEl) {
      Utils.renderPagination(pagEl, {
        page: state.page, totalPages: Math.ceil(state.total / state.pageSize),
        total: state.total, pageSize: state.pageSize,
        onPageChange: (p) => { state.page = p; load(); }
      });
    }
  };

  return { load, state };
})();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  // Only ADMIN can view activity logs
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  if (user && user.role !== 'ADMIN') {
    document.body.innerHTML = `<div style="display:flex;height:100vh;align-items:center;justify-content:center;flex-direction:column;gap:1rem">
      <div style="font-size:3rem">🔒</div>
      <h2>Access Denied</h2>
      <p style="color:var(--text-muted)">Activity logs are only accessible to Admins.</p>
      <a href="../dashboard.html" class="btn btn-primary">← Go to Dashboard</a>
    </div>`;
    return;
  }
  LogsPage.load();
  Utils.setupSearch('log-search', q => { LogsPage.state.search = q.toLowerCase(); LogsPage.state.page = 1; LogsPage.load(); });
});

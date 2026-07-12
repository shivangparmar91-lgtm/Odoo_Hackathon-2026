/* Audit JS */
const AuditPage = (() => {
  let state = { audits: [] };

  const load = async () => {
    const tbody = document.getElementById('audit-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7">${Utils.skeletonRows(4, 7)}</td></tr>`;

    try {
      const [res, usersRes] = await Promise.all([
        API.audits.getAll(),
        API.employees.getAll()
      ]);
      state.audits = res.content || res || [];
      state.users  = Array.isArray(usersRes) ? usersRes : (usersRes.content || []);
    } catch (err) {
      console.error(err);
      state.audits = [];
      state.users  = [];
    }

    // Build user map for auditor resolution
    const userMap = {};
    (state.users || []).forEach(u => { userMap[u.id] = u; });

    if (!state.audits.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No audits found.</div></td></tr>`;
    } else {
      tbody.innerHTML = state.audits.map(a => {
        const auditorUser = userMap[a.auditorId] || userMap[a.assignedToId];
        const auditorName = auditorUser
          ? `${auditorUser.firstName} ${auditorUser.lastName}`
          : (a.auditor || a.assignedTo || '—');
        const progress = a.progress || 0;
        return `
        <tr class="animate-fade-up">
          <td>
            <div style="font-weight:600">${Utils.escapeHtml(a.title || a.name || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(a.notes || a.description || '')}</div>
          </td>
          <td><span class="badge badge-neutral">${Utils.escapeHtml(a.scope || 'ALL')}</span></td>
          <td style="font-weight:500">${Utils.escapeHtml(auditorName)}</td>
          <td style="font-size:.8125rem">${Utils.Format.date(a.startDate || a.start)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:.5rem">
              <div style="flex:1;height:8px;background:var(--bg-elevated);border-radius:4px;overflow:hidden;min-width:80px">
                <div style="height:100%;width:${progress}%;background:${progress===100?'var(--success)':'var(--primary)'};transition:width .6s ease"></div>
              </div>
              <span style="font-size:.75rem;font-weight:600;min-width:30px">${progress}%</span>
            </div>
            <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px">${a.verifiedCount || 0}/${a.totalAssets || 0} verified</div>
          </td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="AuditPage.view(${a.id})">View</button>
            ${a.status === 'SCHEDULED' || a.status === 'PENDING' ? `<button class="btn btn-ghost btn-sm" onclick="AuditPage.startAudit(${a.id})">Start</button>` : ''}
          </td>
        </tr>`;
      }).join('');
    }

    // Stats
    const el = (id) => document.getElementById(id);
    if (el('stat-aud-total'))     el('stat-aud-total').textContent     = state.audits.length;
    if (el('stat-aud-completed')) el('stat-aud-completed').textContent = state.audits.filter(a => a.status === 'COMPLETED').length;
    if (el('stat-aud-progress'))  el('stat-aud-progress').textContent  = state.audits.filter(a => a.status === 'IN_PROGRESS').length;
    if (el('stat-aud-pending'))   el('stat-aud-pending').textContent   = state.audits.filter(a => a.status === 'SCHEDULED' || a.status === 'PENDING').length;
  };

  const view = (id) => {
    const a = state.audits.find(x => x.id === id);
    if(!a) return;
    const bodyEl = document.getElementById('qa-body');
    if(!bodyEl) return;
    document.getElementById('qa-title').textContent = `🔍 ${Utils.escapeHtml(a.name || a.title || '')}`;
    bodyEl.innerHTML = `
      <div class="info-grid" style="margin-bottom:1rem">
        <div class="info-item"><div class="info-label">Scope</div><div class="info-value">${Utils.escapeHtml(a.scope || 'ALL')}</div></div>
        <div class="info-item"><div class="info-label">Auditor</div><div class="info-value">${Utils.escapeHtml(a.auditor || a.assignedTo || '')}</div></div>
        <div class="info-item"><div class="info-label">Start Date</div><div class="info-value">${Utils.Format.date(a.start || a.startDate)}</div></div>
        <div class="info-item"><div class="info-label">End Date</div><div class="info-value">${a.end || a.endDate ? Utils.Format.date(a.end || a.endDate) : 'In Progress'}</div></div>
        <div class="info-item"><div class="info-label">Total Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${a.totalAssets || 0}</div></div>
        <div class="info-item"><div class="info-label">Verified</div><div class="info-value" style="font-size:1.25rem;font-weight:700;color:var(--success)">${a.verified || 0}</div></div>
        <div class="info-item"><div class="info-label">Discrepancies</div><div class="info-value" style="font-size:1.25rem;font-weight:700;color:var(--danger)">${a.discrepancies || 0}</div></div>
        <div class="info-item"><div class="info-label">Progress</div><div class="info-value">${a.progress || 0}%</div></div>
      </div>
      <div class="form-group"><label class="form-label">Audit Notes</label>
        <p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${Utils.escapeHtml(a.notes || a.description || '')}</p></div>
    `;
    const btn = document.getElementById('qa-confirm-btn');
    if (btn) btn.style.display = 'none';
    Utils.openModal('quick-action-modal');
  };

  const startAudit = (id) => {
    const a = state.audits.find(x => x.id === id);
    if(!a) return;
    Utils.confirmDialog('Start Audit', `Begin audit cycle "${Utils.escapeHtml(a.name || a.title || '')}"?`, async () => {
      try {
        await API.audits.start(id);
        Utils.Toast.success('Audit Started', `Audit is now in progress.`);
        load();
      } catch (err) {
        Utils.Toast.api(err);
      }
    });
  };

  const openAdd = async () => {
    const nameEl = document.getElementById('audit-name');
    if (nameEl) nameEl.value = '';
    // Load dept dropdown
    const deptSel = document.getElementById('audit-dept');
    if (deptSel) {
      deptSel.innerHTML = '<option value="ALL">All Departments</option>';
      try {
        const depts = await API.departments.getAll();
        const list = Array.isArray(depts) ? depts : (depts.content || []);
        deptSel.innerHTML = '<option value="ALL">All Departments</option>' +
          list.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
      } catch (_) {}
    }
    Utils.openModal('audit-modal');
  };

  const save = async () => {
    if(!Utils.validateForm({'audit-name':{required:true}})) return;
    
    const body = {
      name: document.getElementById('audit-name').value.trim(),
      scope: document.getElementById('audit-dept').value || 'ALL'
    };

    try {
      await API.audits.create(body);
      Utils.Toast.success('Started', 'Audit cycle started successfully.');
      Utils.closeModal('audit-modal');
      load();
    } catch(err) {
      Utils.Toast.api(err);
    }
  };

  return { load, openAdd, save, view, startAudit };
})();

window.openAuditModal = () => AuditPage.openAdd();
window.saveAudit = () => AuditPage.save();

const initAuditView = () => {
  if (!document.getElementById('audit-tbody')) return;
  Auth.requireAuth();
  AuditPage.load();
};

document.addEventListener('DOMContentLoaded', initAuditView);
window.addEventListener('pageLoaded', initAuditView);

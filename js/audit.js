/* Audit JS */
const AuditPage = (() => {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isAdmin        = user && user.role === 'ADMIN';
  const isAssetManager = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER');

  const load = async () => {
    const tbody = document.getElementById('audit-tbody');
    tbody.innerHTML = `<tr><td colspan="7"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let audits = [];
    try {
      const res = await API.audits.getAll();
      audits = res.content || res || [];
    } catch (err) {
      Utils.Toast.api(err);
    }

    if (!audits.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No audits found</h3><p>Create an audit cycle to get started.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = audits.map(a => {
        const progress = a.progress || (a.totalAssets > 0 ? Math.round((a.verified / a.totalAssets) * 100) : 0);
        let actions = `<button class="btn btn-ghost btn-sm" onclick="AuditPage.view(${a.id})">View</button>`;
        // Only ASSET_MANAGER / ADMIN can start audits
        if (isAssetManager && a.status === 'PENDING') {
          actions += `<button class="btn btn-ghost btn-sm" onclick="AuditPage.startAudit(${a.id})">Start</button>`;
        }
        return `
        <tr class="animate-fade-up">
          <td>
            <div style="font-weight:600">${Utils.escapeHtml(a.name || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(a.notes || '')}</div>
          </td>
          <td><span class="badge badge-neutral">${Utils.escapeHtml(a.scope || a.department || '')}</span></td>
          <td style="font-weight:500">${Utils.escapeHtml(a.auditor || '')}</td>
          <td style="font-size:.8125rem">${Utils.Format.date(a.start || a.startDate)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:.5rem">
              <div style="flex:1;height:8px;background:var(--bg-elevated);border-radius:4px;overflow:hidden;min-width:80px">
                <div style="height:100%;width:${progress}%;background:${progress===100?'var(--success)':'var(--primary)'};transition:width .6s ease"></div>
              </div>
              <span style="font-size:.75rem;font-weight:600;min-width:30px">${progress}%</span>
            </div>
            <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px">${a.verified||0}/${a.totalAssets||0} verified · ${a.discrepancies||0} gap${(a.discrepancies||0)!==1?'s':''}</div>
          </td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td><div style="display:flex;gap:.25rem">${actions}</div></td>
        </tr>`;
      }).join('');
    }

    // Stats
    const el = (id) => document.getElementById(id);
    if (el('stat-aud-total'))     el('stat-aud-total').textContent     = audits.length;
    if (el('stat-aud-completed')) el('stat-aud-completed').textContent = audits.filter(a=>a.status==='COMPLETED').length;
    if (el('stat-aud-progress'))  el('stat-aud-progress').textContent  = audits.filter(a=>a.status==='IN_PROGRESS').length;
    if (el('stat-aud-pending'))   el('stat-aud-pending').textContent   = audits.filter(a=>a.status==='PENDING').length;
  };

  const view = async (id) => {
    try {
      const a = await API.audits.getById(id);
      const bodyEl = document.getElementById('qa-body');
      if (!bodyEl) return;
      document.getElementById('qa-title').textContent = `🔍 ${a.name}`;
      bodyEl.innerHTML = `
        <div class="info-grid" style="margin-bottom:1rem">
          <div class="info-item"><div class="info-label">Scope</div><div class="info-value">${Utils.escapeHtml(a.scope||a.department||'')}</div></div>
          <div class="info-item"><div class="info-label">Auditor</div><div class="info-value">${Utils.escapeHtml(a.auditor||'')}</div></div>
          <div class="info-item"><div class="info-label">Start Date</div><div class="info-value">${Utils.Format.date(a.start||a.startDate)}</div></div>
          <div class="info-item"><div class="info-label">End Date</div><div class="info-value">${(a.end||a.endDate) ? Utils.Format.date(a.end||a.endDate) : 'In Progress'}</div></div>
          <div class="info-item"><div class="info-label">Total Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${a.totalAssets||0}</div></div>
          <div class="info-item"><div class="info-label">Verified</div><div class="info-value" style="font-size:1.25rem;font-weight:700;color:var(--success)">${a.verified||0}</div></div>
          <div class="info-item"><div class="info-label">Discrepancies</div><div class="info-value" style="font-size:1.25rem;font-weight:700;color:var(--danger)">${a.discrepancies||0}</div></div>
          <div class="info-item"><div class="info-label">Progress</div><div class="info-value">${a.progress||0}%</div></div>
        </div>
        <div class="form-group"><label class="form-label">Audit Notes</label>
          <p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${Utils.escapeHtml(a.notes||'No notes available.')}</p></div>
      `;
      document.getElementById('qa-confirm-btn').style.display = 'none';
      Utils.openModal('quick-action-modal');
    } catch (err) { Utils.Toast.api(err); }
  };

  const startAudit = (id) => {
    if (!isAssetManager) { Utils.Toast.error('Access Denied', 'Only Asset Managers can start audits.'); return; }
    Utils.confirmDialog('Start Audit', 'Begin this audit cycle?', async () => {
      try {
        await API.audits.start(id);
        Utils.Toast.success('Audit Started', 'Audit is now in progress.');
        load();
      } catch (err) { Utils.Toast.api(err); }
    });
  };

  const openAdd = () => {
    if (!isAdmin) { Utils.Toast.error('Access Denied', 'Only Admins can create audit cycles.'); return; }
    const fields = ['audit-name','audit-dept'];
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    Utils.openModal('audit-modal');
  };

  const save = async () => {
    if (!Utils.validateForm({ 'audit-name':{required:true} })) return;
    const btn = document.getElementById('audit-save-btn');
    if (btn) Utils.setButtonLoading(btn, true);
    try {
      await API.audits.create({
        name: document.getElementById('audit-name').value,
        department: document.getElementById('audit-dept')?.value || '',
      });
      Utils.Toast.success('Created', 'Audit cycle created successfully.');
      Utils.closeModal('audit-modal');
      load();
    } catch (err) { Utils.Toast.api(err); }
    if (btn) Utils.setButtonLoading(btn, false);
  };

  return { load, openAdd, save, view, startAudit };
})();

window.openAuditModal = () => AuditPage.openAdd();
window.saveAudit      = () => AuditPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isAdmin = user && user.role === 'ADMIN';
  const addBtn = document.querySelector('button[onclick="openAuditModal()"]');
  if (addBtn && !isAdmin) addBtn.style.display = 'none';

  AuditPage.load();
});

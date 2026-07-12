/* Maintenance JS */
const MaintPage = (() => {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isAdmin        = user && user.role === 'ADMIN';
  const isAssetManager = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER');
  // All roles can raise a maintenance request
  const canCreate = !!user;

  let state = { status:'', priority:'' };

  const priorityBadge = (p) => {
    const map = { CRITICAL:'badge-danger', HIGH:'badge-warning', MEDIUM:'badge-primary', LOW:'badge-neutral' };
    return `<span class="badge ${map[p]||'badge-neutral'}">${p}</span>`;
  };

  const load = async () => {
    const tbody = document.getElementById('maint-tbody');
    tbody.innerHTML = `<tr><td colspan="8"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let records = [];
    try {
      const params = Utils.buildQuery({ status: state.status, priority: state.priority });
      const res = await API.maintenance.getAll(params);
      records = res.content || res || [];
    } catch (err) {
      Utils.Toast.api(err);
    }

    if (!records.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🔧</div><h3>No maintenance records found</h3></div></td></tr>`;
    } else {
      tbody.innerHTML = records.map(m => {
        let actions = `<button class="btn btn-ghost btn-sm" onclick="MaintPage.viewDetails(${m.id})" title="View">👁️</button>`;
        // Only ASSET_MANAGER / ADMIN can update ticket status
        if (isAssetManager && m.status !== 'COMPLETED') {
          actions += `<button class="btn btn-ghost btn-sm" onclick="MaintPage.updateStatus(${m.id})">Update</button>`;
        }
        return `
        <tr class="animate-fade-up">
          <td class="font-mono" style="font-weight:600">${Utils.escapeHtml(m.ticketId || '')}</td>
          <td>
            <div style="font-weight:600">${Utils.escapeHtml(m.assetName || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(m.tag || '')} · ${Utils.escapeHtml(m.dept || '')}</div>
          </td>
          <td><span class="badge badge-neutral">${Utils.escapeHtml(m.type || '')}</span></td>
          <td>${priorityBadge(m.priority)}</td>
          <td>
            <div style="font-weight:500">${Utils.escapeHtml(m.reportedBy || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.Format.date(m.date || m.createdAt)}</div>
          </td>
          <td>${(m.cost||0) > 0 ? Utils.Format.currency(m.cost) : '<span style="color:var(--text-muted)">Free</span>'}</td>
          <td>${Utils.statusBadge(m.status)}</td>
          <td><div style="display:flex;gap:.25rem">${actions}</div></td>
        </tr>`;
      }).join('');
    }

    // Update summary stats (from current page data)
    const el = (id) => document.getElementById(id);
    if (el('stat-pending'))    el('stat-pending').textContent   = records.filter(m=>m.status==='PENDING').length;
    if (el('stat-progress'))   el('stat-progress').textContent  = records.filter(m=>m.status==='IN_PROGRESS').length;
    if (el('stat-completed'))  el('stat-completed').textContent = records.filter(m=>m.status==='COMPLETED').length;
    if (el('stat-maint-cost')) {
      const totalCost = records.filter(m=>m.status==='COMPLETED').reduce((a,m)=>a+(m.cost||0),0);
      el('stat-maint-cost').textContent = Utils.Format.currency(totalCost);
    }
  };

  const loadAssetOptions = async () => {
    try {
      const assets = await API.assets.getAll('size=100');
      Utils.populateSelect('maint-asset', assets, {
        valueKey: 'id',
        labelKey: (a) => `${a.tag} - ${a.name}`,
        placeholder: 'Select Asset...',
      });
    } catch (err) { Utils.Toast.api(err); }
  };

  const openAdd = async () => {
    if (!canCreate) return;
    await loadAssetOptions();
    document.getElementById('maint-asset').value = '';
    document.getElementById('maint-type').value = 'HARDWARE';
    document.getElementById('maint-desc').value = '';
    document.getElementById('maint-cost').value = '';
    Utils.openModal('maint-modal');
  };

  const save = async () => {
    if (!Utils.validateForm({ 'maint-asset':{required:true}, 'maint-desc':{required:true} })) return;
    const btn = document.getElementById('maint-save-btn');
    if (btn) Utils.setButtonLoading(btn, true);
    try {
      await API.maintenance.create({
        assetId: document.getElementById('maint-asset').value,
        type: document.getElementById('maint-type').value,
        description: document.getElementById('maint-desc').value,
        estimatedCost: parseFloat(document.getElementById('maint-cost').value) || 0,
        priority: 'MEDIUM',
      });
      Utils.Toast.success('Submitted', 'Maintenance ticket created successfully.');
      Utils.closeModal('maint-modal');
      load();
    } catch (err) { Utils.Toast.api(err); }
    if (btn) Utils.setButtonLoading(btn, false);
  };

  const updateStatus = async (id) => {
    if (!isAssetManager) { Utils.Toast.error('Access Denied', 'Only Asset Managers can update ticket status.'); return; }
    try {
      const m = await API.maintenance.getById(id);
      const cycle = { 'PENDING':'APPROVED', 'APPROVED':'IN_PROGRESS', 'IN_PROGRESS':'COMPLETED' };
      if (m.status === 'COMPLETED') { Utils.Toast.info('Info', 'Ticket is already completed.'); return; }
      const nextStatus = cycle[m.status];
      Utils.confirmDialog('Update Status', `Mark ticket ${m.ticketId} as ${nextStatus.replace('_',' ')}?`, async () => {
        try {
          if (nextStatus === 'APPROVED')     await API.maintenance.approve(id);
          else if (nextStatus === 'COMPLETED') await API.maintenance.complete(id, {});
          else await API.maintenance.update(id, { status: nextStatus });
          Utils.Toast.success('Updated', 'Ticket status updated.');
          load();
        } catch (e) { Utils.Toast.api(e); }
      });
    } catch (err) { Utils.Toast.api(err); }
  };

  const viewDetails = async (id) => {
    try {
      const m = await API.maintenance.getById(id);
      const body = `
        <div class="info-grid" style="margin-bottom:1rem">
          <div class="info-item"><div class="info-label">Ticket ID</div><div class="info-value font-mono">${Utils.escapeHtml(m.ticketId||'')}</div></div>
          <div class="info-item"><div class="info-label">Asset</div><div class="info-value">${Utils.escapeHtml(m.assetName||'')} (${Utils.escapeHtml(m.tag||'')})</div></div>
          <div class="info-item"><div class="info-label">Type</div><div class="info-value">${Utils.escapeHtml(m.type||'')}</div></div>
          <div class="info-item"><div class="info-label">Priority</div><div class="info-value">${priorityBadge(m.priority)}</div></div>
          <div class="info-item"><div class="info-label">Reported By</div><div class="info-value">${Utils.escapeHtml(m.reportedBy||'')}</div></div>
          <div class="info-item"><div class="info-label">Date Reported</div><div class="info-value">${Utils.Format.date(m.date||m.createdAt)}</div></div>
          <div class="info-item"><div class="info-label">Est. Cost</div><div class="info-value">${(m.cost||0) > 0 ? Utils.Format.currency(m.cost) : 'No cost'}</div></div>
          <div class="info-item"><div class="info-label">Status</div><div class="info-value">${Utils.statusBadge(m.status)}</div></div>
        </div>
        <div class="form-group"><label class="form-label">Description / Notes</label>
          <p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${Utils.escapeHtml(m.description||m.desc||'')}</p></div>
      `;
      document.getElementById('qa-title').textContent = `🔧 ${m.ticketId} – Maintenance Details`;
      document.getElementById('qa-body').innerHTML = body;
      document.getElementById('qa-confirm-btn').style.display = 'none';
      Utils.openModal('quick-action-modal');
    } catch (err) { Utils.Toast.api(err); }
  };

  return { load, openAdd, save, updateStatus, viewDetails, state, loadAssetOptions };
})();

window.openMaintModal = () => MaintPage.openAdd();
window.saveMaint = () => MaintPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  MaintPage.load();
  const sf = document.getElementById('status-filter');
  if (sf) sf.addEventListener('change', e => { MaintPage.state.status = e.target.value; MaintPage.load(); });
  const pf = document.getElementById('priority-filter');
  if (pf) pf.addEventListener('change', e => { MaintPage.state.priority = e.target.value; MaintPage.load(); });
});

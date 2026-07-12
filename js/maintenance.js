/* Maintenance JS */
const MaintPage = (() => {
  let state = { status:'', priority:'', records:[] };

  const priorityBadge = (p) => {
    const map = { CRITICAL:'badge-danger', HIGH:'badge-warning', MEDIUM:'badge-primary', LOW:'badge-neutral' };
    return `<span class="badge ${map[p]||'badge-neutral'}">${p || 'NONE'}</span>`;
  };

  const load = async () => {
    state.status = document.getElementById('status-filter') ? document.getElementById('status-filter').value : '';
    const tbody = document.getElementById('maint-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8">${Utils.skeletonRows(4, 8)}</td></tr>`;

    try {
      const params = Utils.buildQuery({ status: state.status, priority: state.priority });
      const res = await API.maintenance.getAll(params);
      state.records = res.content || res || [];
    } catch (err) {
      console.error(err);
      state.records = [];
    }
    
    if(!state.records.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">No maintenance records found.</div></td></tr>`;
    } else {
      tbody.innerHTML = state.records.map(m => `
        <tr class="animate-fade-up">
          <td class="font-mono" style="font-weight:600">${Utils.escapeHtml(m.ticketId || m.id || '')}</td>
          <td>
            <div style="font-weight:600">${Utils.escapeHtml(m.assetName || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(m.assetTag || m.tag || '')} · ${Utils.escapeHtml(m.dept || '')}</div>
          </td>
          <td><span class="badge badge-neutral">${Utils.escapeHtml(m.type || 'N/A')}</span></td>
          <td>${priorityBadge(m.priority)}</td>
          <td>
            <div style="font-weight:500">${Utils.escapeHtml(m.reportedBy || m.technician || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.Format.date(m.date || m.createdAt)}</div>
          </td>
          <td>${m.cost > 0 ? Utils.Format.currency(m.cost) : '<span style="color:var(--text-muted)">Free</span>'}</td>
          <td>${Utils.statusBadge(m.status)}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="MaintPage.updateStatus(${m.id})">Update</button>
            <button class="btn btn-ghost btn-sm" onclick="MaintPage.viewDetails(${m.id})" title="View">👁️</button>
          </td>
        </tr>
      `).join('');
    }

    // Update summary stats
    const el = (id) => document.getElementById(id);
    if(el('stat-pending'))   el('stat-pending').textContent   = state.records.filter(m=>m.status==='PENDING').length;
    if(el('stat-progress'))  el('stat-progress').textContent  = state.records.filter(m=>m.status==='IN_PROGRESS').length;
    if(el('stat-completed')) el('stat-completed').textContent = state.records.filter(m=>m.status==='COMPLETED').length;
    if(el('stat-maint-cost')) {
      const totalCost = state.records.filter(m=>m.status==='COMPLETED').reduce((a,m)=>a+(m.cost||0),0);
      el('stat-maint-cost').textContent = Utils.Format.currency(totalCost);
    }
  };

  const openAdd = () => {
    document.getElementById('maint-asset').value = '';
    document.getElementById('maint-type').value = 'HARDWARE';
    document.getElementById('maint-desc').value = '';
    document.getElementById('maint-cost').value = '';
    Utils.openModal('maint-modal');
  };

  const save = async () => {
    if(!Utils.validateForm({'maint-asset':{required:true}, 'maint-desc':{required:true}})) return;
    
    const body = {
      assetTag: document.getElementById('maint-asset').value.trim(),
      type: document.getElementById('maint-type').value,
      cost: parseFloat(document.getElementById('maint-cost').value)||0,
      description: document.getElementById('maint-desc').value.trim()
    };
    
    try {
      await API.maintenance.create(body);
      Utils.Toast.success('Submitted', 'Maintenance ticket created successfully.');
      Utils.closeModal('maint-modal');
      load();
    } catch(err) {
      Utils.Toast.api(err);
    }
  };

  const updateStatus = async (id) => {
    const m = state.records.find(x => x.id === id);
    if(!m) return;
    const cycle = { 'PENDING':'APPROVED', 'APPROVED':'IN_PROGRESS', 'IN_PROGRESS':'COMPLETED', 'COMPLETED':'COMPLETED' };
    if(m.status === 'COMPLETED') { Utils.Toast.info('Info', 'Ticket is already completed.'); return; }
    
    Utils.confirmDialog('Update Status', `Advance ticket status to ${cycle[m.status].replace('_', ' ')}?`, async () => {
      try {
        const nextStatus = cycle[m.status];
        if (nextStatus === 'APPROVED') {
          await API.maintenance.approve(id);
        } else if (nextStatus === 'COMPLETED') {
          await API.maintenance.complete(id, { notes: 'Completed via quick update' });
        } else {
          await API.maintenance.update(id, { status: nextStatus });
        }
        Utils.Toast.success('Updated', 'Ticket status updated.');
        load();
      } catch (err) {
        Utils.Toast.api(err);
      }
    });
  };

  const viewDetails = (id) => {
    const m = state.records.find(x => x.id === id);
    if(!m) return;
    const body = `
      <div class="info-grid" style="margin-bottom:1rem">
        <div class="info-item"><div class="info-label">Ticket ID</div><div class="info-value font-mono">${m.ticketId || m.id}</div></div>
        <div class="info-item"><div class="info-label">Asset</div><div class="info-value">${Utils.escapeHtml(m.assetName || '')} (${Utils.escapeHtml(m.assetTag || m.tag || '')})</div></div>
        <div class="info-item"><div class="info-label">Type</div><div class="info-value">${m.type}</div></div>
        <div class="info-item"><div class="info-label">Priority</div><div class="info-value">${m.priority || 'N/A'}</div></div>
        <div class="info-item"><div class="info-label">Reported By</div><div class="info-value">${Utils.escapeHtml(m.reportedBy || m.technician || '')}</div></div>
        <div class="info-item"><div class="info-label">Date Reported</div><div class="info-value">${Utils.Format.date(m.date || m.createdAt)}</div></div>
        <div class="info-item"><div class="info-label">Cost</div><div class="info-value">${m.cost > 0 ? Utils.Format.currency(m.cost) : 'No cost'}</div></div>
        <div class="info-item"><div class="info-label">Status</div><div class="info-value">${Utils.statusBadge(m.status)}</div></div>
      </div>
      <div class="form-group"><label class="form-label">Description / Notes</label>
        <p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${Utils.escapeHtml(m.desc || m.description || '')}</p></div>
    `;
    document.getElementById('qa-title').textContent = `🔧 ${m.ticketId || m.id} – Maintenance Details`;
    document.getElementById('qa-body').innerHTML = body;
    const btn = document.getElementById('qa-confirm-btn');
    if (btn) btn.style.display = 'none';
    Utils.openModal('quick-action-modal');
  };

  return { load, openAdd, save, updateStatus, viewDetails, state };
})();

window.openMaintModal = () => MaintPage.openAdd();
window.saveMaint = () => MaintPage.save();

const initMaintView = () => {
  if (!document.getElementById('maint-tbody')) return;
  Auth.requireAuth();
  MaintPage.load();
  const sf = document.getElementById('status-filter');
  if (sf) {
    const newSf = sf.cloneNode(true);
    sf.parentNode.replaceChild(newSf, sf);
    newSf.addEventListener('change', e => { 
      MaintPage.state.status = e.target.value; 
      MaintPage.load(); 
    });
  }
};

document.addEventListener('DOMContentLoaded', initMaintView);
window.addEventListener('pageLoaded', initMaintView);

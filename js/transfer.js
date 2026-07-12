/* Asset Transfer JS */
const TransferPage = (() => {
  let state = { status: '', transfers: [] };

  const load = async () => {
    state.status = document.getElementById('status-filter') ? document.getElementById('status-filter').value : '';
    const tbody = document.getElementById('transfer-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7">${Utils.skeletonRows(3, 7)}</td></tr>`;
    
    try {
      const params = Utils.buildQuery({ status: state.status });
      const res = await API.transfers.getAll(params);
      state.transfers = res.content || res || [];
    } catch (err) {
      console.error(err);
      state.transfers = [];
    }

    if(!state.transfers.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No transfers found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = state.transfers.map(t => `
      <tr>
        <td class="font-mono">${Utils.escapeHtml(t.reqId || t.id || '')}</td>
        <td><div style="font-weight:600">${Utils.escapeHtml(t.assetName || '')}</div><div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(t.assetTag || t.tag || '')}</div></td>
        <td>${Utils.escapeHtml(t.fromEmployee || t.from || '')}</td>
        <td>${Utils.escapeHtml(t.toEmployee || t.to || '')}</td>
        <td>${Utils.Format.date(t.requestDate || t.date || t.createdAt)}</td>
        <td>${Utils.statusBadge(t.status)}</td>
        <td>
          ${t.status === 'PENDING' ? `
            <button class="btn btn-ghost btn-sm" style="color:var(--success)" onclick="TransferPage.approve(${t.id})">✓</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="TransferPage.reject(${t.id})">✕</button>
          ` : '—'}
        </td>
      </tr>
    `).join('');
  };

  const openAdd = () => {
    document.getElementById('transfer-asset').value = '';
    document.getElementById('transfer-to').value = '';
    document.getElementById('transfer-reason').value = '';
    Utils.openModal('transfer-modal');
  };

  const save = async () => {
    if(!Utils.validateForm({'transfer-asset':{required:true}, 'transfer-to':{required:true}})) return;
    
    const body = {
      assetTag: document.getElementById('transfer-asset').value.trim(),
      toEmployee: document.getElementById('transfer-to').value.trim(),
      reason: document.getElementById('transfer-reason').value.trim()
    };
    
    try {
      await API.transfers.create(body);
      Utils.Toast.success('Submitted', 'Transfer request submitted successfully.');
      Utils.closeModal('transfer-modal');
      load();
    } catch (err) {
      Utils.Toast.api(err);
    }
  };

  const approve = async (id) => {
    try {
      await API.transfers.approve(id, { comments: 'Approved via Quick Action' });
      Utils.Toast.success('Approved', `Transfer approved.`);
      load();
    } catch(err) { Utils.Toast.api(err); }
  };
  const reject = async (id) => {
    try {
      await API.transfers.reject(id, { comments: 'Rejected via Quick Action' });
      Utils.Toast.info('Rejected', `Transfer rejected.`);
      load();
    } catch(err) { Utils.Toast.api(err); }
  };

  return { load, openAdd, save, approve, reject, state };
})();

window.openTransferModal = () => TransferPage.openAdd();
window.saveTransfer = () => TransferPage.save();

const initTransferView = () => {
  if (!document.getElementById('transfer-tbody')) return;
  Auth.requireAuth();
  TransferPage.load();
  
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    const newStatusFilter = statusFilter.cloneNode(true);
    statusFilter.parentNode.replaceChild(newStatusFilter, statusFilter);
    newStatusFilter.addEventListener('change', e => {
      TransferPage.state.status = e.target.value;
      TransferPage.load();
    });
  }
};

document.addEventListener('DOMContentLoaded', initTransferView);
window.addEventListener('pageLoaded', initTransferView);

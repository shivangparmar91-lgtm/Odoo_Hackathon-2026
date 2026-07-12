/* Asset Transfer JS */
const TransferPage = (() => {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  // All roles can initiate a transfer request
  const canInitiate = !!user;
  // Only ASSET_MANAGER, ADMIN, or DEPT_HEAD can approve/reject
  const canApprove = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER' || user.role === 'DEPARTMENT_HEAD');

  let state = { status:'', page:1, pageSize:10, total:0 };

  const load = async () => {
    const tbody = document.getElementById('transfer-tbody');
    tbody.innerHTML = `<tr><td colspan="7"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let transfers = [];
    try {
      const params = Utils.buildQuery({ status: state.status, page: state.page - 1, size: state.pageSize });
      const res = await API.transfers.getAll(params);
      transfers = res.content || res || [];
      state.total = res.totalElements || transfers.length;
    } catch (err) {
      Utils.Toast.api(err);
      state.total = 0;
    }

    if (!transfers.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">↔️</div><h3>No transfers found</h3><p>Initiate a transfer request to move an asset between employees.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = transfers.map(t => {
        let actions = '';
        if (canApprove && t.status === 'PENDING') {
          actions = `
            <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--success)" title="Approve" onclick="TransferPage.approve(${t.id})">✓</button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" title="Reject" onclick="TransferPage.reject(${t.id})">✕</button>
          `;
        }
        return `
        <tr>
          <td class="font-mono">${Utils.escapeHtml(t.reqId || t.transferId || '')}</td>
          <td>
            <div style="font-weight:600">${Utils.escapeHtml(t.assetName || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(t.tag || '')}</div>
          </td>
          <td>${Utils.escapeHtml(t.from || t.fromEmployee || t.fromDept || '')}</td>
          <td>${Utils.escapeHtml(t.to || t.toEmployee || t.toDept || '')}</td>
          <td>${Utils.Format.date(t.date || t.requestedDate)}</td>
          <td>${Utils.statusBadge(t.status)}</td>
          <td><div style="display:flex;gap:.375rem">${actions || '<span style="color:var(--text-muted)">—</span>'}</div></td>
        </tr>`;
      }).join('');
    }

    Utils.renderPagination(document.getElementById('transfer-pagination'), {
      page: state.page, totalPages: Math.ceil(state.total / state.pageSize),
      total: state.total, pageSize: state.pageSize,
      onPageChange: (p) => { state.page = p; load(); }
    });
  };

  const loadFormOptions = async () => {
    try {
      const assets = await API.assets.getAll('size=100');
      Utils.populateSelect('transfer-asset', assets, {
        valueKey: 'id',
        labelKey: (a) => `${a.tag} - ${a.name}`,
        placeholder: 'Select Asset...',
      });
    } catch (err) { Utils.Toast.api(err); }

    try {
      const employees = await API.employees.getAll('size=100');
      Utils.populateSelect('transfer-to', employees, {
        valueKey: 'id',
        labelKey: (e) => `${e.firstName} ${e.lastName}${e.dept ? ' (' + e.dept + ')' : ''}`,
        placeholder: 'Select Recipient...',
      });
    } catch (err) { Utils.Toast.api(err); }
  };

  const openAdd = async () => {
    await loadFormOptions();
    document.getElementById('transfer-asset').value = '';
    document.getElementById('transfer-to').value = '';
    document.getElementById('transfer-reason').value = '';
    Utils.openModal('transfer-modal');
  };

  const save = async () => {
    if (!Utils.validateForm({ 'transfer-asset':{required:true}, 'transfer-to':{required:true} })) return;
    const btn = document.getElementById('transfer-save-btn');
    if (btn) Utils.setButtonLoading(btn, true);
    try {
      await API.transfers.create({
        assetId: document.getElementById('transfer-asset').value,
        toEmployeeId: document.getElementById('transfer-to').value,
        reason: document.getElementById('transfer-reason').value,
      });
      Utils.Toast.success('Submitted', 'Transfer request submitted successfully.');
      Utils.closeModal('transfer-modal');
      load();
    } catch (err) { Utils.Toast.api(err); }
    if (btn) Utils.setButtonLoading(btn, false);
  };

  const approve = (id) => {
    if (!canApprove) { Utils.Toast.error('Access Denied', 'You do not have permission to approve transfers.'); return; }
    Utils.confirmDialog('Approve Transfer', 'Approve this transfer request?', async () => {
      try {
        await API.transfers.approve(id, {});
        Utils.Toast.success('Approved', 'Transfer approved successfully.');
        load();
      } catch (err) { Utils.Toast.api(err); }
    });
  };

  const reject = (id) => {
    if (!canApprove) { Utils.Toast.error('Access Denied', 'You do not have permission to reject transfers.'); return; }
    Utils.confirmDialog('Reject Transfer', 'Reject this transfer request?', async () => {
      try {
        await API.transfers.reject(id, { reason: 'Rejected by manager' });
        Utils.Toast.info('Rejected', 'Transfer request rejected.');
        load();
      } catch (err) { Utils.Toast.api(err); }
    });
  };

  return { load, openAdd, save, approve, reject, state, loadFormOptions };
})();

window.openTransferModal = () => TransferPage.openAdd();
window.saveTransfer      = () => TransferPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  TransferPage.load();
  const sf = document.getElementById('status-filter');
  if (sf) sf.addEventListener('change', e => { TransferPage.state.status = e.target.value; TransferPage.state.page = 1; TransferPage.load(); });
});

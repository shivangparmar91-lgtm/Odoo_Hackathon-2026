/* Asset Transfer JS */
const TransferPage = (() => {
  let state = { status: '', transfers: [], assets: [], users: [] };

  const load = async () => {
    state.status = document.getElementById('status-filter') ? document.getElementById('status-filter').value : '';
    const tbody = document.getElementById('transfer-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7">${Utils.skeletonRows(3, 7)}</td></tr>`;

    try {
      const [res, assetsRes, usersRes] = await Promise.all([
        API.transfers.getAll(state.status ? `status=${state.status}` : ''),
        API.assets.getAll(),
        API.employees.getAll()
      ]);
      state.transfers = res.content || res || [];
      state.assets    = Array.isArray(assetsRes) ? assetsRes : (assetsRes.content || []);
      state.users     = Array.isArray(usersRes)  ? usersRes  : (usersRes.content  || []);
    } catch (err) {
      console.error(err);
      state.transfers = [];
    }

    const assetMap = {};
    state.assets.forEach(a => { assetMap[a.id] = a; });
    const userMap = {};
    state.users.forEach(u => { userMap[u.id] = u; });

    if (!state.transfers.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No transfers found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = state.transfers.map(t => {
      const asset    = assetMap[t.assetId];
      const fromUser = userMap[t.fromUserId] || userMap[t.fromEmployeeId];
      const toUser   = userMap[t.toUserId]   || userMap[t.toEmployeeId];

      const assetName = asset    ? asset.name                                  : (t.assetName    || '—');
      const assetTag  = asset    ? asset.assetTag                              : (t.assetTag      || '');
      const fromName  = fromUser ? `${fromUser.firstName} ${fromUser.lastName}`: (t.fromEmployee || t.from || '—');
      const toName    = toUser   ? `${toUser.firstName} ${toUser.lastName}`    : (t.toEmployee   || t.to   || '—');

      return `
      <tr>
        <td class="font-mono">${Utils.escapeHtml(String(t.id || ''))}</td>
        <td>
          <div style="font-weight:600">${Utils.escapeHtml(assetName)}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(assetTag)}</div>
        </td>
        <td>${Utils.escapeHtml(fromName)}</td>
        <td>${Utils.escapeHtml(toName)}</td>
        <td>${Utils.Format.date(t.requestDate || t.date || t.createdAt)}</td>
        <td>${Utils.statusBadge(t.status)}</td>
        <td>
          ${t.status === 'PENDING' ? `
            <button class="btn btn-ghost btn-sm" style="color:var(--success)" onclick="TransferPage.approve(${t.id})">✓ Approve</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger)"  onclick="TransferPage.reject(${t.id})">✕ Reject</button>
          ` : '<span style="color:var(--text-muted)">—</span>'}
        </td>
      </tr>`;
    }).join('');
  };

  const openAdd = async () => {
    document.getElementById('transfer-reason').value = '';

    // Load asset dropdown
    const assetSel = document.getElementById('transfer-asset');
    if (assetSel) {
      assetSel.innerHTML = '<option value="">Loading assets…</option>';
      try {
        const assets = state.assets.length ? state.assets : await API.assets.getAll().then(r => Array.isArray(r) ? r : r.content || []);
        assetSel.innerHTML = '<option value="">Select Asset…</option>' +
          assets.map(a => `<option value="${a.id}">${a.assetTag} — ${a.name}</option>`).join('');
      } catch { assetSel.innerHTML = '<option value="">Failed to load</option>'; }
    }

    // Load employee dropdown
    const empSel = document.getElementById('transfer-to');
    if (empSel) {
      empSel.innerHTML = '<option value="">Loading employees…</option>';
      try {
        const users = state.users.length ? state.users : await API.employees.getAll().then(r => Array.isArray(r) ? r : r.content || []);
        empSel.innerHTML = '<option value="">Transfer To…</option>' +
          users.map(u => `<option value="${u.id}">${u.firstName} ${u.lastName} (${u.empId || u.email})</option>`).join('');
      } catch { empSel.innerHTML = '<option value="">Failed to load</option>'; }
    }

    Utils.openModal('transfer-modal');
  };

  const save = async () => {
    if (!Utils.validateForm({'transfer-asset': {required:true}, 'transfer-to': {required:true}})) return;

    const body = {
      assetId:      parseInt(document.getElementById('transfer-asset').value),
      toEmployeeId: parseInt(document.getElementById('transfer-to').value),
      reason:       document.getElementById('transfer-reason').value.trim()
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
      await API.transfers.approve(id, { comments: 'Approved' });
      Utils.Toast.success('Approved', 'Transfer approved.');
      load();
    } catch (err) { Utils.Toast.api(err); }
  };

  const reject = async (id) => {
    try {
      await API.transfers.reject(id, { comments: 'Rejected' });
      Utils.Toast.info('Rejected', 'Transfer rejected.');
      load();
    } catch (err) { Utils.Toast.api(err); }
  };

  return { load, openAdd, save, approve, reject, state };
})();

window.openTransferModal = () => TransferPage.openAdd();
window.saveTransfer      = () => TransferPage.save();

const initTransferView = () => {
  if (!document.getElementById('transfer-tbody')) return;
  Auth.requireAuth();
  TransferPage.load();

  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    const newEl = statusFilter.cloneNode(true);
    statusFilter.parentNode.replaceChild(newEl, statusFilter);
    newEl.addEventListener('change', e => { TransferPage.state.status = e.target.value; TransferPage.load(); });
  }
};

document.addEventListener('DOMContentLoaded', initTransferView);
window.addEventListener('pageLoaded', initTransferView);

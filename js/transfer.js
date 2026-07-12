/* Asset Transfer JS */
const DEMO_TRANSFERS = [
  { id:1, reqId:'TRF-001', tag:'AF-2025-001', assetName:'Dell Latitude', from:'Alice Johnson', to:'Bob Smith', date:'2024-03-01', status:'PENDING' },
  { id:2, reqId:'TRF-002', tag:'AF-2025-004', assetName:'iPhone 14', from:'IT Dept', to:'David Lee', date:'2024-02-15', status:'APPROVED' },
];

const TransferPage = (() => {
  let state = { status:'' };

  const load = () => {
    const filtered = DEMO_TRANSFERS.filter(t => !state.status || t.status === state.status);
    const tbody = document.getElementById('transfer-tbody');
    
    if(!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No transfers found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(t => `
      <tr>
        <td class="font-mono">${t.reqId}</td>
        <td><div style="font-weight:600">${t.assetName}</div><div style="font-size:.75rem;color:var(--text-muted)">${t.tag}</div></td>
        <td>${t.from}</td>
        <td>${t.to}</td>
        <td>${Utils.Format.date(t.date)}</td>
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

  const save = () => {
    if(!Utils.validateForm({'transfer-asset':{required:true}, 'transfer-to':{required:true}})) return;
    Utils.Toast.success('Submitted', 'Transfer request submitted successfully.');
    Utils.closeModal('transfer-modal');
    load();
  };

  const approve = (id) => {
    const t = DEMO_TRANSFERS.find(x => x.id === id);
    if(t) t.status = 'APPROVED';
    Utils.Toast.success('Approved', `Transfer ${t.reqId} approved.`);
    load();
  };
  const reject = (id) => {
    const t = DEMO_TRANSFERS.find(x => x.id === id);
    if(t) t.status = 'REJECTED';
    Utils.Toast.info('Rejected', `Transfer ${t.reqId} rejected.`);
    load();
  };

  return { load, openAdd, save, approve, reject, state };
})();

window.openTransferModal = () => TransferPage.openAdd();
window.saveTransfer = () => TransferPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  TransferPage.load();
  document.getElementById('status-filter').addEventListener('change', e => {
    TransferPage.state.status = e.target.value;
    TransferPage.load();
  });
});

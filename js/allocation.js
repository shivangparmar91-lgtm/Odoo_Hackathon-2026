/* Asset Allocation JS */
const DEMO_ALLOCS = [
  { id:1, tag:'AF-2025-001', assetName:'Dell Latitude 7420', empName:'Alice Johnson', date:'2024-01-10', returnDate:'2025-01-10', status:'ACTIVE' },
  { id:2, tag:'AF-2025-003', assetName:'Herman Miller Chair', empName:'Bob Smith', date:'2023-11-15', returnDate:null, status:'ACTIVE' },
  { id:3, tag:'AF-2025-007', assetName:'Lenovo ThinkPad X1', empName:'David Lee', date:'2023-08-20', returnDate:'2024-08-20', status:'ACTIVE' },
];

const AllocPage = (() => {
  let state = { page:1, pageSize:10, search:'', status:'' };

  const load = () => {
    const filtered = DEMO_ALLOCS.filter(a => 
      (!state.search || `${a.tag} ${a.assetName} ${a.empName}`.toLowerCase().includes(state.search)) &&
      (!state.status || a.status === state.status)
    );
    const slice = filtered.slice((state.page-1)*state.pageSize, state.page*state.pageSize);
    
    const tbody = document.getElementById('alloc-tbody');
    if(!slice.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No allocations found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = slice.map(a => `
      <tr>
        <td class="font-mono">${a.tag}</td>
        <td style="font-weight:600">${a.assetName}</td>
        <td>${a.empName}</td>
        <td>${Utils.Format.date(a.date)}</td>
        <td>${a.returnDate ? Utils.Format.date(a.returnDate) : '—'}</td>
        <td>${Utils.statusBadge(a.status)}</td>
        <td>
          <button class="btn btn-ghost btn-icon btn-sm" title="Return Asset" onclick="AllocPage.returnAsset(${a.id}, '${a.tag}')">↩️</button>
        </td>
      </tr>
    `).join('');
    
    Utils.renderPagination(document.getElementById('alloc-pagination'), {
      page: state.page, totalPages: Math.ceil(filtered.length/state.pageSize),
      total: filtered.length, pageSize: state.pageSize,
      onPageChange: (p) => { state.page = p; load(); }
    });
  };

  const openAdd = () => {
    document.getElementById('alloc-emp').value = '';
    document.getElementById('alloc-asset').value = '';
    document.getElementById('alloc-return-date').value = '';
    document.getElementById('alloc-notes').value = '';
    Utils.openModal('alloc-modal');
  };

  const save = async () => {
    const valid = Utils.validateForm({
      'alloc-emp': {required:true},
      'alloc-asset': {required:true}
    });
    if(!valid) return;
    
    const btn = document.getElementById('alloc-save-btn');
    Utils.setButtonLoading(btn, true);
    
    setTimeout(() => {
      Utils.Toast.success('Allocated', 'Asset has been successfully assigned.');
      Utils.closeModal('alloc-modal');
      Utils.setButtonLoading(btn, false);
      load();
    }, 600);
  };

  const returnAsset = (id, tag) => {
    Utils.confirmDialog('Return Asset', `Are you sure you want to mark ${tag} as returned?`, () => {
      const a = DEMO_ALLOCS.find(x => x.id === id);
      if(a) a.status = 'RETURNED';
      Utils.Toast.success('Returned', 'Asset marked as returned.');
      load();
    }, 'primary');
  };

  return { load, state, openAdd, save, returnAsset };
})();

window.openAllocModal = () => AllocPage.openAdd();
window.saveAllocation = () => AllocPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  AllocPage.load();
  
  Utils.setupSearch('alloc-search', q => { AllocPage.state.search = q.toLowerCase(); AllocPage.load(); });
  document.getElementById('status-filter').addEventListener('change', e => {
    AllocPage.state.status = e.target.value;
    AllocPage.load();
  });
});

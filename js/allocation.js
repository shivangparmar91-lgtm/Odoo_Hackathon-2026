/* Asset Allocation JS */
const AllocPage = (() => {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const canAllocate = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER');
  const canApprove  = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER' || user.role === 'DEPARTMENT_HEAD');

  let state = { page:1, pageSize:10, search:'', status:'', total:0 };

  const load = async () => {
    const tbody = document.getElementById('alloc-tbody');
    tbody.innerHTML = `<tr><td colspan="7"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let allocs = [];
    try {
      const params = Utils.buildQuery({ page: state.page - 1, size: state.pageSize, search: state.search, status: state.status });
      const res = await API.allocations.getAll(params);
      allocs = res.content || res || [];
      state.total = res.totalElements || allocs.length;
    } catch (err) {
      Utils.Toast.api(err);
      state.total = 0;
    }

    if (!allocs.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">🔗</div><h3>No allocations found</h3><p>Adjust filters or allocate an asset.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = allocs.map(a => {
        let actions = '';
        if (canApprove && a.status === 'ACTIVE') {
          actions += `<button class="btn btn-ghost btn-icon btn-sm" title="Return Asset" onclick="AllocPage.returnAsset(${a.id}, '${Utils.escapeHtml(a.tag || '')}')">↩️</button>`;
        }
        return `
        <tr>
          <td class="font-mono">${Utils.escapeHtml(a.tag || '')}</td>
          <td style="font-weight:600">${Utils.escapeHtml(a.assetName || '')}</td>
          <td>${Utils.escapeHtml(a.empName || a.employeeName || '')}</td>
          <td>${Utils.Format.date(a.date || a.assignedDate)}</td>
          <td>${a.returnDate ? Utils.Format.date(a.returnDate) : '—'}</td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td><div style="display:flex;gap:.375rem">${actions || '<span style="color:var(--text-muted)">—</span>'}</div></td>
        </tr>`;
      }).join('');
    }

    Utils.renderPagination(document.getElementById('alloc-pagination'), {
      page: state.page, totalPages: Math.ceil(state.total / state.pageSize),
      total: state.total, pageSize: state.pageSize,
      onPageChange: (p) => { state.page = p; load(); }
    });
  };

  const loadFormOptions = async () => {
    try {
      const employees = await API.employees.getAll('size=100');
      Utils.populateSelect('alloc-emp', employees, {
        valueKey: 'id',
        labelKey: (e) => `${e.firstName} ${e.lastName}`,
        placeholder: 'Select Employee...',
      });
    } catch (err) { Utils.Toast.api(err); }

    try {
      // Only assets currently AVAILABLE can be allocated
      const assets = await API.assets.getAll('status=AVAILABLE&size=100');
      Utils.populateSelect('alloc-asset', assets, {
        valueKey: 'id',
        labelKey: (a) => `${a.tag} - ${a.name}`,
        placeholder: 'Select Available Asset...',
      });
    } catch (err) { Utils.Toast.api(err); }
  };

  const openAdd = async () => {
    if (!canAllocate) { Utils.Toast.error('Access Denied', 'Only Asset Managers and Admins can allocate assets.'); return; }
    await loadFormOptions();
    document.getElementById('alloc-emp').value = '';
    document.getElementById('alloc-asset').value = '';
    document.getElementById('alloc-return-date').value = '';
    document.getElementById('alloc-notes').value = '';
    Utils.openModal('alloc-modal');
  };

  const save = async () => {
    if (!Utils.validateForm({ 'alloc-emp': {required:true}, 'alloc-asset': {required:true} })) return;
    const btn = document.getElementById('alloc-save-btn');
    Utils.setButtonLoading(btn, true);
    try {
      await API.allocations.create({
        employeeId: document.getElementById('alloc-emp').value,
        assetId: document.getElementById('alloc-asset').value,
        returnDate: document.getElementById('alloc-return-date').value || null,
        notes: document.getElementById('alloc-notes').value,
      });
      Utils.Toast.success('Allocated', 'Asset has been successfully assigned.');
      Utils.closeModal('alloc-modal');
      load();
    } catch (err) {
      Utils.Toast.api(err);
    }
    Utils.setButtonLoading(btn, false);
  };

  const returnAsset = (id, tag) => {
    Utils.confirmDialog('Return Asset', `Are you sure you want to mark ${tag} as returned?`, async () => {
      try {
        await API.allocations.return(id, { condition: 'GOOD' });
        Utils.Toast.success('Returned', 'Asset marked as returned.');
        load();
      } catch (err) { Utils.Toast.api(err); }
    }, 'primary');
  };

  return { load, state, openAdd, save, returnAsset, loadFormOptions };
})();

window.openAllocModal = () => AllocPage.openAdd();
window.saveAllocation = () => AllocPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const canAllocate = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER');
  const addBtn = document.querySelector('button[onclick="openAllocModal()"]');
  if (addBtn && !canAllocate) addBtn.style.display = 'none';

  AllocPage.load();
  Utils.setupSearch('alloc-search', q => { AllocPage.state.search = q.toLowerCase(); AllocPage.state.page = 1; AllocPage.load(); });
  const sf = document.getElementById('status-filter');
  if (sf) sf.addEventListener('change', e => { AllocPage.state.status = e.target.value; AllocPage.state.page = 1; AllocPage.load(); });
});

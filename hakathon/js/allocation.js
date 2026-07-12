/* Asset Allocation JS */
const AllocPage = (() => {
  let state = { page: 1, pageSize: 10, search: '', status: '', allocs: [], total: 0 };

  const load = async () => {
    state.search = document.getElementById('alloc-search') ? document.getElementById('alloc-search').value.trim() : '';
    state.status = document.getElementById('status-filter') ? document.getElementById('status-filter').value : '';

    const tbody = document.getElementById('alloc-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="7">${Utils.skeletonRows(5, 7)}</td></tr>`;

    try {
      const params = Utils.buildQuery({
        page: state.page - 1, size: state.pageSize, search: state.search, status: state.status
      });
      const res = await API.allocations.getAll(params);
      state.allocs = res.content || res || [];
      state.total = res.totalElements || state.allocs.length || 0;
    } catch (err) {
      console.error(err);
      state.allocs = [];
      state.total = 0;
    }

    if (!state.allocs.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No allocations found.</div></td></tr>`;
    } else {
      tbody.innerHTML = state.allocs.map(a => `
        <tr>
          <td class="font-mono">${Utils.escapeHtml(a.assetTag || a.tag || '')}</td>
          <td style="font-weight:600">${Utils.escapeHtml(a.assetName || '')}</td>
          <td>${Utils.escapeHtml(a.employeeName || a.empName || '')}</td>
          <td>${Utils.Format.date(a.allocationDate || a.date)}</td>
          <td>${(a.expectedReturnDate || a.returnDate) ? Utils.Format.date(a.expectedReturnDate || a.returnDate) : '—'}</td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td>
            ${a.status !== 'RETURNED' ? `<button class="btn btn-ghost btn-icon btn-sm" title="Return Asset" onclick="AllocPage.returnAsset(${a.id}, '${Utils.escapeHtml(a.assetTag || a.tag || '')}')">↩️</button>` : ''}
          </td>
        </tr>
      `).join('');
    }
    
    const pag = document.getElementById('alloc-pagination');
    if (pag) {
      Utils.renderPagination(pag, {
        page: state.page, totalPages: Math.ceil(state.total / state.pageSize) || 1,
        total: state.total, pageSize: state.pageSize,
        onPageChange: (p) => { state.page = p; load(); }
      });
    }
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
    
    try {
      const body = {
        employeeName: document.getElementById('alloc-emp').value.trim(),
        assetTag: document.getElementById('alloc-asset').value.trim(),
        expectedReturnDate: document.getElementById('alloc-return-date').value || null,
        notes: document.getElementById('alloc-notes').value.trim()
      };
      await API.allocations.create(body);
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
        await API.allocations.return(id, { condition: 'Good' }); // default condition
        Utils.Toast.success('Returned', 'Asset marked as returned.');
        load();
      } catch (err) {
        Utils.Toast.api(err);
      }
    }, 'primary');
  };

  return { load, state, openAdd, save, returnAsset };
})();

window.openAllocModal = () => AllocPage.openAdd();
window.saveAllocation = () => AllocPage.save();

const initAllocView = () => {
  if (!document.getElementById('alloc-tbody')) return;
  Auth.requireAuth();
  AllocPage.load();
  
  Utils.setupSearch('alloc-search', q => { AllocPage.state.search = q.toLowerCase(); AllocPage.state.page = 1; AllocPage.load(); });
  
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    const newStatusFilter = statusFilter.cloneNode(true);
    statusFilter.parentNode.replaceChild(newStatusFilter, statusFilter);
    newStatusFilter.addEventListener('change', e => {
      AllocPage.state.status = e.target.value;
      AllocPage.state.page = 1;
      AllocPage.load();
    });
  }
};

document.addEventListener('DOMContentLoaded', initAllocView);
window.addEventListener('pageLoaded', initAllocView);

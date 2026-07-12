/* Asset Directory JS */
const AssetDir = (() => {
  let state = { page: 1, pageSize: 10, search: '', category: '', status: '', dept: '', sort: 'tag', dir: 'asc', selected: new Set(), assets: [], total: 0 };

  const load = async () => {
    state.search = document.getElementById('asset-search') ? document.getElementById('asset-search').value.trim() : '';
    state.category = document.getElementById('category-filter') ? document.getElementById('category-filter').value : '';
    state.status = document.getElementById('status-filter') ? document.getElementById('status-filter').value : '';
    state.dept = document.getElementById('dept-filter') ? document.getElementById('dept-filter').value : '';

    const tbody = document.getElementById('asset-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8">${Utils.skeletonRows(5, 8)}</td></tr>`;

    try {
      const params = Utils.buildQuery({
        page: state.page - 1, size: state.pageSize, search: state.search,
        category: state.category, status: state.status, dept: state.dept,
        sort: state.sort, dir: state.dir
      });
      const res = await API.assets.getAll(params);
      state.assets = res.content || res || [];
      state.total = res.totalElements || state.assets.length || 0;
    } catch (err) {
      console.error(err);
      state.assets = [];
      state.total = 0;
    }

    const role = Auth.getRole();
    const canManage = ['ADMIN', 'ASSET_MANAGER'].includes(role);

    if (!state.assets.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📋</div><h3>No assets found</h3></div></td></tr>`;
    } else {
      tbody.innerHTML = state.assets.map(a => `
        <tr class="animate-fade-up">
          ${canManage ? `<td class="table-checkbox"><input type="checkbox" class="row-check" value="${a.id}" ${state.selected.has(String(a.id)) ? 'checked' : ''}></td>` : ''}
          <td style="font-family:var(--font-mono);font-size:.875rem;font-weight:600"><a href="details.html?id=${a.id}" onclick="event.preventDefault(); window.location.href='details.html?id=${a.id}'">${Utils.escapeHtml(a.tag)}</a></td>
          <td><div style="font-weight:600">${Utils.escapeHtml(a.name)}</div></td>
          <td style="font-size:.8125rem;color:var(--text-secondary)">${Utils.escapeHtml(a.category)}</td>
          <td><span class="badge badge-neutral">${Utils.escapeHtml(a.condition)}</span></td>
          <td>
            ${a.assignedTo ? `<div style="font-weight:500">${Utils.escapeHtml(a.assignedTo)}</div>` : `<span style="color:var(--text-muted)">Unassigned</span>`}
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(a.location || '')}</div>
          </td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td>
            <div style="display:flex;gap:.375rem">
              <a href="details.html?id=${a.id}" class="btn btn-ghost btn-icon btn-sm" title="View Details" onclick="event.preventDefault(); window.location.href='details.html?id=${a.id}'">👁️</a>
              ${canManage && a.status === 'AVAILABLE' ? `<button class="btn btn-ghost btn-icon btn-sm" title="Allocate" onclick="AssetDir.quickAllocate(${a.id})">🔗</button>` : ''}
              ${canManage && a.status === 'ALLOCATED' ? `<button class="btn btn-ghost btn-icon btn-sm" title="Return" onclick="AssetDir.quickReturn(${a.id})">↩️</button>` : ''}
            </div>
          </td>
        </tr>
      `).join('');
    }

    const paginationEl = document.getElementById('asset-pagination');
    if (paginationEl) {
      Utils.renderPagination(paginationEl, {
        page: state.page, totalPages: Math.ceil(state.total / state.pageSize) || 1,
        total: state.total, pageSize: state.pageSize,
        onPageChange: (p) => { state.page = p; load(); }
      });
    }

    if (canManage) {
      updateBulkBar();
      attachCheckListeners();
    }
  };

  const populateFilters = async () => {
    const catSel = document.getElementById('category-filter');
    const deptSel = document.getElementById('dept-filter');
    try {
      if (catSel && catSel.options.length <= 1) {
        const cats = await API.categories.getAll();
        const list = cats.content || cats || [];
        list.forEach(c => catSel.innerHTML += `<option value="${c.name}">${c.name}</option>`);
      }
      if (deptSel && deptSel.options.length <= 1) {
        const depts = await API.departments.getAll();
        const list = depts.content || depts || [];
        list.forEach(d => deptSel.innerHTML += `<option value="${d.name}">${d.name}</option>`);
      }
    } catch (_) {}
  };

  const attachCheckListeners = () => {
    document.querySelectorAll('.row-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        if (e.target.checked) state.selected.add(e.target.value);
        else state.selected.delete(e.target.value);
        updateBulkBar();
      });
    });
    const selectAll = document.getElementById('select-all');
    if (selectAll) {
      selectAll.checked = document.querySelectorAll('.row-check:not(:checked)').length === 0 && document.querySelectorAll('.row-check').length > 0;
    }
  };

  const updateBulkBar = () => {
    const bar = document.getElementById('bulk-actions');
    const count = document.getElementById('selected-count');
    if (!bar) return;
    if (state.selected.size > 0) {
      if (count) count.textContent = state.selected.size;
      bar.style.display = 'flex';
    } else {
      bar.style.display = 'none';
    }
  };

  const selectAll = (checked) => {
    document.querySelectorAll('.row-check').forEach(chk => {
      chk.checked = checked;
      if (checked) state.selected.add(chk.value);
      else state.selected.delete(chk.value);
    });
    updateBulkBar();
  };

  // Quick Actions
  const quickAllocate = (id) => {
    const a = state.assets.find(x => x.id === id);
    if (!a) return;
    document.getElementById('qa-title').textContent = '🔗 Allocate Asset';
    document.getElementById('qa-body').innerHTML = `
      <div style="margin-bottom:1rem">Allocating <strong>${Utils.escapeHtml(a.tag)} - ${Utils.escapeHtml(a.name)}</strong></div>
      <div class="form-group"><label class="form-label">Employee ID / Name</label><input type="text" id="qa-emp-id" class="form-control" placeholder="Search employee..."></div>
    `;
    document.getElementById('qa-confirm-btn').onclick = async () => {
      const empName = document.getElementById('qa-emp-id').value;
      if (!empName) return Utils.Toast.error('Error', 'Please enter employee details.');
      try {
        await API.allocations.create({ assetId: id, employeeName: empName });
        Utils.Toast.success('Allocated', `${Utils.escapeHtml(a.tag)} assigned successfully.`);
        Utils.closeModal('quick-action-modal');
        load();
      } catch(err) { Utils.Toast.api(err); }
    };
    Utils.openModal('quick-action-modal');
  };

  const quickReturn = (id) => {
    const a = state.assets.find(x => x.id === id);
    if (!a) return;
    document.getElementById('qa-title').textContent = '↩️ Return Asset';
    document.getElementById('qa-body').innerHTML = `
      <div style="margin-bottom:1rem">Returning <strong>${Utils.escapeHtml(a.tag)}</strong> from <strong>${Utils.escapeHtml(a.assignedTo || 'Employee')}</strong></div>
      <div class="form-group"><label class="form-label">Return Condition</label><select id="qa-return-cond" class="form-control"><option value="Good">Good</option><option value="Fair">Fair</option><option value="Damaged">Damaged</option></select></div>
    `;
    document.getElementById('qa-confirm-btn').onclick = async () => {
      const cond = document.getElementById('qa-return-cond').value;
      try {
        await API.allocations.return(id, { condition: cond });
        Utils.Toast.success('Returned', `${Utils.escapeHtml(a.tag)} returned successfully.`);
        Utils.closeModal('quick-action-modal');
        load();
      } catch(err) { Utils.Toast.api(err); }
    };
    Utils.openModal('quick-action-modal');
  };

  return { load, state, populateFilters, selectAll, quickAllocate, quickReturn };
})();

window.exportAssets = () => Utils.Toast.info('Export', 'Exporting asset list to CSV…');
window.bulkAllocate = () => Utils.Toast.info('Bulk Action', `Allocating ${AssetDir.state.selected.size} assets…`);
window.bulkMaintenance = () => Utils.Toast.info('Bulk Action', `Sending ${AssetDir.state.selected.size} assets to maintenance…`);
window.bulkRetire = () => {
  Utils.confirmDialog('Bulk Retire', `Retire ${AssetDir.state.selected.size} assets permanently?`, () => {
    Utils.Toast.success('Retired', 'Assets retired successfully.');
    AssetDir.state.selected.clear(); AssetDir.load();
  });
};

const initAssetDirView = () => {
  if (!document.getElementById('asset-tbody')) return;
  Auth.requireAuth();
  
  const role = Auth.getRole();
  const canManage = ['ADMIN', 'ASSET_MANAGER'].includes(role);
  
  if (!canManage) {
    const regBtn = document.querySelector('a[href="registration.html"]');
    if (regBtn) regBtn.style.display = 'none';
    
    document.querySelectorAll('.table-checkbox').forEach(el => el.style.display = 'none');
  }

  AssetDir.populateFilters();
  AssetDir.load();

  Utils.setupSearch('asset-search', q => { AssetDir.state.search = q.toLowerCase(); AssetDir.state.page = 1; AssetDir.load(); });
  ['category-filter', 'status-filter', 'dept-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      // replace to remove old listeners
      const newEl = el.cloneNode(true);
      el.parentNode.replaceChild(newEl, el);
      newEl.addEventListener('change', e => {
        AssetDir.state[id.split('-')[0]] = e.target.value;
        AssetDir.state.page = 1;
        AssetDir.load();
      });
    }
  });

  const selectAllEl = document.getElementById('select-all');
  if (selectAllEl && canManage) {
    const newSelAll = selectAllEl.cloneNode(true);
    selectAllEl.parentNode.replaceChild(newSelAll, selectAllEl);
    newSelAll.addEventListener('change', e => AssetDir.selectAll(e.target.checked));
  }
  
  document.querySelectorAll('.sortable').forEach(th => {
    const newTh = th.cloneNode(true);
    th.parentNode.replaceChild(newTh, th);
    newTh.addEventListener('click', () => {
      const col = newTh.dataset.sort;
      if (AssetDir.state.sort === col) AssetDir.state.dir = AssetDir.state.dir === 'asc' ? 'desc' : 'asc';
      else { AssetDir.state.sort = col; AssetDir.state.dir = 'asc'; }
      document.querySelectorAll('.sortable').forEach(el => el.textContent = el.textContent.replace(' ↑', '').replace(' ↓', '').replace(' ↕', ' ↕'));
      newTh.textContent = newTh.textContent.replace(' ↕', '') + (AssetDir.state.dir === 'asc' ? ' ↑' : ' ↓');
      AssetDir.load();
    });
  });
};

document.addEventListener('DOMContentLoaded', initAssetDirView);
window.addEventListener('pageLoaded', initAssetDirView);

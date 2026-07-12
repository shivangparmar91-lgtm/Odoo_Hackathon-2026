/* Asset Directory JS */
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const canManage = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER');

const AssetDir = (() => {
  let state = { page: 1, pageSize: 10, search: '', category: '', status: '', dept: '', sort: 'tag', dir: 'asc', selected: new Set() };

  const getFiltered = () => [];

  const load = async () => {
    const tbody = document.getElementById('asset-tbody');
    tbody.innerHTML = `<tr><td colspan="8"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let assets = [];
    let total = 0;
    try {
      const params = Utils.buildQuery({
        page: state.page - 1, size: state.pageSize, search: state.search,
        category: state.category, status: state.status, dept: state.dept,
        sort: state.sort, dir: state.dir
      });
      const res = await API.assets.getAll(params);
      assets = res.content || res || [];
      total = res.totalElements || assets.length;
    } catch (err) {
      Utils.Toast.api(err);
    }

    if (!assets.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📋</div><h3>No assets found</h3></div></td></tr>`;
    } else {
      tbody.innerHTML = assets.map(a => {
        let actions = `<a href="details.html?id=${a.id}" class="btn btn-ghost btn-icon btn-sm" title="View Details">👁️</a>`;
        if (canManage) {
          if (a.status === 'AVAILABLE') actions += `<button class="btn btn-ghost btn-icon btn-sm" title="Allocate" onclick="AssetDir.quickAllocate(${a.id})">🔗</button>`;
          if (a.status === 'ALLOCATED') actions += `<button class="btn btn-ghost btn-icon btn-sm" title="Return" onclick="AssetDir.quickReturn(${a.id})">↩️</button>`;
        }

        return `
        <tr class="animate-fade-up">
          <td class="table-checkbox"><input type="checkbox" class="row-check" value="${a.id}" ${state.selected.has(String(a.id)) ? 'checked' : ''}></td>
          <td style="font-family:var(--font-mono);font-size:.875rem;font-weight:600"><a href="details.html?id=${a.id}">${Utils.escapeHtml(a.tag||'')}</a></td>
          <td><div style="font-weight:600">${Utils.escapeHtml(a.name||'')}</div></td>
          <td style="font-size:.8125rem;color:var(--text-secondary)">${Utils.escapeHtml(a.category||'')}</td>
          <td><span class="badge badge-neutral">${Utils.escapeHtml(a.condition||'')}</span></td>
          <td>
            ${a.assignedTo ? `<div style="font-weight:500">${Utils.escapeHtml(a.assignedTo)}</div>` : `<span style="color:var(--text-muted)">Unassigned</span>`}
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(a.location||'')}</div>
          </td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td>
            <div style="display:flex;gap:.375rem">
              ${actions}
            </div>
          </td>
        </tr>
      `}).join('');
    }

    Utils.renderPagination(document.getElementById('asset-pagination'), {
      page: state.page, totalPages: Math.ceil(total / state.pageSize),
      total: total, pageSize: state.pageSize,
      onPageChange: (p) => { state.page = p; load(); }
    });

    updateBulkBar();
    attachCheckListeners();
  };

  const populateFilters = async () => {
    try {
      const [cats, depts] = await Promise.all([API.categories.getAll(), API.departments.getAll()]);
      const catList = cats.content || cats || [];
      const deptList = depts.content || depts || [];
      const catSel = document.getElementById('category-filter');
      const deptSel = document.getElementById('dept-filter');
      if (catSel) catSel.innerHTML += catList.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      if (deptSel) deptSel.innerHTML += deptList.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    } catch (e) {
      console.error('Failed to load filters', e);
    }
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
    if (state.selected.size > 0) {
      count.textContent = state.selected.size;
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

  // Quick Actions (Mocked via API)
  const quickAllocate = async (id) => {
    try {
      const a = await API.assets.getById(id);
      document.getElementById('qa-title').textContent = '🔗 Allocate Asset';
      document.getElementById('qa-body').innerHTML = `
        <div style="margin-bottom:1rem">Allocating <strong>${Utils.escapeHtml(a.tag)} - ${Utils.escapeHtml(a.name)}</strong></div>
        <div class="form-group"><label class="form-label">Assign To User ID</label><input type="number" id="qa-user-id" class="form-control" placeholder="e.g. 1"></div>
      `;
      document.getElementById('qa-confirm-btn').onclick = async () => {
        const uid = document.getElementById('qa-user-id').value;
        if (!uid) return;
        try {
          await API.allocations.allocate(id, { userId: uid });
          Utils.Toast.success('Allocated', `${a.tag} assigned successfully.`);
          Utils.closeModal('quick-action-modal');
          load();
        } catch (e) { Utils.Toast.api(e); }
      };
      Utils.openModal('quick-action-modal');
    } catch (e) { Utils.Toast.api(e); }
  };

  const quickReturn = async (id) => {
    try {
      const a = await API.assets.getById(id);
      document.getElementById('qa-title').textContent = '↩️ Return Asset';
      document.getElementById('qa-body').innerHTML = `
        <div style="margin-bottom:1rem">Returning <strong>${Utils.escapeHtml(a.tag)}</strong></div>
        <div class="form-group"><label class="form-label">Return Condition</label><select id="qa-cond" class="form-control"><option>GOOD</option><option>FAIR</option><option>POOR</option></select></div>
      `;
      document.getElementById('qa-confirm-btn').onclick = async () => {
        try {
          await API.allocations.returnAsset(id, { condition: document.getElementById('qa-cond').value });
          Utils.Toast.success('Returned', `${a.tag} returned successfully.`);
          Utils.closeModal('quick-action-modal');
          load();
        } catch (e) { Utils.Toast.api(e); }
      };
      Utils.openModal('quick-action-modal');
    } catch (e) { Utils.Toast.api(e); }
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

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  AssetDir.populateFilters();
  AssetDir.load();

  Utils.setupSearch('asset-search', q => { AssetDir.state.search = q.toLowerCase(); AssetDir.state.page = 1; AssetDir.load(); });
  ['category-filter', 'status-filter', 'dept-filter'].forEach(id => {
    document.getElementById(id).addEventListener('change', e => {
      AssetDir.state[id.split('-')[0]] = e.target.value;
      AssetDir.state.page = 1;
      AssetDir.load();
    });
  });
  document.getElementById('select-all').addEventListener('change', e => AssetDir.selectAll(e.target.checked));

  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (AssetDir.state.sort === col) AssetDir.state.dir = AssetDir.state.dir === 'asc' ? 'desc' : 'asc';
      else { AssetDir.state.sort = col; AssetDir.state.dir = 'asc'; }
      document.querySelectorAll('.sortable').forEach(el => el.textContent = el.textContent.replace(' ↑', '').replace(' ↓', '').replace(' ↕', ' ↕'));
      th.textContent = th.textContent.replace(' ↕', '') + (AssetDir.state.dir === 'asc' ? ' ↑' : ' ↓');
      AssetDir.load();
    });
  });
});

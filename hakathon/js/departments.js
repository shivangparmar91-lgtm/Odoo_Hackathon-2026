/* ============================================================
   AssetFlow – Department Management JS
   ============================================================ */
const DeptPage = (() => {
  let state = { page: 1, pageSize: 10, search: '', status: '', total: 0, editing: null, depts: [] };

  // ── LOAD ───────────────────────────────────────────────────
  const load = async () => {
    state.search = document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '';
    state.status = document.getElementById('status-filter') ? document.getElementById('status-filter').value : '';
    
    const tbody = document.getElementById('dept-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8">${Utils.skeletonRows(5, 8)}</td></tr>`;

    try {
      const params = Utils.buildQuery({ page: state.page - 1, size: state.pageSize, search: state.search, status: state.status });
      const res = await API.departments.getAll(params);
      state.depts = res.content || res || [];
      state.total = res.totalElements || state.depts.length || 0;
    } catch (err) {
      console.error(err);
      state.depts = [];
      state.total = 0;
    }

    if (!state.depts.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🏢</div><h3>No departments found</h3><p>Add your first department to get started.</p></div></td></tr>`;
    } else {
      const isAdmin = typeof Auth !== 'undefined' && Auth.hasRole('ADMIN');
      tbody.innerHTML = state.depts.map(d => `
        <tr class="animate-fade-up">
          <td class="table-checkbox"><input type="checkbox" class="row-check" value="${d.id}"></td>
          <td>
            <div style="display:flex;align-items:center;gap:.75rem">
              <div class="avatar-placeholder avatar-sm" style="background:linear-gradient(135deg,#6366f1,#4f46e5)">${Utils.Format.initials(d.name)}</div>
              <div>
                <div style="font-weight:600">${Utils.escapeHtml(d.name)}</div>
                <div style="font-size:.75rem;color:var(--text-muted);font-family:var(--font-mono)">${d.code}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:.5rem">
              ${Utils.avatarHtml(d.head, 'sm')}
              <span style="font-size:.875rem">${Utils.escapeHtml(d.head || '—')}</span>
            </div>
          </td>
          <td><strong>${d.employees || 0}</strong></td>
          <td><strong>${d.assets || 0}</strong></td>
          <td>${Utils.statusBadge(d.status)}</td>
          <td style="color:var(--text-muted);font-size:.8125rem">${Utils.Format.date(d.createdAt)}</td>
          <td>
            <div style="display:flex;gap:.375rem">
              <button class="btn btn-ghost btn-icon btn-sm" title="View" onclick="DeptPage.view(${d.id})">👁️</button>
              ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" title="Edit" onclick="DeptPage.edit(${d.id})">✏️</button>` : ''}
              ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" title="Delete" style="color:var(--danger)" onclick="DeptPage.remove(${d.id},'${Utils.escapeHtml(d.name)}')">🗑️</button>` : ''}
            </div>
          </td>
        </tr>
      `).join('');
    }

    const statTotal = document.getElementById('stat-total');
    if (statTotal) statTotal.textContent = state.total;

    Utils.renderPagination(document.getElementById('pagination'), {
      page: state.page, totalPages: Math.ceil(state.total / state.pageSize) || 1,
      total: state.total, pageSize: state.pageSize,
      onPageChange: (p) => { state.page = p; load(); }
    });
  };

  // ── ADD MODAL ─────────────────────────────────────────────
  const openAdd = () => {
    state.editing = null;
    document.getElementById('dept-modal-title').textContent = '🏢 Add Department';
    ['dept-name','dept-code','dept-location','dept-cost-center','dept-description'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.value = ''; el.classList.remove('is-invalid','is-valid'); }
    });
    document.getElementById('dept-head').value   = '';
    document.getElementById('dept-status').value = 'ACTIVE';
    loadHeadOptions();
    Utils.openModal('dept-modal');
  };

  // ── EDIT ─────────────────────────────────────────────────
  const edit = async (id) => {
    state.editing = id;
    document.getElementById('dept-modal-title').textContent = '✏️ Edit Department';
    const dept = state.depts.find(d => d.id === id);
    if (!dept) return;
    document.getElementById('dept-name').value        = dept.name;
    document.getElementById('dept-code').value        = dept.code;
    document.getElementById('dept-location').value    = dept.location || '';
    document.getElementById('dept-cost-center').value = dept.costCenter || '';
    document.getElementById('dept-description').value = dept.description || '';
    document.getElementById('dept-status').value      = dept.status;
    await loadHeadOptions(dept.headEmployeeId);
    Utils.openModal('dept-modal');
  };

  // ── VIEW ─────────────────────────────────────────────────
  const view = (id) => {
    const dept = state.depts.find(d => d.id === id);
    if (!dept) return;
    document.getElementById('dept-view-body').innerHTML = `
      <div class="info-grid" style="margin-bottom:1.5rem">
        <div class="info-item"><div class="info-label">Name</div><div class="info-value" style="font-weight:700;font-size:1.0625rem">${dept.name}</div></div>
        <div class="info-item"><div class="info-label">Code</div><div class="info-value font-mono">${dept.code}</div></div>
        <div class="info-item"><div class="info-label">Department Head</div><div class="info-value">${dept.head||'—'}</div></div>
        <div class="info-item"><div class="info-label">Location</div><div class="info-value">${dept.location||'—'}</div></div>
        <div class="info-item"><div class="info-label">Cost Center</div><div class="info-value font-mono">${dept.costCenter||'—'}</div></div>
        <div class="info-item"><div class="info-label">Status</div><div class="info-value">${Utils.statusBadge(dept.status)}</div></div>
        <div class="info-item"><div class="info-label">Employees</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${dept.employees || 0}</div></div>
        <div class="info-item"><div class="info-label">Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${dept.assets || 0}</div></div>
        <div class="info-item"><div class="info-label">Created</div><div class="info-value">${Utils.Format.date(dept.createdAt)}</div></div>
      </div>
      <div class="form-group"><label class="form-label">Description</label><p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${dept.description||'—'}</p></div>
    `;
    Utils.openModal('dept-view-modal');
  };

  // ── SAVE ─────────────────────────────────────────────────
  const save = async () => {
    const valid = Utils.validateForm({ 'dept-name': { required: true, minLength: 2 }, 'dept-code': { required: true } });
    if (!valid) return;
    const btn = document.getElementById('dept-save-btn');
    Utils.setButtonLoading(btn, true);
    const body = {
      name: document.getElementById('dept-name').value.trim(),
      code: document.getElementById('dept-code').value.trim(),
      headEmployeeId: document.getElementById('dept-head').value || null,
      location: document.getElementById('dept-location').value.trim(),
      costCenter: document.getElementById('dept-cost-center').value.trim(),
      description: document.getElementById('dept-description').value.trim(),
      status: document.getElementById('dept-status').value,
    };
    try {
      if (state.editing) { await API.departments.update(state.editing, body); Utils.Toast.success('Updated!', 'Department updated successfully.'); }
      else                { await API.departments.create(body);               Utils.Toast.success('Created!', 'Department added successfully.'); }
      Utils.closeModal('dept-modal');
      load();
    } catch (err) { Utils.Toast.api(err); }
    Utils.setButtonLoading(btn, false);
  };

  // ── DELETE ────────────────────────────────────────────────
  const remove = (id, name) => {
    Utils.confirmDialog('Delete Department', `Are you sure you want to delete "${name}"? This action cannot be undone.`, async () => {
      try {
        await API.departments.delete(id);
        Utils.Toast.success('Deleted', `${name} has been removed.`);
        load();
      } catch (err) { Utils.Toast.api(err); }
    });
  };

  // ── HEAD OPTIONS ──────────────────────────────────────────
  const loadHeadOptions = async (selectedId = '') => {
    const sel = document.getElementById('dept-head');
    try {
      const heads = await API.departments.getHeads();
      sel.innerHTML = `<option value="">Select Employee…</option>` +
        (heads || []).map(e => `<option value="${e.id}" ${e.id == selectedId ? 'selected' : ''}>${e.firstName} ${e.lastName}</option>`).join('');
    } catch (err) {
      sel.innerHTML = `<option value="">Failed to load heads</option>`;
    }
  };

  const exportTable = () => { Utils.Toast.info('Export', 'Exporting departments to Excel…'); };

  return { load, openAdd, edit, view, save, remove, exportTable };
})();

window.openDeptModal = () => DeptPage.openAdd();
window.saveDepartment = () => DeptPage.save();
window.exportTable = () => DeptPage.exportTable();

const initDeptView = () => {
  if (!document.getElementById('dept-tbody')) return;
  Auth.requireAuth();
  
  if (!Auth.hasRole('ADMIN')) {
    const addBtn = document.querySelector('.topbar-actions .btn-primary');
    if (addBtn) addBtn.style.display = 'none';
  }

  DeptPage.load();

  Utils.setupSearch('search-input', (q) => {
    DeptPage.load();
  });

  document.getElementById('status-filter')?.addEventListener('change', (e) => {
    DeptPage.load();
  });

  document.getElementById('select-all')?.addEventListener('change', (e) => {
    document.querySelectorAll('.row-check').forEach(c => c.checked = e.target.checked);
  });
};

document.addEventListener('DOMContentLoaded', initDeptView);
window.addEventListener('pageLoaded', initDeptView);

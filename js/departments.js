/* ============================================================
   AssetFlow – Department Management JS
   ============================================================ */
const DeptPage = (() => {
  let state = { page: 1, pageSize: 10, search: '', status: '', sort: 'name', total: 0, editing: null };

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isAdmin = user && user.role === 'ADMIN';

  // ── LOAD ───────────────────────────────────────────────────
  const load = async () => {
    const tbody = document.getElementById('dept-tbody');
    tbody.innerHTML = `<tr><td colspan="8">${Utils.skeletonRows(5, 8)}</td></tr>`;

    let depts = [];
    try {
      const params = Utils.buildQuery({ page: state.page - 1, size: state.pageSize, search: state.search, status: state.status });
      const res = await API.departments.getAll(params);
      depts = res.content || res;
      state.total = res.totalElements || depts.length;
    } catch (err) {
      Utils.Toast.api(err);
      state.total = 0;
    }

    if (!depts.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🏢</div><h3>No departments found</h3><p>Try adjusting your search filters or add a new department.</p></div></td></tr>`;
      document.getElementById('stat-total').textContent = 0;
      document.getElementById('stat-active').textContent = 0;
      document.getElementById('stat-employees').textContent = 0;
      document.getElementById('stat-assets').textContent = 0;
    } else {
      tbody.innerHTML = depts.map(d => {
        let actions = `<button class="btn btn-ghost btn-icon btn-sm" title="View" onclick="DeptPage.view(${d.id})">👁️</button>`;
        if (isAdmin) {
          actions += `
            <button class="btn btn-ghost btn-icon btn-sm" title="Edit" onclick="DeptPage.edit(${d.id})">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" title="Delete" style="color:var(--danger)" onclick="DeptPage.remove(${d.id},'${Utils.escapeHtml(d.name)}')">🗑️</button>
          `;
        }

        return `
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
              ${actions}
            </div>
          </td>
        </tr>
      `}).join('');
      
      document.getElementById('stat-total').textContent     = state.total;
      document.getElementById('stat-active').textContent    = depts.filter(d=>d.status==='ACTIVE').length;
      document.getElementById('stat-employees').textContent = depts.reduce((a,d)=>a+(d.employees||0),0);
      document.getElementById('stat-assets').textContent    = depts.reduce((a,d)=>a+(d.assets||0),0);
    }

    Utils.renderPagination(document.getElementById('pagination'), {
      page: state.page, totalPages: Math.ceil(state.total / state.pageSize),
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
    try {
      const dept = await API.departments.getById(id);
      document.getElementById('dept-name').value        = dept.name || '';
      document.getElementById('dept-code').value        = dept.code || '';
      document.getElementById('dept-location').value    = dept.location || '';
      document.getElementById('dept-cost-center').value = dept.costCenter || '';
      document.getElementById('dept-description').value = dept.description || '';
      document.getElementById('dept-status').value      = dept.status || 'ACTIVE';
      await loadHeadOptions(dept.head);
      Utils.openModal('dept-modal');
    } catch (err) {
      Utils.Toast.api(err);
    }
  };

  // ── VIEW ─────────────────────────────────────────────────
  const view = async (id) => {
    try {
      const dept = await API.departments.getById(id);
      document.getElementById('dept-view-body').innerHTML = `
        <div class="info-grid" style="margin-bottom:1.5rem">
          <div class="info-item"><div class="info-label">Name</div><div class="info-value" style="font-weight:700;font-size:1.0625rem">${Utils.escapeHtml(dept.name)}</div></div>
          <div class="info-item"><div class="info-label">Code</div><div class="info-value font-mono">${Utils.escapeHtml(dept.code)}</div></div>
          <div class="info-item"><div class="info-label">Department Head</div><div class="info-value">${Utils.escapeHtml(dept.head||'—')}</div></div>
          <div class="info-item"><div class="info-label">Location</div><div class="info-value">${Utils.escapeHtml(dept.location||'—')}</div></div>
          <div class="info-item"><div class="info-label">Cost Center</div><div class="info-value font-mono">${Utils.escapeHtml(dept.costCenter||'—')}</div></div>
          <div class="info-item"><div class="info-label">Status</div><div class="info-value">${Utils.statusBadge(dept.status)}</div></div>
          <div class="info-item"><div class="info-label">Employees</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${dept.employees || 0}</div></div>
          <div class="info-item"><div class="info-label">Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${dept.assets || 0}</div></div>
          <div class="info-item"><div class="info-label">Created</div><div class="info-value">${Utils.Format.date(dept.createdAt)}</div></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label><p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${Utils.escapeHtml(dept.description||'—')}</p></div>
      `;
      Utils.openModal('dept-view-modal');
    } catch (err) {
      Utils.Toast.api(err);
    }
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
  const loadHeadOptions = async (selectedName = '') => {
    const sel = document.getElementById('dept-head');
    try {
      const emps = await API.employees.getAll('role=DEPARTMENT_HEAD,ADMIN,EMPLOYEE&size=100');
      const list = emps.content || emps || [];
      sel.innerHTML = `<option value="">Select Employee…</option>` +
        list.map(e => {
          const fullName = `${e.firstName||''} ${e.lastName||''}`.trim();
          return `<option value="${e.id}" ${fullName===selectedName?'selected':''}>${Utils.escapeHtml(fullName)}</option>`;
        }).join('');
    } catch (err) {
      sel.innerHTML = `<option value="">Select Employee…</option>`;
    }
  };

  const exportTable = () => { Utils.Toast.info('Export', 'Exporting departments to Excel…'); };

  const setFilter = (key, value) => {
    state[key] = value;
    state.page = 1;
    load();
  };

  return { load, openAdd, edit, view, save, remove, exportTable, setFilter };
})();

window.openDeptModal = () => DeptPage.openAdd();
window.saveDepartment = () => DeptPage.save();
window.exportTable = () => DeptPage.exportTable();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isAdmin = user && user.role === 'ADMIN';
  const addBtn = document.getElementById('add-dept-btn');
  if (addBtn && !isAdmin) {
    addBtn.style.display = 'none';
  }

  DeptPage.load();

  Utils.setupSearch('search-input', (q) => {
    DeptPage.setFilter('search', q);
  });

  document.getElementById('status-filter').addEventListener('change', (e) => {
    DeptPage.setFilter('status', e.target.value);
  });

  // Select all checkbox
  document.getElementById('select-all').addEventListener('change', (e) => {
    document.querySelectorAll('.row-check').forEach(c => c.checked = e.target.checked);
  });
});

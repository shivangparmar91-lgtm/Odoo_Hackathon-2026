/* ============================================================
   AssetFlow – Department Management JS
   ============================================================ */
const DeptPage = (() => {
  let state = { page: 1, pageSize: 10, search: '', status: '', sort: 'name', total: 0, editing: null };

  const DEMO_DEPTS = [
    { id:1, name:'Information Technology', code:'IT-001', head:'Alice Johnson', employees:42, assets:95, status:'ACTIVE', location:'3rd Floor, Block A', costCenter:'CC-2025-IT', description:'Handles all tech infrastructure.', createdAt:'2023-01-15' },
    { id:2, name:'Human Resources',       code:'HR-001', head:'Bob Smith',     employees:18, assets:32, status:'ACTIVE', location:'1st Floor, Block B', costCenter:'CC-2025-HR', description:'Manages employee relations.',   createdAt:'2023-01-15' },
    { id:3, name:'Finance & Accounts',    code:'FIN-001',head:'Carol Davis',   employees:24, assets:58, status:'ACTIVE', location:'2nd Floor, Block A', costCenter:'CC-2025-FIN',description:'Financial planning and control.',createdAt:'2023-02-10' },
    { id:4, name:'Operations',            code:'OPS-001',head:'David Lee',     employees:56, assets:112,status:'ACTIVE', location:'Ground Floor',       costCenter:'CC-2025-OPS',description:'Core operational workflows.',  createdAt:'2023-02-20' },
    { id:5, name:'Sales & Marketing',     code:'SAL-001',head:'Eva Brown',     employees:38, assets:74, status:'ACTIVE', location:'4th Floor, Block C', costCenter:'CC-2025-SAL',description:'Revenue generation team.',    createdAt:'2023-03-01' },
    { id:6, name:'Legal & Compliance',    code:'LEG-001',head:'Frank Moore',   employees:12, assets:22, status:'INACTIVE',location:'2nd Floor, Block B', costCenter:'CC-2025-LEG',description:'Legal oversight and compliance.',createdAt:'2023-04-10'},
    { id:7, name:'Research & Development',code:'RND-001',head:'Grace Kim',     employees:29, assets:88, status:'ACTIVE', location:'5th Floor',          costCenter:'CC-2025-RND',description:'Innovation and product development.',createdAt:'2023-05-05'},
    { id:8, name:'Customer Support',      code:'CS-001', head:'Henry Wilson',  employees:33, assets:67, status:'ACTIVE', location:'3rd Floor, Block B', costCenter:'CC-2025-CS', description:'24/7 customer support team.', createdAt:'2023-06-12'},
  ];

  // ── LOAD ───────────────────────────────────────────────────
  const load = async () => {
    const tbody = document.getElementById('dept-tbody');
    tbody.innerHTML = `<tr><td colspan="8">${Utils.skeletonRows(5, 8)}</td></tr>`;

    let depts = DEMO_DEPTS;
    try {
      const params = Utils.buildQuery({ page: state.page - 1, size: state.pageSize, search: state.search, status: state.status });
      const res = await API.departments.getAll(params);
      depts = res.content || res;
      state.total = res.totalElements || depts.length;
    } catch {
      state.total = depts.length;
    }

    // Filter (demo)
    let filtered = depts.filter(d => {
      const q = state.search.toLowerCase();
      return (!q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)) &&
             (!state.status || d.status === state.status);
    });
    state.total = filtered.length;
    const page = filtered.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);

    if (!page.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🏢</div><h3>No departments found</h3><p>Add your first department to get started.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = page.map(d => `
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
          <td><strong>${d.employees}</strong></td>
          <td><strong>${d.assets}</strong></td>
          <td>${Utils.statusBadge(d.status)}</td>
          <td style="color:var(--text-muted);font-size:.8125rem">${Utils.Format.date(d.createdAt)}</td>
          <td>
            <div style="display:flex;gap:.375rem">
              <button class="btn btn-ghost btn-icon btn-sm" title="View" onclick="DeptPage.view(${d.id})">👁️</button>
              <button class="btn btn-ghost btn-icon btn-sm" title="Edit" onclick="DeptPage.edit(${d.id})">✏️</button>
              <button class="btn btn-ghost btn-icon btn-sm" title="Delete" style="color:var(--danger)" onclick="DeptPage.remove(${d.id},'${Utils.escapeHtml(d.name)}')">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Stats
    document.getElementById('stat-total').textContent     = DEMO_DEPTS.length;
    document.getElementById('stat-active').textContent    = DEMO_DEPTS.filter(d=>d.status==='ACTIVE').length;
    document.getElementById('stat-employees').textContent = DEMO_DEPTS.reduce((a,d)=>a+d.employees,0);
    document.getElementById('stat-assets').textContent    = DEMO_DEPTS.reduce((a,d)=>a+d.assets,0);

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
    const dept = DEMO_DEPTS.find(d => d.id === id);
    if (!dept) return;
    document.getElementById('dept-name').value        = dept.name;
    document.getElementById('dept-code').value        = dept.code;
    document.getElementById('dept-location').value    = dept.location;
    document.getElementById('dept-cost-center').value = dept.costCenter;
    document.getElementById('dept-description').value = dept.description;
    document.getElementById('dept-status').value      = dept.status;
    await loadHeadOptions(dept.head);
    Utils.openModal('dept-modal');
  };

  // ── VIEW ─────────────────────────────────────────────────
  const view = (id) => {
    const dept = DEMO_DEPTS.find(d => d.id === id);
    if (!dept) return;
    document.getElementById('dept-view-body').innerHTML = `
      <div class="info-grid" style="margin-bottom:1.5rem">
        <div class="info-item"><div class="info-label">Name</div><div class="info-value" style="font-weight:700;font-size:1.0625rem">${dept.name}</div></div>
        <div class="info-item"><div class="info-label">Code</div><div class="info-value font-mono">${dept.code}</div></div>
        <div class="info-item"><div class="info-label">Department Head</div><div class="info-value">${dept.head||'—'}</div></div>
        <div class="info-item"><div class="info-label">Location</div><div class="info-value">${dept.location||'—'}</div></div>
        <div class="info-item"><div class="info-label">Cost Center</div><div class="info-value font-mono">${dept.costCenter||'—'}</div></div>
        <div class="info-item"><div class="info-label">Status</div><div class="info-value">${Utils.statusBadge(dept.status)}</div></div>
        <div class="info-item"><div class="info-label">Employees</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${dept.employees}</div></div>
        <div class="info-item"><div class="info-label">Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${dept.assets}</div></div>
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
  const loadHeadOptions = async (selectedName = '') => {
    const sel = document.getElementById('dept-head');
    const demoEmps = [
      { id:1, name:'Alice Johnson' },{ id:2, name:'Bob Smith' },{ id:3, name:'Carol Davis' },
      { id:4, name:'David Lee' },{ id:5, name:'Eva Brown' },{ id:6, name:'Frank Moore' },
    ];
    sel.innerHTML = `<option value="">Select Employee…</option>` +
      demoEmps.map(e => `<option value="${e.id}" ${e.name===selectedName?'selected':''}>${e.name}</option>`).join('');
  };

  const exportTable = () => { Utils.Toast.info('Export', 'Exporting departments to Excel…'); };

  return { load, openAdd, edit, view, save, remove, exportTable };
})();

window.openDeptModal = () => DeptPage.openAdd();
window.saveDepartment = () => DeptPage.save();
window.exportTable = () => DeptPage.exportTable();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  DeptPage.load();

  Utils.setupSearch('search-input', (q) => {
    DeptPage['state'] && (DeptPage.state = {}); // reset via closure
    window._deptState = { page: 1, search: q };
    DeptPage.load();
  });

  document.getElementById('status-filter').addEventListener('change', (e) => {
    DeptPage.load();
  });

  // Select all checkbox
  document.getElementById('select-all').addEventListener('change', (e) => {
    document.querySelectorAll('.row-check').forEach(c => c.checked = e.target.checked);
  });
});

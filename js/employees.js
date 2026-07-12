/* Employees JS */
const EmpPage = (() => {
  let state = { page: 1, pageSize: 9, search: '', dept: '', role: '', status: '', emps: [], total: 0, editing: null };

  const load = async () => {
    state.search = document.getElementById('emp-search') ? document.getElementById('emp-search').value.trim() : '';
    state.dept   = document.getElementById('dept-filter') ? document.getElementById('dept-filter').value : '';
    state.role   = document.getElementById('role-filter') ? document.getElementById('role-filter').value : '';
    state.status = document.getElementById('status-filter') ? document.getElementById('status-filter').value : '';

    const grid = document.getElementById('emp-grid');
    const tbody = document.getElementById('emp-tbody');
    if (!grid && !tbody) return;

    if (grid) grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem">Loading...</div>`;
    if (tbody) tbody.innerHTML = `<tr><td colspan="9">${Utils.skeletonRows(5, 9)}</td></tr>`;

    try {
      const params = Utils.buildQuery({ page: state.page - 1, size: state.pageSize, search: state.search, dept: state.dept, role: state.role, status: state.status });
      const res = await API.employees.getAll(params);
      state.emps = res.content || res || [];
      state.total = res.totalElements || state.emps.length || 0;
    } catch (err) {
      console.error(err);
      state.emps = [];
      state.total = 0;
    }

    if (document.getElementById('stat-emp-total')) document.getElementById('stat-emp-total').textContent = state.total;
    // Real stats would ideally come from a dashboard/metrics endpoint. 
    if (document.getElementById('stat-emp-active')) document.getElementById('stat-emp-active').textContent = state.emps.filter(e=>e.status==='ACTIVE').length;
    if (document.getElementById('stat-emp-alloc')) document.getElementById('stat-emp-alloc').textContent = state.emps.filter(e=>(e.assets || 0)>0).length;
    if (document.getElementById('stat-emp-depts')) document.getElementById('stat-emp-depts').textContent = [...new Set(state.emps.map(e=>e.dept))].filter(Boolean).length;

    const isAdmin = typeof Auth !== 'undefined' && Auth.hasRole('ADMIN');

    // Grid
    if (grid) {
      if (!state.emps.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">👥</div><h3>No employees found</h3></div>`;
      } else {
        grid.innerHTML = state.emps.map(e => `
          <div class="emp-card animate-fade-up hover-lift">
            <div class="emp-card-header">
              ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'lg')}
              <div class="emp-info">
                <div class="emp-name">${e.firstName} ${e.lastName}</div>
                <div class="emp-role" style="font-family:var(--font-mono);font-size:.7rem">${e.empId || 'N/A'}</div>
                <div style="margin-top:4px">${Utils.statusBadge(e.status)}</div>
              </div>
            </div>
            <div style="font-size:.75rem;color:var(--text-muted)">${e.title || '—'} · ${e.dept || '—'}</div>
            <div style="display:flex;align-items:center;gap:.375rem">
              <span class="badge badge-primary">${(e.role||'').replace('_',' ')}</span>
            </div>
            <div class="emp-stats">
              <div class="emp-stat">
                <div class="emp-stat-val">${e.assets || 0}</div>
                <div class="emp-stat-lbl">Assets</div>
              </div>
              <div class="emp-stat">
                <div class="emp-stat-val">${Utils.Format.date(e.doj)}</div>
                <div class="emp-stat-lbl">Joined</div>
              </div>
            </div>
            <div style="display:flex;gap:.375rem">
              <button class="btn btn-ghost btn-sm" style="flex:1" onclick="EmpPage.view(${e.id})">👁️ View</button>
              ${isAdmin ? `<button class="btn btn-ghost btn-sm" onclick="EmpPage.edit(${e.id})">✏️</button>` : ''}
              ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="EmpPage.remove(${e.id},'${Utils.escapeHtml(e.firstName)} ${Utils.escapeHtml(e.lastName)}')">🗑️</button>` : ''}
            </div>
          </div>
        `).join('');
      }
    }

    // Table
    if (tbody) {
      tbody.innerHTML = state.emps.map(e => `
        <tr>
          <td class="table-checkbox"><input type="checkbox"></td>
          <td>
            <div style="display:flex;align-items:center;gap:.75rem">
              ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'sm')}
              <div>
                <div style="font-weight:600">${e.firstName} ${e.lastName}</div>
                <div style="font-size:.75rem;color:var(--text-muted)">${e.title || '—'}</div>
              </div>
            </div>
          </td>
          <td style="font-family:var(--font-mono);font-size:.8125rem">${e.empId || 'N/A'}</td>
          <td style="font-size:.875rem">${e.dept || '—'}</td>
          <td><span class="badge badge-primary">${(e.role||'').replace('_',' ')}</span></td>
          <td><strong>${e.assets || 0}</strong></td>
          <td style="font-size:.8125rem">${e.email}</td>
          <td>${Utils.statusBadge(e.status)}</td>
          <td>
            <div style="display:flex;gap:.375rem">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="EmpPage.view(${e.id})">👁️</button>
              ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="EmpPage.edit(${e.id})">✏️</button>` : ''}
              ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="EmpPage.remove(${e.id},'${Utils.escapeHtml(e.firstName)}')">🗑️</button>` : ''}
            </div>
          </td>
        </tr>
      `).join('');
    }

    const paginationEl = document.getElementById('emp-grid-pagination');
    if (paginationEl) {
      Utils.renderPagination(paginationEl, {
        page: state.page, totalPages: Math.ceil(state.total / state.pageSize) || 1,
        total: state.total, pageSize: state.pageSize,
        onPageChange: (p) => { state.page = p; load(); }
      });
    }
  };

  const openAdd = () => {
    state.editing = null;
    document.getElementById('emp-modal-title').textContent = '👤 Add Employee';
    ['emp-first-name','emp-last-name','emp-email','emp-id-no','emp-phone','emp-title'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    document.getElementById('emp-dept').value   = '';
    document.getElementById('emp-role').value   = 'EMPLOYEE';
    document.getElementById('emp-status').value = 'ACTIVE';
    Utils.openModal('emp-modal');
  };

  const edit = (id) => {
    state.editing = id;
    const e = state.emps.find(x=>x.id===id);
    if (!e) return;
    document.getElementById('emp-modal-title').textContent = '✏️ Edit Employee';
    document.getElementById('emp-first-name').value = e.firstName;
    document.getElementById('emp-last-name').value  = e.lastName;
    document.getElementById('emp-email').value      = e.email;
    document.getElementById('emp-id-no').value      = e.empId || '';
    document.getElementById('emp-phone').value      = e.phone || '';
    document.getElementById('emp-title').value      = e.title || '';
    document.getElementById('emp-dept').value       = e.dept || '';
    document.getElementById('emp-role').value       = e.role;
    document.getElementById('emp-status').value     = e.status;
    Utils.openModal('emp-modal');
  };

  const view = (id) => {
    const e = state.emps.find(x=>x.id===id);
    if (!e) return;
    document.getElementById('emp-view-body').innerHTML = `
      <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;padding-bottom:1.25rem;border-bottom:1px solid var(--border)">
        ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'xl')}
        <div>
          <div style="font-size:1.375rem;font-weight:800">${e.firstName} ${e.lastName}</div>
          <div style="font-size:.875rem;color:var(--text-muted)">${e.title || '—'}</div>
          <div style="margin-top:.5rem;display:flex;gap:.5rem">
            ${Utils.statusBadge(e.status)}
            <span class="badge badge-primary">${(e.role||'').replace('_',' ')}</span>
          </div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Employee ID</div><div class="info-value font-mono">${e.empId||'—'}</div></div>
        <div class="info-item"><div class="info-label">Email</div><div class="info-value">${e.email}</div></div>
        <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${e.phone||'—'}</div></div>
        <div class="info-item"><div class="info-label">Department</div><div class="info-value">${e.dept||'—'}</div></div>
        <div class="info-item"><div class="info-label">Date of Joining</div><div class="info-value">${Utils.Format.date(e.doj)}</div></div>
        <div class="info-item"><div class="info-label">Current Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${e.assets||0}</div></div>
      </div>
    `;
    Utils.openModal('emp-view-modal');
  };

  const save = async () => {
    const valid = Utils.validateForm({
      'emp-first-name': { required:true },
      'emp-last-name':  { required:true },
      'emp-email':      { required:true, email:true },
    });
    if (!valid) return;
    const body = {
      firstName: document.getElementById('emp-first-name').value.trim(),
      lastName: document.getElementById('emp-last-name').value.trim(),
      email: document.getElementById('emp-email').value.trim(),
      empId: document.getElementById('emp-id-no').value.trim(),
      phone: document.getElementById('emp-phone').value.trim(),
      title: document.getElementById('emp-title').value.trim(),
      dept: document.getElementById('emp-dept').value.trim(),
      role: document.getElementById('emp-role').value,
      status: document.getElementById('emp-status').value
    };

    try {
      if (state.editing) { await API.employees.update(state.editing, body); Utils.Toast.success('Updated', 'Employee updated.'); }
      else               { await API.employees.create(body); Utils.Toast.success('Created', 'Employee added.'); }
      Utils.closeModal('emp-modal');
      load();
    } catch (err) {
      Utils.Toast.api(err);
    }
  };

  const remove = (id, name) => {
    Utils.confirmDialog('Remove Employee', `Remove "${name}" from the directory?`, async () => {
      try {
        await API.employees.delete(id);
        Utils.Toast.success('Removed', `${name} removed.`);
        load();
      } catch (err) {
        Utils.Toast.api(err);
      }
    });
  };

  return { load, openAdd, edit, view, save, remove, state };
})();

window.openEmpModal = () => EmpPage.openAdd();
window.saveEmployee = () => EmpPage.save();
window.exportEmps   = () => Utils.Toast.info('Export', 'Exporting employee list…');
window.switchEmpView = (v) => {
  const gv = document.getElementById('emp-grid-view');
  const tv = document.getElementById('emp-table-view');
  if (gv) gv.style.display  = v==='grid'?'':'none';
  if (tv) tv.style.display = v==='table'?'':'none';
};

const initEmpView = () => {
  if (!document.getElementById('emp-grid')) return;
  Auth.requireAuth();

  if (!Auth.hasRole('ADMIN')) {
    const addBtn = document.querySelector('.topbar-actions .btn-primary');
    if (addBtn) addBtn.style.display = 'none';
  }

  EmpPage.load();
  Utils.setupSearch('emp-search', q => { EmpPage.state.search=q; EmpPage.state.page=1; EmpPage.load(); });
  document.getElementById('dept-filter')?.addEventListener('change', e => { EmpPage.state.dept=e.target.value; EmpPage.load(); });
  document.getElementById('role-filter')?.addEventListener('change', e => { EmpPage.state.role=e.target.value; EmpPage.load(); });
  document.getElementById('status-filter')?.addEventListener('change', e => { EmpPage.state.status=e.target.value; EmpPage.load(); });
};

document.addEventListener('DOMContentLoaded', initEmpView);
window.addEventListener('pageLoaded', initEmpView);

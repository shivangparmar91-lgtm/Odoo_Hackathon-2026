/* Employees JS */
const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
const isAdmin = user && user.role === 'ADMIN';

const EmpPage = (() => {
  let state = { page:1, pageSize:9, search:'', dept:'', role:'', status:'', editingId: null };

  const load = async () => {
    const grid = document.getElementById('emp-grid');
    const tbody = document.getElementById('emp-tbody');
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div>`;
    tbody.innerHTML = `<tr><td colspan="9"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let emps = [];
    try {
      const params = Utils.buildQuery({ page: state.page - 1, size: state.pageSize, search: state.search, dept: state.dept, role: state.role, status: state.status });
      const res = await API.employees.getAll(params);
      emps = res.content || res || [];
      state.total = res.totalElements || emps.length;
    } catch (err) {
      Utils.Toast.api(err);
      state.total = 0;
    }

    document.getElementById('stat-emp-total').textContent  = state.total;
    document.getElementById('stat-emp-active').textContent = emps.filter(e=>e.status==='ACTIVE').length; // Local page estimate
    document.getElementById('stat-emp-alloc').textContent  = emps.filter(e=>(e.assets||0)>0).length;
    document.getElementById('stat-emp-depts').textContent  = [...new Set(emps.map(e=>e.dept))].length;

    if (!emps.length) {
      const emptyHtml = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">👥</div><h3>No employees found</h3><p>Adjust your filters or add a new employee.</p></div>`;
      grid.innerHTML = emptyHtml;
      tbody.innerHTML = `<tr><td colspan="9">${emptyHtml}</td></tr>`;
    } else {
      // Grid
      grid.innerHTML = emps.map(e => {
        let actions = `<button class="btn btn-ghost btn-sm" style="flex:1" onclick="EmpPage.view(${e.id})">👁️ View</button>`;
        if (isAdmin) {
          actions += `
            <button class="btn btn-ghost btn-sm" onclick="EmpPage.edit(${e.id})">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="EmpPage.remove(${e.id},'${Utils.escapeHtml(e.firstName)} ${Utils.escapeHtml(e.lastName)}')">🗑️</button>
          `;
        }

        return `
        <div class="emp-card animate-fade-up hover-lift">
          <div class="emp-card-header">
            ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'lg')}
            <div class="emp-info">
              <div class="emp-name">${Utils.escapeHtml(e.firstName)} ${Utils.escapeHtml(e.lastName)}</div>
              <div class="emp-role" style="font-family:var(--font-mono);font-size:.7rem">${Utils.escapeHtml(e.empId)}</div>
              <div style="margin-top:4px">${Utils.statusBadge(e.status)}</div>
            </div>
          </div>
          <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(e.title)} · ${Utils.escapeHtml(e.dept)}</div>
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
            ${actions}
          </div>
        </div>
      `}).join('');

      // Table
      tbody.innerHTML = emps.map(e => {
        let actions = `<button class="btn btn-ghost btn-icon btn-sm" onclick="EmpPage.view(${e.id})">👁️</button>`;
        if (isAdmin) {
          actions += `
            <button class="btn btn-ghost btn-icon btn-sm" onclick="EmpPage.edit(${e.id})">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="EmpPage.remove(${e.id},'${Utils.escapeHtml(e.firstName)}')">🗑️</button>
          `;
        }

        return `
        <tr>
          <td class="table-checkbox"><input type="checkbox"></td>
          <td>
            <div style="display:flex;align-items:center;gap:.75rem">
              ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'sm')}
              <div>
                <div style="font-weight:600">${Utils.escapeHtml(e.firstName)} ${Utils.escapeHtml(e.lastName)}</div>
                <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(e.title)}</div>
              </div>
            </div>
          </td>
          <td style="font-family:var(--font-mono);font-size:.8125rem">${Utils.escapeHtml(e.empId)}</td>
          <td style="font-size:.875rem">${Utils.escapeHtml(e.dept)}</td>
          <td><span class="badge badge-primary">${(e.role||'').replace('_',' ')}</span></td>
          <td><strong>${e.assets || 0}</strong></td>
          <td style="font-size:.8125rem">${Utils.escapeHtml(e.email)}</td>
          <td>${Utils.statusBadge(e.status)}</td>
          <td>
            <div style="display:flex;gap:.375rem">
              ${actions}
            </div>
          </td>
        </tr>
      `}).join('');
    }

    const paginationEl = document.getElementById('emp-grid-pagination');
    Utils.renderPagination(paginationEl, {
      page: state.page, totalPages: Math.ceil(state.total/state.pageSize),
      total: state.total, pageSize: state.pageSize,
      onPageChange: (p) => { state.page=p; load(); }
    });
  };

  const loadDepartmentOptions = async (selected = '') => {
    try {
      const departments = await API.departments.getAll('size=100');
      // Employee records store department as a plain name (see EmployeeService),
      // so the option value is the department name, not its id.
      Utils.populateSelect('emp-dept', departments, {
        valueKey: 'name', labelKey: 'name', placeholder: 'Select Department…', selected,
      });
      Utils.populateSelect('dept-filter', departments, {
        valueKey: 'name', labelKey: 'name', placeholder: 'All Departments',
      });
    } catch (err) { Utils.Toast.api(err); }
  };

  const openAdd = async () => {
    state.editingId = null;
    document.getElementById('emp-modal-title').textContent = '👤 Add Employee';
    ['emp-first-name','emp-last-name','emp-email','emp-id-no','emp-phone','emp-title','emp-doj'].forEach(id=>{
      const el=document.getElementById(id); if(el) el.value='';
    });
    await loadDepartmentOptions();
    document.getElementById('emp-dept').value   = '';
    document.getElementById('emp-role').value   = 'EMPLOYEE';
    document.getElementById('emp-status').value = 'ACTIVE';
    Utils.openModal('emp-modal');
  };

  const edit = async (id) => {
    state.editingId = id;
    document.getElementById('emp-modal-title').textContent = '✏️ Edit Employee';
    try {
      const e = await API.employees.getById(id);
      document.getElementById('emp-first-name').value = e.firstName || '';
      document.getElementById('emp-last-name').value  = e.lastName || '';
      document.getElementById('emp-email').value      = e.email || '';
      document.getElementById('emp-id-no').value      = e.empId || '';
      document.getElementById('emp-phone').value      = e.phone || '';
      document.getElementById('emp-title').value      = e.title || '';
      document.getElementById('emp-doj').value        = e.doj ? e.doj.substring(0,10) : '';
      await loadDepartmentOptions(e.dept || '');
      document.getElementById('emp-role').value       = e.role || '';
      document.getElementById('emp-status').value     = e.status || 'ACTIVE';
      Utils.openModal('emp-modal');
    } catch (err) {
      Utils.Toast.api(err);
    }
  };

  const view = async (id) => {
    try {
      const e = await API.employees.getById(id);
      document.getElementById('emp-view-body').innerHTML = `
        <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;padding-bottom:1.25rem;border-bottom:1px solid var(--border)">
          ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'xl')}
          <div>
            <div style="font-size:1.375rem;font-weight:800">${Utils.escapeHtml(e.firstName)} ${Utils.escapeHtml(e.lastName)}</div>
            <div style="font-size:.875rem;color:var(--text-muted)">${Utils.escapeHtml(e.title)}</div>
            <div style="margin-top:.5rem;display:flex;gap:.5rem">
              ${Utils.statusBadge(e.status)}
              <span class="badge badge-primary">${(e.role||'').replace('_',' ')}</span>
            </div>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Employee ID</div><div class="info-value font-mono">${Utils.escapeHtml(e.empId)}</div></div>
          <div class="info-item"><div class="info-label">Email</div><div class="info-value">${Utils.escapeHtml(e.email)}</div></div>
          <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${Utils.escapeHtml(e.phone||'—')}</div></div>
          <div class="info-item"><div class="info-label">Department</div><div class="info-value">${Utils.escapeHtml(e.dept||'—')}</div></div>
          <div class="info-item"><div class="info-label">Date of Joining</div><div class="info-value">${Utils.Format.date(e.doj)}</div></div>
          <div class="info-item"><div class="info-label">Current Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${e.assets || 0}</div></div>
        </div>
      `;
      Utils.openModal('emp-view-modal');
    } catch (err) {
      Utils.Toast.api(err);
    }
  };

  const save = async () => {
    const valid = Utils.validateForm({
      'emp-first-name': { required:true },
      'emp-last-name':  { required:true },
      'emp-email':      { required:true, email:true },
      'emp-id-no':      { required:true },
      'emp-dept':       { required:true },
    });
    if (!valid) return;
    const btn = document.getElementById('emp-save-btn');
    if (btn) Utils.setButtonLoading(btn, true);
    const body = {
      firstName: document.getElementById('emp-first-name').value.trim(),
      lastName:  document.getElementById('emp-last-name').value.trim(),
      email:     document.getElementById('emp-email').value.trim(),
      empId:     document.getElementById('emp-id-no').value.trim(),
      phone:     document.getElementById('emp-phone')?.value.trim() || '',
      title:     document.getElementById('emp-title')?.value.trim() || '',
      doj:       document.getElementById('emp-doj')?.value || '',
      dept:      document.getElementById('emp-dept').value,
      role:      document.getElementById('emp-role').value,
      status:    document.getElementById('emp-status').value,
    };
    try {
      if (state.editingId) {
        await API.employees.update(state.editingId, body);
        Utils.Toast.success('Updated!', 'Employee updated successfully.');
      } else {
        await API.employees.create(body);
        Utils.Toast.success('Saved!', 'Employee record saved.');
      }
      Utils.closeModal('emp-modal');
      load();
    } catch (err) {
      Utils.Toast.api(err);
    }
    if (btn) Utils.setButtonLoading(btn, false);
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

  return { load, openAdd, edit, view, save, remove, state, loadDepartmentOptions };
})();

window.openEmpModal = () => EmpPage.openAdd();
window.saveEmployee = () => EmpPage.save();
window.exportEmps   = () => Utils.Toast.info('Export', 'Exporting employee list…');
window.switchEmpView = (v) => {
  document.getElementById('emp-grid-view').style.display  = v==='grid'?'':'none';
  document.getElementById('emp-table-view').style.display = v==='table'?'':'none';
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const isAdmin = user && user.role === 'ADMIN';
  if (!isAdmin) {
    const addBtn = document.querySelector('button[onclick="openEmpModal()"]');
    if (addBtn) addBtn.style.display = 'none';
  }

  EmpPage.load();
  EmpPage.loadDepartmentOptions();
  Utils.setupSearch('emp-search', q => { EmpPage.state.search=q; EmpPage.state.page=1; EmpPage.load(); });
  document.getElementById('dept-filter').addEventListener('change', e => { EmpPage.state.dept=e.target.value; EmpPage.state.page=1; EmpPage.load(); });
  document.getElementById('role-filter').addEventListener('change', e => { EmpPage.state.role=e.target.value; EmpPage.state.page=1; EmpPage.load(); });
  document.getElementById('status-filter').addEventListener('change', e => { EmpPage.state.status=e.target.value; EmpPage.state.page=1; EmpPage.load(); });
});

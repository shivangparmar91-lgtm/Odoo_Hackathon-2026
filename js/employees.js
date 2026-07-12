/* Employees JS */
const DEMO_EMPS = [
  { id:1,  firstName:'Alice',   lastName:'Johnson',  empId:'EMP-001', email:'alice@co.io',    phone:'+91 98001 00001', dept:'Information Technology',  title:'IT Manager',           role:'ASSET_MANAGER', assets:3,  doj:'2020-03-15', status:'ACTIVE'   },
  { id:2,  firstName:'Bob',     lastName:'Smith',    empId:'EMP-002', email:'bob@co.io',      phone:'+91 98001 00002', dept:'Human Resources',         title:'HR Lead',              role:'DEPT_HEAD',     assets:1,  doj:'2019-08-01', status:'ACTIVE'   },
  { id:3,  firstName:'Carol',   lastName:'Davis',    empId:'EMP-003', email:'carol@co.io',    phone:'+91 98001 00003', dept:'Finance & Accounts',      title:'Finance Head',         role:'DEPT_HEAD',     assets:2,  doj:'2021-01-20', status:'ACTIVE'   },
  { id:4,  firstName:'David',   lastName:'Lee',      empId:'EMP-004', email:'david@co.io',    phone:'+91 98001 00004', dept:'Operations',              title:'Operations Chief',     role:'DEPT_HEAD',     assets:4,  doj:'2018-07-11', status:'ACTIVE'   },
  { id:5,  firstName:'Eva',     lastName:'Brown',    empId:'EMP-005', email:'eva@co.io',      phone:'+91 98001 00005', dept:'Sales & Marketing',       title:'Sales Manager',        role:'DEPT_HEAD',     assets:2,  doj:'2022-04-03', status:'ACTIVE'   },
  { id:6,  firstName:'Frank',   lastName:'Moore',    empId:'EMP-006', email:'frank@co.io',    phone:'+91 98001 00006', dept:'Legal & Compliance',      title:'Legal Head',           role:'DEPT_HEAD',     assets:1,  doj:'2023-01-10', status:'ACTIVE'   },
  { id:7,  firstName:'Grace',   lastName:'Kim',      empId:'EMP-007', email:'grace@co.io',    phone:'+91 98001 00007', dept:'Research & Development',  title:'R&D Lead',             role:'DEPT_HEAD',     assets:5,  doj:'2020-09-22', status:'ACTIVE'   },
  { id:8,  firstName:'Henry',   lastName:'Wilson',   empId:'EMP-008', email:'henry@co.io',    phone:'+91 98001 00008', dept:'Customer Support',        title:'Support Head',         role:'DEPT_HEAD',     assets:1,  doj:'2021-11-15', status:'ACTIVE'   },
  { id:9,  firstName:'Irene',   lastName:'Clark',    empId:'EMP-009', email:'irene@co.io',    phone:'+91 98001 00009', dept:'Information Technology',  title:'DevOps Engineer',      role:'EMPLOYEE',      assets:2,  doj:'2022-07-20', status:'ACTIVE'   },
  { id:10, firstName:'James',   lastName:'Taylor',   empId:'EMP-010', email:'james@co.io',    phone:'+91 98001 00010', dept:'Finance & Accounts',      title:'Accountant',           role:'EMPLOYEE',      assets:1,  doj:'2023-03-01', status:'INACTIVE' },
  { id:11, firstName:'Priya',   lastName:'Sharma',   empId:'EMP-011', email:'priya@co.io',    phone:'+91 98001 00011', dept:'Research & Development',  title:'Product Researcher',   role:'EMPLOYEE',      assets:3,  doj:'2025-07-11', status:'ACTIVE'   },
  { id:12, firstName:'Michael', lastName:'Torres',   empId:'EMP-012', email:'michael@co.io',  phone:'+91 98001 00012', dept:'Sales & Marketing',       title:'Marketing Analyst',    role:'EMPLOYEE',      assets:2,  doj:'2024-02-14', status:'ACTIVE'   },
  { id:13, firstName:'Aarav',   lastName:'Patel',    empId:'EMP-013', email:'aarav@co.io',    phone:'+91 98001 00013', dept:'Information Technology',  title:'Software Engineer',    role:'EMPLOYEE',      assets:2,  doj:'2023-09-01', status:'ACTIVE'   },
];

const EmpPage = (() => {
  let state = { page:1, pageSize:9, search:'', dept:'', role:'', status:'' };

  const getFiltered = () => DEMO_EMPS.filter(e =>
    (!state.search || `${e.firstName} ${e.lastName} ${e.empId} ${e.email}`.toLowerCase().includes(state.search)) &&
    (!state.dept   || e.dept === state.dept) &&
    (!state.role   || e.role === state.role) &&
    (!state.status || e.status === state.status)
  );

  const load = () => {
    const filtered = getFiltered();
    const slice = filtered.slice((state.page-1)*state.pageSize, state.page*state.pageSize);

    document.getElementById('stat-emp-total').textContent  = DEMO_EMPS.length;
    document.getElementById('stat-emp-active').textContent = DEMO_EMPS.filter(e=>e.status==='ACTIVE').length;
    document.getElementById('stat-emp-alloc').textContent  = DEMO_EMPS.filter(e=>e.assets>0).length;
    document.getElementById('stat-emp-depts').textContent  = [...new Set(DEMO_EMPS.map(e=>e.dept))].length;

    // Grid
    const grid = document.getElementById('emp-grid');
    if (!slice.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">👥</div><h3>No employees found</h3></div>`;
    } else {
      grid.innerHTML = slice.map(e => `
        <div class="emp-card animate-fade-up hover-lift">
          <div class="emp-card-header">
            ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'lg')}
            <div class="emp-info">
              <div class="emp-name">${e.firstName} ${e.lastName}</div>
              <div class="emp-role" style="font-family:var(--font-mono);font-size:.7rem">${e.empId}</div>
              <div style="margin-top:4px">${Utils.statusBadge(e.status)}</div>
            </div>
          </div>
          <div style="font-size:.75rem;color:var(--text-muted)">${e.title} · ${e.dept}</div>
          <div style="display:flex;align-items:center;gap:.375rem">
            <span class="badge badge-primary">${e.role.replace('_',' ')}</span>
          </div>
          <div class="emp-stats">
            <div class="emp-stat">
              <div class="emp-stat-val">${e.assets}</div>
              <div class="emp-stat-lbl">Assets</div>
            </div>
            <div class="emp-stat">
              <div class="emp-stat-val">${Utils.Format.date(e.doj)}</div>
              <div class="emp-stat-lbl">Joined</div>
            </div>
          </div>
          <div style="display:flex;gap:.375rem">
            <button class="btn btn-ghost btn-sm" style="flex:1" onclick="EmpPage.view(${e.id})">👁️ View</button>
            <button class="btn btn-ghost btn-sm" onclick="EmpPage.edit(${e.id})">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="EmpPage.remove(${e.id},'${e.firstName} ${e.lastName}')">🗑️</button>
          </div>
        </div>
      `).join('');
    }

    // Table
    const tbody = document.getElementById('emp-tbody');
    tbody.innerHTML = slice.map(e => `
      <tr>
        <td class="table-checkbox"><input type="checkbox"></td>
        <td>
          <div style="display:flex;align-items:center;gap:.75rem">
            ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'sm')}
            <div>
              <div style="font-weight:600">${e.firstName} ${e.lastName}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${e.title}</div>
            </div>
          </div>
        </td>
        <td style="font-family:var(--font-mono);font-size:.8125rem">${e.empId}</td>
        <td style="font-size:.875rem">${e.dept}</td>
        <td><span class="badge badge-primary">${e.role.replace('_',' ')}</span></td>
        <td><strong>${e.assets}</strong></td>
        <td style="font-size:.8125rem">${e.email}</td>
        <td>${Utils.statusBadge(e.status)}</td>
        <td>
          <div style="display:flex;gap:.375rem">
            <button class="btn btn-ghost btn-icon btn-sm" onclick="EmpPage.view(${e.id})">👁️</button>
            <button class="btn btn-ghost btn-icon btn-sm" onclick="EmpPage.edit(${e.id})">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="EmpPage.remove(${e.id},'${e.firstName}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');

    const paginationEl = document.getElementById('emp-grid-pagination');
    Utils.renderPagination(paginationEl, {
      page: state.page, totalPages: Math.ceil(filtered.length/state.pageSize),
      total: filtered.length, pageSize: state.pageSize,
      onPageChange: (p) => { state.page=p; load(); }
    });
  };

  const openAdd = () => {
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
    const e = DEMO_EMPS.find(x=>x.id===id);
    if (!e) return;
    document.getElementById('emp-modal-title').textContent = '✏️ Edit Employee';
    document.getElementById('emp-first-name').value = e.firstName;
    document.getElementById('emp-last-name').value  = e.lastName;
    document.getElementById('emp-email').value      = e.email;
    document.getElementById('emp-id-no').value      = e.empId;
    document.getElementById('emp-phone').value      = e.phone;
    document.getElementById('emp-title').value      = e.title;
    document.getElementById('emp-dept').value       = e.dept;
    document.getElementById('emp-role').value       = e.role;
    document.getElementById('emp-status').value     = e.status;
    Utils.openModal('emp-modal');
  };

  const view = (id) => {
    const e = DEMO_EMPS.find(x=>x.id===id);
    if (!e) return;
    document.getElementById('emp-view-body').innerHTML = `
      <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;padding-bottom:1.25rem;border-bottom:1px solid var(--border)">
        ${Utils.avatarHtml(`${e.firstName} ${e.lastName}`, 'xl')}
        <div>
          <div style="font-size:1.375rem;font-weight:800">${e.firstName} ${e.lastName}</div>
          <div style="font-size:.875rem;color:var(--text-muted)">${e.title}</div>
          <div style="margin-top:.5rem;display:flex;gap:.5rem">
            ${Utils.statusBadge(e.status)}
            <span class="badge badge-primary">${e.role.replace('_',' ')}</span>
          </div>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Employee ID</div><div class="info-value font-mono">${e.empId}</div></div>
        <div class="info-item"><div class="info-label">Email</div><div class="info-value">${e.email}</div></div>
        <div class="info-item"><div class="info-label">Phone</div><div class="info-value">${e.phone||'—'}</div></div>
        <div class="info-item"><div class="info-label">Department</div><div class="info-value">${e.dept}</div></div>
        <div class="info-item"><div class="info-label">Date of Joining</div><div class="info-value">${Utils.Format.date(e.doj)}</div></div>
        <div class="info-item"><div class="info-label">Current Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${e.assets}</div></div>
      </div>
    `;
    Utils.openModal('emp-view-modal');
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
    Utils.Toast.success('Saved!', 'Employee record saved.');
    Utils.closeModal('emp-modal');
    load();
  };

  const remove = (id, name) => {
    Utils.confirmDialog('Remove Employee', `Remove "${name}" from the directory?`, () => {
      Utils.Toast.success('Removed', `${name} removed.`);
    });
  };

  return { load, openAdd, edit, view, save, remove, state };
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
  EmpPage.load();
  Utils.setupSearch('emp-search', q => { EmpPage.state.search=q; EmpPage.state.page=1; EmpPage.load(); });
  document.getElementById('dept-filter').addEventListener('change', e => { EmpPage.state.dept=e.target.value; EmpPage.load(); });
  document.getElementById('role-filter').addEventListener('change', e => { EmpPage.state.role=e.target.value; EmpPage.load(); });
  document.getElementById('status-filter').addEventListener('change', e => { EmpPage.state.status=e.target.value; EmpPage.load(); });
});

/* Categories JS */
const CatPage = (() => {
  let state = { editId: null, currentView: 'grid', filterType: '', searchQ: '' };

  const DEMO_CATS = [
    { id:1, name:'Laptops & Computers', type:'HARDWARE',   icon:'💻', color:'#6366f1', assets:95,  depreciation:20, life:5,  status:'ACTIVE',  description:'All portable and desktop computing devices.' },
    { id:2, name:'Mobile Devices',       type:'HARDWARE',   icon:'📱', color:'#10b981', assets:67,  depreciation:33, life:3,  status:'ACTIVE',  description:'Smartphones, tablets and accessories.' },
    { id:3, name:'Office Furniture',     type:'FURNITURE',  icon:'🪑', color:'#f59e0b', assets:112, depreciation:10, life:10, status:'ACTIVE',  description:'Desks, chairs, shelves and cabinets.' },
    { id:4, name:'Network Equipment',    type:'HARDWARE',   icon:'🌐', color:'#38bdf8', assets:43,  depreciation:25, life:4,  status:'ACTIVE',  description:'Routers, switches and cabling.' },
    { id:5, name:'Software Licenses',    type:'SOFTWARE',   icon:'📋', color:'#a855f7', assets:280, depreciation:0,  life:1,  status:'ACTIVE',  description:'Perpetual and subscription licenses.' },
    { id:6, name:'Company Vehicles',     type:'VEHICLE',    icon:'🚗', color:'#f43f5e', assets:18,  depreciation:15, life:7,  status:'ACTIVE',  description:'Cars, vans and transport fleet.' },
    { id:7, name:'Printing Equipment',   type:'HARDWARE',   icon:'🖨️', color:'#ec4899', assets:24,  depreciation:20, life:5,  status:'INACTIVE',description:'Printers, scanners and copiers.' },
    { id:8, name:'A/V Equipment',        type:'EQUIPMENT',  icon:'📷', color:'#84cc16', assets:31,  depreciation:20, life:5,  status:'ACTIVE',  description:'Cameras, projectors and displays.' },
  ];

  const getFiltered = () => DEMO_CATS.filter(c =>
    (!state.searchQ || c.name.toLowerCase().includes(state.searchQ)) &&
    (!state.filterType || c.type === state.filterType)
  );

  const renderGrid = () => {
    const grid = document.getElementById('cat-grid');
    const cats = getFiltered();
    if (!cats.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📁</div><h3>No categories found</h3><p>Add your first asset category.</p></div>`;
      return;
    }
    grid.innerHTML = cats.map(c => `
      <div class="category-card" style="--cat-color:${c.color}">
        <div class="cat-icon-wrap" style="background:${c.color}22">${c.icon}</div>
        <div style="font-weight:700;font-size:1rem;margin-bottom:.25rem">${Utils.escapeHtml(c.name)}</div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:.25rem">${c.type}</div>
        <div style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5">${Utils.Format.truncate(c.description,60)}</div>
        <div class="cat-meta">
          <div class="cat-stat">📦 <strong>${c.assets}</strong> assets</div>
          <div class="cat-stat" style="margin-left:auto">${Utils.statusBadge(c.status)}</div>
        </div>
        <div style="display:flex;gap:.375rem;margin-top:.75rem">
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="CatPage.openEdit(${c.id})">✏️ Edit</button>
          <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="CatPage.remove(${c.id},'${Utils.escapeHtml(c.name)}')">🗑️</button>
        </div>
      </div>
    `).join('');
  };

  const renderList = () => {
    const tbody = document.getElementById('cat-tbody');
    const cats = getFiltered();
    tbody.innerHTML = cats.map(c => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:.75rem">
            <div style="width:36px;height:36px;border-radius:8px;background:${c.color}22;display:flex;align-items:center;justify-content:center;font-size:18px">${c.icon}</div>
            <div>
              <div style="font-weight:600">${Utils.escapeHtml(c.name)}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${Utils.Format.truncate(c.description,40)}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-primary">${c.type}</span></td>
        <td><strong>${c.assets}</strong></td>
        <td>${c.depreciation}%/yr</td>
        <td>${c.life} yrs</td>
        <td>${Utils.statusBadge(c.status)}</td>
        <td>
          <div style="display:flex;gap:.375rem">
            <button class="btn btn-ghost btn-icon btn-sm" onclick="CatPage.openEdit(${c.id})">✏️</button>
            <button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="CatPage.remove(${c.id},'${Utils.escapeHtml(c.name)}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  };

  const load = () => {
    renderGrid();
    renderList();
  };

  const openAdd = () => {
    state.editId = null;
    document.getElementById('cat-modal-title').textContent = '📁 Add Category';
    ['cat-name','cat-icon','cat-desc'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('cat-type').value = '';
    document.getElementById('cat-color').value = '#6366f1';
    document.getElementById('cat-depr').value = '';
    document.getElementById('cat-life').value = '';
    document.getElementById('cat-maint-interval').value = '';
    document.getElementById('cat-warranty').value = '';
    Utils.openModal('cat-modal');
  };

  const openEdit = (id) => {
    state.editId = id;
    const c = DEMO_CATS.find(x => x.id === id);
    if (!c) return;
    document.getElementById('cat-modal-title').textContent = '✏️ Edit Category';
    document.getElementById('cat-name').value  = c.name;
    document.getElementById('cat-type').value  = c.type;
    document.getElementById('cat-icon').value  = c.icon;
    document.getElementById('cat-color').value = c.color;
    document.getElementById('cat-depr').value  = c.depreciation;
    document.getElementById('cat-life').value  = c.life;
    document.getElementById('cat-desc').value  = c.description;
    Utils.openModal('cat-modal');
  };

  const save = async () => {
    const valid = Utils.validateForm({ 'cat-name': { required: true }, 'cat-type': { required: true } });
    if (!valid) return;
    const btn = document.getElementById('cat-save-btn');
    Utils.setButtonLoading(btn, true);
    const body = {
      name: document.getElementById('cat-name').value.trim(),
      type: document.getElementById('cat-type').value,
      icon: document.getElementById('cat-icon').value.trim(),
      color: document.getElementById('cat-color').value,
      depreciation: parseFloat(document.getElementById('cat-depr').value)||0,
      life: parseInt(document.getElementById('cat-life').value)||0,
      description: document.getElementById('cat-desc').value.trim(),
    };
    try {
      if (state.editId) { await API.categories.update(state.editId, body); Utils.Toast.success('Updated!','Category updated.'); }
      else        { await API.categories.create(body);          Utils.Toast.success('Created!','Category added.'); }
      Utils.closeModal('cat-modal');
      load();
    } catch (err) { Utils.Toast.api(err); }
    Utils.setButtonLoading(btn, false);
  };

  const remove = (id, name) => {
    Utils.confirmDialog('Delete Category', `Delete "${name}"? All assets in this category must be reassigned.`, async () => {
      try { await API.categories.delete(id); Utils.Toast.success('Deleted', `${name} removed.`); load(); }
      catch (err) { Utils.Toast.api(err); }
    });
  };

  return { load, openAdd, openEdit, save, remove, state };
})();

window.openCatModal = () => CatPage.openAdd();
window.saveCategory = () => CatPage.save();
window.switchView   = (v) => {
  document.getElementById('cat-grid-view').style.display = v==='grid'?'':'none';
  document.getElementById('cat-list-view').style.display = v==='list'?'':'none';
  document.getElementById('view-grid-btn').classList.toggle('active', v==='grid');
  document.getElementById('view-list-btn').classList.toggle('active', v==='list');
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  CatPage.load();
  Utils.setupSearch('cat-search', q => { CatPage.state.searchQ = q.toLowerCase(); CatPage.load(); });
  document.querySelectorAll('.filter-chip[data-type]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip[data-type]').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      CatPage.state.filterType = chip.dataset.type;
      CatPage.load();
    });
  });
});

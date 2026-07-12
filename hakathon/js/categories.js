/* Categories JS */
const CatPage = (() => {
  let state = { editId: null, currentView: 'grid', filterType: '', searchQ: '', cats: [] };

  const getFiltered = () => state.cats.filter(c =>
    (!state.searchQ || c.name.toLowerCase().includes(state.searchQ)) &&
    (!state.filterType || c.type === state.filterType)
  );

  const renderGrid = () => {
    const isAdmin = typeof Auth !== 'undefined' && Auth.hasRole('ADMIN');
    const grid = document.getElementById('cat-grid');
    if (!grid) return;
    const cats = getFiltered();
    if (!cats.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📁</div><h3>No categories found</h3><p>Add your first asset category.</p></div>`;
      return;
    }
    grid.innerHTML = cats.map(c => `
      <div class="category-card" style="--cat-color:${c.color || '#6366f1'}">
        <div class="cat-icon-wrap" style="background:${c.color || '#6366f1'}22">${c.icon || '📁'}</div>
        <div style="font-weight:700;font-size:1rem;margin-bottom:.25rem">${Utils.escapeHtml(c.name)}</div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:.25rem">${c.type}</div>
        <div style="font-size:.8125rem;color:var(--text-secondary);line-height:1.5">${Utils.Format.truncate(c.description || 'No description', 60)}</div>
        <div class="cat-meta">
          <div class="cat-stat">📦 <strong>${c.assets || 0}</strong> assets</div>
          <div class="cat-stat" style="margin-left:auto">${Utils.statusBadge(c.status)}</div>
        </div>
        <div style="display:flex;gap:.375rem;margin-top:.75rem">
          ${isAdmin ? `<button class="btn btn-ghost btn-sm" style="flex:1" onclick="CatPage.openEdit(${c.id})">✏️ Edit</button>` : ''}
          ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="CatPage.remove(${c.id},'${Utils.escapeHtml(c.name)}')">🗑️</button>` : ''}
        </div>
      </div>
    `).join('');
  };

  const renderList = () => {
    const isAdmin = typeof Auth !== 'undefined' && Auth.hasRole('ADMIN');
    const tbody = document.getElementById('cat-tbody');
    if (!tbody) return;
    const cats = getFiltered();
    tbody.innerHTML = cats.map(c => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:.75rem">
            <div style="width:36px;height:36px;border-radius:8px;background:${c.color || '#6366f1'}22;display:flex;align-items:center;justify-content:center;font-size:18px">${c.icon || '📁'}</div>
            <div>
              <div style="font-weight:600">${Utils.escapeHtml(c.name)}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${Utils.Format.truncate(c.description || '', 40)}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-primary">${c.type}</span></td>
        <td><strong>${c.assets || 0}</strong></td>
        <td>${c.depreciation || 0}%/yr</td>
        <td>${c.life || 0} yrs</td>
        <td>${Utils.statusBadge(c.status)}</td>
        <td>
          <div style="display:flex;gap:.375rem">
            ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="CatPage.openEdit(${c.id})">✏️</button>` : ''}
            ${isAdmin ? `<button class="btn btn-ghost btn-icon btn-sm" style="color:var(--danger)" onclick="CatPage.remove(${c.id},'${Utils.escapeHtml(c.name)}')">🗑️</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  };

  const load = async () => {
    try {
      const res = await API.categories.getAll();
      state.cats = res.content || res || [];
    } catch (err) {
      console.error(err);
      state.cats = [];
    }
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
    const c = state.cats.find(x => x.id === id);
    if (!c) return;
    document.getElementById('cat-modal-title').textContent = '✏️ Edit Category';
    document.getElementById('cat-name').value  = c.name;
    document.getElementById('cat-type').value  = c.type;
    document.getElementById('cat-icon').value  = c.icon || '';
    document.getElementById('cat-color').value = c.color || '#6366f1';
    document.getElementById('cat-depr').value  = c.depreciation || '';
    document.getElementById('cat-life').value  = c.life || '';
    document.getElementById('cat-desc').value  = c.description || '';
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
  const gv = document.getElementById('cat-grid-view');
  const lv = document.getElementById('cat-list-view');
  const gBtn = document.getElementById('view-grid-btn');
  const lBtn = document.getElementById('view-list-btn');

  if (gv) gv.style.display = v==='grid'?'':'none';
  if (lv) lv.style.display = v==='list'?'':'none';
  if (gBtn) gBtn.classList.toggle('active', v==='grid');
  if (lBtn) lBtn.classList.toggle('active', v==='list');
};

const initCatView = () => {
  if (!document.getElementById('cat-grid')) return;
  Auth.requireAuth();

  if (!Auth.hasRole('ADMIN')) {
    const addBtn = document.querySelector('.topbar-actions .btn-primary');
    if (addBtn) addBtn.style.display = 'none';
  }

  CatPage.load();
  Utils.setupSearch('cat-search', q => { CatPage.state.searchQ = q.toLowerCase(); CatPage.load(); });
  
  document.querySelectorAll('.filter-chip[data-type]').forEach(chip => {
    // Prevent duplicate event listeners
    const newChip = chip.cloneNode(true);
    chip.parentNode.replaceChild(newChip, chip);
    newChip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip[data-type]').forEach(c=>c.classList.remove('active'));
      newChip.classList.add('active');
      CatPage.state.filterType = newChip.dataset.type;
      CatPage.load();
    });
  });
};

document.addEventListener('DOMContentLoaded', initCatView);
window.addEventListener('pageLoaded', initCatView);

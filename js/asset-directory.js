/* Asset Directory JS */
const DEMO_ASSETS = [
  { id: 1,  tag: 'AF-2025-001', name: 'Dell Latitude 7420',         category: 'Laptops & Computers',   condition: 'EXCELLENT', status: 'ALLOCATED',      assignedTo: 'Alice Johnson',   dept: 'IT',           location: 'Remote / WFH'          },
  { id: 2,  tag: 'AF-2025-002', name: 'MacBook Pro M3 14"',         category: 'Laptops & Computers',   condition: 'NEW',       status: 'AVAILABLE',      assignedTo: null,              dept: 'IT',           location: 'IT Store – Rack A2'    },
  { id: 3,  tag: 'AF-2025-003', name: 'Herman Miller Aeron Chair',  category: 'Office Furniture',      condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'Bob Smith',       dept: 'HR',           location: 'Desk B12'              },
  { id: 4,  tag: 'AF-2025-004', name: 'iPhone 14 Pro',              category: 'Mobile Devices',        condition: 'FAIR',      status: 'IN_MAINTENANCE', assignedTo: null,              dept: 'IT',           location: 'Service Center'        },
  { id: 5,  tag: 'AF-2025-005', name: 'Cisco ASR 1001-X Router',    category: 'Network Equipment',     condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'IT Dept',         dept: 'IT',           location: 'Server Room 1'         },
  { id: 6,  tag: 'AF-2025-006', name: 'HP LaserJet Pro MFP',        category: 'Printing Equipment',    condition: 'POOR',      status: 'RETIRED',        assignedTo: null,              dept: 'Operations',   location: 'Storage B3'            },
  { id: 7,  tag: 'AF-2025-007', name: 'Lenovo ThinkPad X1 Carbon',  category: 'Laptops & Computers',   condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'David Lee',       dept: 'Operations',   location: 'Desk A4'               },
  { id: 8,  tag: 'AF-2025-008', name: 'iPad Air (5th Gen)',          category: 'Mobile Devices',        condition: 'EXCELLENT', status: 'AVAILABLE',      assignedTo: null,              dept: 'Sales',        location: 'Sales Cabinet'         },
  { id: 9,  tag: 'AF-2025-009', name: 'Samsung 4K Monitor 32"',     category: 'Monitors & Displays',   condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'Frank Moore',     dept: 'IT',           location: 'Desk C7'               },
  { id: 10, tag: 'AF-2025-010', name: 'Epson Projector EB-X51',     category: 'AV Equipment',          condition: 'GOOD',      status: 'AVAILABLE',      assignedTo: null,              dept: 'HR',           location: 'Conference Room A'     },
  { id: 11, tag: 'AF-2025-011', name: 'Dell PowerEdge Server R740', category: 'Servers & Storage',     condition: 'EXCELLENT', status: 'ALLOCATED',      assignedTo: 'IT Dept',         dept: 'IT',           location: 'Server Room 1'         },
  { id: 12, tag: 'AF-2025-012', name: 'Cisco Catalyst 9300 Switch', category: 'Network Equipment',     condition: 'EXCELLENT', status: 'ALLOCATED',      assignedTo: 'IT Dept',         dept: 'IT',           location: 'Network Closet 2F'     },
  { id: 13, tag: 'AF-2025-013', name: 'HP EliteBook 850 G9',        category: 'Laptops & Computers',   condition: 'NEW',       status: 'AVAILABLE',      assignedTo: null,              dept: 'Finance',      location: 'IT Store – Rack A3'    },
  { id: 14, tag: 'AF-2025-014', name: 'Ergonomic Standing Desk',    category: 'Office Furniture',      condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'Carol Davis',     dept: 'Finance',      location: 'Finance Floor 2A'      },
  { id: 15, tag: 'AF-2025-015', name: 'Sony WH-1000XM5 Headset',   category: 'Accessories',           condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'Grace Kim',       dept: 'R&D',          location: 'R&D Lab 5F'            },
  { id: 16, tag: 'AF-2025-016', name: 'Logitech MX Keys Keyboard',  category: 'Accessories',           condition: 'NEW',       status: 'AVAILABLE',      assignedTo: null,              dept: 'IT',           location: 'IT Store – Shelf B'    },
  { id: 17, tag: 'AF-2025-017', name: 'Surface Pro 9',              category: 'Laptops & Computers',   condition: 'EXCELLENT', status: 'ALLOCATED',      assignedTo: 'Eva Brown',       dept: 'Sales',        location: 'Sales Floor 4C'        },
  { id: 18, tag: 'AF-2025-018', name: 'Polycom Video Conf Unit',    category: 'AV Equipment',          condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'HR Dept',         dept: 'HR',           location: 'Boardroom 1F'          },
  { id: 19, tag: 'AF-2025-019', name: 'APC Smart UPS 3000VA',       category: 'Power Equipment',       condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'IT Dept',         dept: 'IT',           location: 'Server Room 1'         },
  { id: 20, tag: 'AF-2025-020', name: 'Samsung Galaxy Tab S9',      category: 'Mobile Devices',        condition: 'NEW',       status: 'AVAILABLE',      assignedTo: null,              dept: 'Sales',        location: 'Sales Cabinet'         },
  { id: 21, tag: 'AF-2025-021', name: 'Zebra ZT411 Label Printer',  category: 'Printing Equipment',    condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'Henry Wilson',    dept: 'Operations',   location: 'Warehouse Floor'       },
  { id: 22, tag: 'AF-2025-022', name: 'Forklift Crown FC 5000',     category: 'Heavy Equipment',       condition: 'FAIR',      status: 'IN_MAINTENANCE', assignedTo: null,              dept: 'Operations',   location: 'Warehouse Bay 3'       },
  { id: 23, tag: 'AF-2025-023', name: 'Lenovo IdeaCentre Desktop',  category: 'Laptops & Computers',   condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'James Taylor',    dept: 'Finance',      location: 'Finance Desk F3'       },
  { id: 24, tag: 'AF-2025-024', name: 'Canon EOS R5 Camera',        category: 'AV Equipment',          condition: 'EXCELLENT', status: 'AVAILABLE',      assignedTo: null,              dept: 'Sales',        location: 'Marketing Cupboard'    },
  { id: 25, tag: 'AF-2025-025', name: 'Whirlpool Water Dispenser',  category: 'Office Appliances',     condition: 'GOOD',      status: 'ALLOCATED',      assignedTo: 'Admin Dept',      dept: 'HR',           location: 'Pantry Area 2F'        },
];

const AssetDir = (() => {
  let state = { page: 1, pageSize: 10, search: '', category: '', status: '', dept: '', sort: 'tag', dir: 'asc', selected: new Set() };

  const getFiltered = () => {
    return DEMO_ASSETS.filter(a =>
      (!state.search || `${a.tag} ${a.name} ${a.assignedTo}`.toLowerCase().includes(state.search)) &&
      (!state.category || a.category === state.category) &&
      (!state.status || a.status === state.status) &&
      (!state.dept || a.dept === state.dept)
    ).sort((a, b) => {
      let valA = a[state.sort], valB = b[state.sort];
      if (valA < valB) return state.dir === 'asc' ? -1 : 1;
      if (valA > valB) return state.dir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const load = () => {
    const filtered = getFiltered();
    const slice = filtered.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    const tbody = document.getElementById('asset-tbody');

    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📋</div><h3>No assets found</h3></div></td></tr>`;
    } else {
      tbody.innerHTML = slice.map(a => `
        <tr class="animate-fade-up">
          <td class="table-checkbox"><input type="checkbox" class="row-check" value="${a.id}" ${state.selected.has(String(a.id)) ? 'checked' : ''}></td>
          <td style="font-family:var(--font-mono);font-size:.875rem;font-weight:600"><a href="details.html?id=${a.id}">${a.tag}</a></td>
          <td><div style="font-weight:600">${a.name}</div></td>
          <td style="font-size:.8125rem;color:var(--text-secondary)">${a.category}</td>
          <td><span class="badge badge-neutral">${a.condition}</span></td>
          <td>
            ${a.assignedTo ? `<div style="font-weight:500">${a.assignedTo}</div>` : `<span style="color:var(--text-muted)">Unassigned</span>`}
            <div style="font-size:.75rem;color:var(--text-muted)">${a.location}</div>
          </td>
          <td>${Utils.statusBadge(a.status)}</td>
          <td>
            <div style="display:flex;gap:.375rem">
              <a href="details.html?id=${a.id}" class="btn btn-ghost btn-icon btn-sm" title="View Details">👁️</a>
              ${a.status === 'AVAILABLE' ? `<button class="btn btn-ghost btn-icon btn-sm" title="Allocate" onclick="AssetDir.quickAllocate(${a.id})">🔗</button>` : ''}
              ${a.status === 'ALLOCATED' ? `<button class="btn btn-ghost btn-icon btn-sm" title="Return" onclick="AssetDir.quickReturn(${a.id})">↩️</button>` : ''}
            </div>
          </td>
        </tr>
      `).join('');
    }

    Utils.renderPagination(document.getElementById('asset-pagination'), {
      page: state.page, totalPages: Math.ceil(filtered.length / state.pageSize),
      total: filtered.length, pageSize: state.pageSize,
      onPageChange: (p) => { state.page = p; load(); }
    });

    updateBulkBar();
    attachCheckListeners();
  };

  const populateFilters = () => {
    const cats = [...new Set(DEMO_ASSETS.map(a => a.category))];
    const depts = [...new Set(DEMO_ASSETS.map(a => a.dept))];
    const catSel = document.getElementById('category-filter');
    const deptSel = document.getElementById('dept-filter');
    catSel.innerHTML += cats.map(c => `<option value="${c}">${c}</option>`).join('');
    deptSel.innerHTML += depts.map(d => `<option value="${d}">${d}</option>`).join('');
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

  // Quick Actions (Mocked)
  const quickAllocate = (id) => {
    const a = DEMO_ASSETS.find(x => x.id === id);
    document.getElementById('qa-title').textContent = '🔗 Allocate Asset';
    document.getElementById('qa-body').innerHTML = `
      <div style="margin-bottom:1rem">Allocating <strong>${a.tag} - ${a.name}</strong></div>
      <div class="form-group"><label class="form-label">Assign To</label><select class="form-control"><option>Alice Johnson</option><option>Bob Smith</option></select></div>
    `;
    document.getElementById('qa-confirm-btn').onclick = () => {
      Utils.Toast.success('Allocated', `${a.tag} assigned successfully.`);
      Utils.closeModal('quick-action-modal');
      a.status = 'ALLOCATED'; a.assignedTo = 'Alice Johnson'; load();
    };
    Utils.openModal('quick-action-modal');
  };

  const quickReturn = (id) => {
    const a = DEMO_ASSETS.find(x => x.id === id);
    document.getElementById('qa-title').textContent = '↩️ Return Asset';
    document.getElementById('qa-body').innerHTML = `
      <div style="margin-bottom:1rem">Returning <strong>${a.tag}</strong> from <strong>${a.assignedTo}</strong></div>
      <div class="form-group"><label class="form-label">Return Condition</label><select class="form-control"><option>Good</option><option>Fair</option><option>Damaged</option></select></div>
    `;
    document.getElementById('qa-confirm-btn').onclick = () => {
      Utils.Toast.success('Returned', `${a.tag} returned successfully.`);
      Utils.closeModal('quick-action-modal');
      a.status = 'AVAILABLE'; a.assignedTo = null; load();
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

/* Maintenance JS */
const DEMO_MAINT = [
  { id:1,  ticketId:'MNT-1001', tag:'AF-2025-004', assetName:'iPhone 14 Pro',              type:'HARDWARE',   reportedBy:'Alice Johnson', dept:'IT',         date:'2025-06-28', cost:4500,  priority:'HIGH',   status:'IN_PROGRESS', desc:'Screen cracked, battery drain issue. Sent to authorized service center.' },
  { id:2,  ticketId:'MNT-1002', tag:'AF-2025-006', assetName:'HP LaserJet Pro MFP',        type:'ROUTINE',    reportedBy:'IT Admin',       dept:'Operations', date:'2025-06-15', cost:1200,  priority:'LOW',    status:'COMPLETED',  desc:'Annual servicing and toner cartridge replacement completed.' },
  { id:3,  ticketId:'MNT-1003', tag:'AF-2025-001', assetName:'Dell Latitude 7420',         type:'SOFTWARE',   reportedBy:'Bob Smith',      dept:'IT',         date:'2025-07-08', cost:0,     priority:'MEDIUM', status:'PENDING',    desc:'OS reinstallation needed after ransomware detection. Awaiting approval.' },
  { id:4,  ticketId:'MNT-1004', tag:'AF-2025-022', assetName:'Forklift Crown FC 5000',     type:'HARDWARE',   reportedBy:'Henry Wilson',   dept:'Operations', date:'2025-07-12', cost:18500, priority:'HIGH',   status:'PENDING',    desc:'Hydraulic lift failure. Machine grounded pending vendor inspection.' },
  { id:5,  ticketId:'MNT-1005', tag:'AF-2025-005', assetName:'Cisco ASR 1001-X Router',   type:'PREVENTIVE', reportedBy:'Irene Clark',    dept:'IT',         date:'2025-07-08', cost:3200,  priority:'MEDIUM', status:'APPROVED',   desc:'Scheduled firmware upgrade and config backup. Network downtime: 2hrs.' },
  { id:6,  ticketId:'MNT-1006', tag:'AF-2025-023', assetName:'Lenovo IdeaCentre Desktop',  type:'SOFTWARE',   reportedBy:'Carol Davis',    dept:'Finance',    date:'2025-07-10', cost:0,     priority:'LOW',    status:'IN_PROGRESS',desc:'Windows activation failure after hardware swap. IT team investigating.' },
  { id:7,  ticketId:'MNT-1007', tag:'AF-2025-011', assetName:'Dell PowerEdge Server R740', type:'HARDWARE',   reportedBy:'Frank Moore',    dept:'IT',         date:'2025-07-01', cost:9800,  priority:'CRITICAL',status:'COMPLETED',  desc:'RAID array rebuild after drive failure. Data restored from backup. Downtime: 6hrs.' },
  { id:8,  ticketId:'MNT-1008', tag:'AF-2025-018', assetName:'Polycom Video Conf Unit',    type:'ROUTINE',    reportedBy:'HR Admin',       dept:'HR',         date:'2025-06-20', cost:800,   priority:'LOW',    status:'COMPLETED',  desc:'Annual calibration and software update for Polycom RealPresence system.' },
];

const MaintPage = (() => {
  let state = { status:'', priority:'' };

  const priorityBadge = (p) => {
    const map = { CRITICAL:'badge-danger', HIGH:'badge-warning', MEDIUM:'badge-primary', LOW:'badge-neutral' };
    return `<span class="badge ${map[p]||'badge-neutral'}">${p}</span>`;
  };

  const load = () => {
    const filtered = DEMO_MAINT.filter(m => 
      (!state.status   || m.status   === state.status) &&
      (!state.priority || m.priority === state.priority)
    );
    const tbody = document.getElementById('maint-tbody');
    
    if(!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">No maintenance records found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(m => `
      <tr class="animate-fade-up">
        <td class="font-mono" style="font-weight:600">${m.ticketId}</td>
        <td>
          <div style="font-weight:600">${m.assetName}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${m.tag} · ${m.dept}</div>
        </td>
        <td><span class="badge badge-neutral">${m.type}</span></td>
        <td>${priorityBadge(m.priority)}</td>
        <td>
          <div style="font-weight:500">${m.reportedBy}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${Utils.Format.date(m.date)}</div>
        </td>
        <td>${m.cost > 0 ? Utils.Format.currency(m.cost) : '<span style="color:var(--text-muted)">Free</span>'}</td>
        <td>${Utils.statusBadge(m.status)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="MaintPage.updateStatus(${m.id})">Update</button>
          <button class="btn btn-ghost btn-sm" onclick="MaintPage.viewDetails(${m.id})" title="View">👁️</button>
        </td>
      </tr>
    `).join('');

    // Update summary stats
    const el = (id) => document.getElementById(id);
    if(el('stat-pending'))   el('stat-pending').textContent   = DEMO_MAINT.filter(m=>m.status==='PENDING').length;
    if(el('stat-progress'))  el('stat-progress').textContent  = DEMO_MAINT.filter(m=>m.status==='IN_PROGRESS').length;
    if(el('stat-completed')) el('stat-completed').textContent = DEMO_MAINT.filter(m=>m.status==='COMPLETED').length;
    if(el('stat-maint-cost')) {
      const totalCost = DEMO_MAINT.filter(m=>m.status==='COMPLETED').reduce((a,m)=>a+m.cost,0);
      el('stat-maint-cost').textContent = Utils.Format.currency(totalCost);
    }
  };

  const openAdd = () => {
    document.getElementById('maint-asset').value = '';
    document.getElementById('maint-type').value = 'HARDWARE';
    document.getElementById('maint-desc').value = '';
    document.getElementById('maint-cost').value = '';
    Utils.openModal('maint-modal');
  };

  const save = () => {
    if(!Utils.validateForm({'maint-asset':{required:true}, 'maint-desc':{required:true}})) return;
    const newId = DEMO_MAINT.length + 1;
    DEMO_MAINT.unshift({
      id: newId, ticketId:`MNT-${1000+newId}`,
      tag: document.getElementById('maint-asset').value,
      assetName: document.getElementById('maint-asset').value,
      type: document.getElementById('maint-type').value,
      reportedBy: 'Current User', dept: 'IT',
      date: new Date().toISOString().split('T')[0],
      cost: parseFloat(document.getElementById('maint-cost').value)||0,
      priority:'MEDIUM', status:'PENDING',
      desc: document.getElementById('maint-desc').value,
    });
    Utils.Toast.success('Submitted', 'Maintenance ticket created successfully.');
    Utils.closeModal('maint-modal');
    load();
  };

  const updateStatus = (id) => {
    const m = DEMO_MAINT.find(x => x.id === id);
    if(!m) return;
    const cycle = { 'PENDING':'APPROVED', 'APPROVED':'IN_PROGRESS', 'IN_PROGRESS':'COMPLETED', 'COMPLETED':'COMPLETED' };
    if(m.status === 'COMPLETED') { Utils.Toast.info('Info', 'Ticket is already completed.'); return; }
    Utils.confirmDialog('Update Status', `Mark ticket ${m.ticketId} as ${cycle[m.status].replace('_', ' ')}?`, () => {
      m.status = cycle[m.status];
      Utils.Toast.success('Updated', 'Ticket status updated.');
      load();
    });
  };

  const viewDetails = (id) => {
    const m = DEMO_MAINT.find(x => x.id === id);
    if(!m) return;
    const body = `
      <div class="info-grid" style="margin-bottom:1rem">
        <div class="info-item"><div class="info-label">Ticket ID</div><div class="info-value font-mono">${m.ticketId}</div></div>
        <div class="info-item"><div class="info-label">Asset</div><div class="info-value">${m.assetName} (${m.tag})</div></div>
        <div class="info-item"><div class="info-label">Type</div><div class="info-value">${m.type}</div></div>
        <div class="info-item"><div class="info-label">Priority</div><div class="info-value">${m.priority}</div></div>
        <div class="info-item"><div class="info-label">Reported By</div><div class="info-value">${m.reportedBy}</div></div>
        <div class="info-item"><div class="info-label">Date Reported</div><div class="info-value">${Utils.Format.date(m.date)}</div></div>
        <div class="info-item"><div class="info-label">Est. Cost</div><div class="info-value">${m.cost > 0 ? Utils.Format.currency(m.cost) : 'No cost'}</div></div>
        <div class="info-item"><div class="info-label">Status</div><div class="info-value">${Utils.statusBadge(m.status)}</div></div>
      </div>
      <div class="form-group"><label class="form-label">Description / Notes</label>
        <p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${m.desc}</p></div>
    `;
    document.getElementById('qa-title').textContent = `🔧 ${m.ticketId} – Maintenance Details`;
    document.getElementById('qa-body').innerHTML = body;
    document.getElementById('qa-confirm-btn').style.display = 'none';
    Utils.openModal('quick-action-modal');
  };

  return { load, openAdd, save, updateStatus, viewDetails, state };
})();

window.openMaintModal = () => MaintPage.openAdd();
window.saveMaint = () => MaintPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  MaintPage.load();
  const sf = document.getElementById('status-filter');
  if(sf) sf.addEventListener('change', e => { MaintPage.state.status = e.target.value; MaintPage.load(); });
});

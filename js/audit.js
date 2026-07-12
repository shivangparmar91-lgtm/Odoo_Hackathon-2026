/* Audit JS */
const DEMO_AUDITS = [
  {
    id:1, name:'Q1 2025 Full Enterprise Audit',   scope:'ALL',        auditor:'Alice Johnson',
    start:'2025-01-15', end:'2025-01-28', totalAssets:348, verified:341, discrepancies:7,
    progress:100, status:'COMPLETED',
    notes:'7 discrepancies found – 3 resolved, 4 pending write-off approval.'
  },
  {
    id:2, name:'IT Hardware Mid-Year Check',       scope:'IT',         auditor:'Admin',
    start:'2025-03-01', end:'2025-03-08', totalAssets:95, verified:83, discrepancies:4,
    progress:87, status:'IN_PROGRESS',
    notes:'Remaining 12 assets in remote/WFH locations yet to be physically verified.'
  },
  {
    id:3, name:'Q2 2025 General Audit',            scope:'ALL',        auditor:'Alice Johnson',
    start:'2025-04-15', end:'2025-04-30', totalAssets:352, verified:346, discrepancies:6,
    progress:100, status:'COMPLETED',
    notes:'Audit completed with 98.2% accuracy. 6 discrepancies documented.'
  },
  {
    id:4, name:'Operations Warehouse Spot Check',  scope:'Operations', auditor:'David Lee',
    start:'2025-05-20', end:'2025-05-22', totalAssets:112, verified:112, discrepancies:0,
    progress:100, status:'COMPLETED',
    notes:'Clean audit. All 112 assets accounted for in correct locations.'
  },
  {
    id:5, name:'Finance Dept Assets Verification', scope:'Finance',    auditor:'Carol Davis',
    start:'2025-06-10', end:null, totalAssets:58, verified:32, discrepancies:2,
    progress:55, status:'IN_PROGRESS',
    notes:'On-site verification in progress. 26 assets remaining across 3 floors.'
  },
  {
    id:6, name:'Q3 2025 R&D Department Audit',     scope:'R&D',        auditor:'Grace Kim',
    start:'2025-07-11', end:null, totalAssets:88, verified:0, discrepancies:0,
    progress:0, status:'PENDING',
    notes:'Audit cycle initiated. Team assembling for kick-off on 12 Jul 2025.'
  },
];

const AuditPage = (() => {
  const load = () => {
    const tbody = document.getElementById('audit-tbody');
    if(!DEMO_AUDITS.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No audits found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = DEMO_AUDITS.map(a => `
      <tr class="animate-fade-up">
        <td>
          <div style="font-weight:600">${a.name}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${a.notes}</div>
        </td>
        <td><span class="badge badge-neutral">${a.scope}</span></td>
        <td style="font-weight:500">${a.auditor}</td>
        <td style="font-size:.8125rem">${Utils.Format.date(a.start)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem">
            <div style="flex:1;height:8px;background:var(--bg-elevated);border-radius:4px;overflow:hidden;min-width:80px">
              <div style="height:100%;width:${a.progress}%;background:${a.progress===100?'var(--success)':'var(--primary)'};transition:width .6s ease"></div>
            </div>
            <span style="font-size:.75rem;font-weight:600;min-width:30px">${a.progress}%</span>
          </div>
          <div style="font-size:.7rem;color:var(--text-muted);margin-top:2px">${a.verified}/${a.totalAssets} verified · ${a.discrepancies} gap${a.discrepancies!==1?'s':''}</div>
        </td>
        <td>${Utils.statusBadge(a.status)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="AuditPage.view(${a.id})">View</button>
          ${a.status==='PENDING' ? `<button class="btn btn-ghost btn-sm" onclick="AuditPage.startAudit(${a.id})">Start</button>` : ''}
        </td>
      </tr>
    `).join('');

    // Stats
    const el = (id) => document.getElementById(id);
    if(el('stat-aud-total'))     el('stat-aud-total').textContent     = DEMO_AUDITS.length;
    if(el('stat-aud-completed')) el('stat-aud-completed').textContent = DEMO_AUDITS.filter(a=>a.status==='COMPLETED').length;
    if(el('stat-aud-progress'))  el('stat-aud-progress').textContent  = DEMO_AUDITS.filter(a=>a.status==='IN_PROGRESS').length;
    if(el('stat-aud-pending'))   el('stat-aud-pending').textContent   = DEMO_AUDITS.filter(a=>a.status==='PENDING').length;
  };

  const view = (id) => {
    const a = DEMO_AUDITS.find(x => x.id === id);
    if(!a) return;
    const bodyEl = document.getElementById('qa-body');
    if(!bodyEl) return;
    document.getElementById('qa-title').textContent = `🔍 ${a.name}`;
    bodyEl.innerHTML = `
      <div class="info-grid" style="margin-bottom:1rem">
        <div class="info-item"><div class="info-label">Scope</div><div class="info-value">${a.scope}</div></div>
        <div class="info-item"><div class="info-label">Auditor</div><div class="info-value">${a.auditor}</div></div>
        <div class="info-item"><div class="info-label">Start Date</div><div class="info-value">${Utils.Format.date(a.start)}</div></div>
        <div class="info-item"><div class="info-label">End Date</div><div class="info-value">${a.end ? Utils.Format.date(a.end) : 'In Progress'}</div></div>
        <div class="info-item"><div class="info-label">Total Assets</div><div class="info-value" style="font-size:1.25rem;font-weight:700">${a.totalAssets}</div></div>
        <div class="info-item"><div class="info-label">Verified</div><div class="info-value" style="font-size:1.25rem;font-weight:700;color:var(--success)">${a.verified}</div></div>
        <div class="info-item"><div class="info-label">Discrepancies</div><div class="info-value" style="font-size:1.25rem;font-weight:700;color:var(--danger)">${a.discrepancies}</div></div>
        <div class="info-item"><div class="info-label">Progress</div><div class="info-value">${a.progress}%</div></div>
      </div>
      <div class="form-group"><label class="form-label">Audit Notes</label>
        <p style="color:var(--text-secondary);font-size:.9375rem;line-height:1.6">${a.notes}</p></div>
    `;
    document.getElementById('qa-confirm-btn').style.display = 'none';
    Utils.openModal('quick-action-modal');
  };

  const startAudit = (id) => {
    const a = DEMO_AUDITS.find(x => x.id === id);
    if(!a) return;
    Utils.confirmDialog('Start Audit', `Begin audit cycle "${a.name}"?`, () => {
      a.status = 'IN_PROGRESS';
      Utils.Toast.success('Audit Started', `${a.name} is now in progress.`);
      load();
    });
  };

  const openAdd = () => {
    const fields = ['audit-name','audit-dept'];
    fields.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    Utils.openModal('audit-modal');
  };

  const save = () => {
    if(!Utils.validateForm({'audit-name':{required:true}})) return;
    Utils.Toast.success('Started', 'Audit cycle started successfully.');
    Utils.closeModal('audit-modal');
    load();
  };

  return { load, openAdd, save, view, startAudit };
})();

window.openAuditModal = () => AuditPage.openAdd();
window.saveAudit = () => AuditPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  AuditPage.load();
});

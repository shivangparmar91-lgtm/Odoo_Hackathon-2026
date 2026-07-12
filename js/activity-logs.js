/* Activity Logs JS */
const DEMO_LOGS = [
  { timestamp:'2025-07-12T04:52:00Z', user:'Admin',          action:'CREATE',         module:'ASSETS',       details:'Registered new asset AF-2025-025 – Whirlpool Water Dispenser' },
  { timestamp:'2025-07-12T04:30:00Z', user:'Alice Johnson',  action:'ALLOCATE',       module:'ASSETS',       details:'Allocated AF-2025-017 (Surface Pro 9) to Eva Brown – Sales Dept' },
  { timestamp:'2025-07-12T03:58:00Z', user:'Admin',          action:'APPROVE',        module:'MAINTENANCE',  details:'Approved maintenance ticket MNT-1006 for Forklift Crown FC 5000' },
  { timestamp:'2025-07-12T03:15:00Z', user:'Henry Wilson',   action:'REPORT_ISSUE',   module:'MAINTENANCE',  details:'Reported hardware issue for AF-2025-022 (Forklift Crown FC 5000)' },
  { timestamp:'2025-07-11T14:40:00Z', user:'Bob Smith',      action:'BOOK',           module:'BOOKINGS',     details:'Booked Conference Room A for Board Meeting – 12 Jul 09:00-11:00' },
  { timestamp:'2025-07-11T13:22:00Z', user:'Alice Johnson',  action:'RETURN',         module:'ASSETS',       details:'AF-2025-009 (Samsung 4K Monitor) returned by Frank Moore in GOOD condition' },
  { timestamp:'2025-07-11T11:55:00Z', user:'Admin',          action:'TRANSFER',       module:'TRANSFERS',    details:'Transfer TRF-00148 approved – AF-2025-013 moved from IT to Finance Dept' },
  { timestamp:'2025-07-11T10:10:00Z', user:'Admin',          action:'CREATE',         module:'EMPLOYEES',    details:'Added new employee Priya Sharma (EMP-011) to R&D Department' },
  { timestamp:'2025-07-11T09:30:00Z', user:'Grace Kim',      action:'AUDIT_START',    module:'AUDIT',        details:'Started audit cycle Q3-2025 for R&D Department – 88 assets in scope' },
  { timestamp:'2025-07-10T16:45:00Z', user:'Admin',          action:'UPDATE',         module:'DEPARTMENTS',  details:'Updated department head for Legal & Compliance to Frank Moore' },
  { timestamp:'2025-07-10T15:30:00Z', user:'Carol Davis',    action:'REPORT_ISSUE',   module:'MAINTENANCE',  details:'Reported software issue for AF-2025-023 (Lenovo IdeaCentre Desktop)' },
  { timestamp:'2025-07-10T14:00:00Z', user:'Admin',          action:'COMPLETE',       module:'MAINTENANCE',  details:'Maintenance ticket MNT-1002 (HP LaserJet MFP) marked COMPLETED – Cost: Rs.1,200' },
  { timestamp:'2025-07-10T11:20:00Z', user:'Alice Johnson',  action:'ALLOCATE',       module:'ASSETS',       details:'Allocated AF-2025-016 (Logitech MX Keys) to Irene Clark – IT Dept' },
  { timestamp:'2025-07-09T17:00:00Z', user:'Eva Brown',      action:'BOOK',           module:'BOOKINGS',     details:'Booked Epson Projector EB-X51 for Product Demo – 10 Jul 14:00-16:00' },
  { timestamp:'2025-07-09T15:45:00Z', user:'Admin',          action:'RETIRE',         module:'ASSETS',       details:'Asset AF-2025-006 (HP LaserJet Pro MFP) marked as RETIRED – Poor condition' },
  { timestamp:'2025-07-09T14:00:00Z', user:'David Lee',      action:'CREATE',         module:'ASSETS',       details:'Registered new asset AF-2025-021 – Zebra ZT411 Label Printer for Warehouse' },
  { timestamp:'2025-07-09T11:30:00Z', user:'Admin',          action:'AUDIT_COMPLETE', module:'AUDIT',        details:'Audit cycle Q2-2025 completed – 98.2% accuracy, 2 discrepancies found' },
  { timestamp:'2025-07-08T16:15:00Z', user:'Irene Clark',    action:'REPORT_ISSUE',   module:'MAINTENANCE',  details:'Reported network issue for AF-2025-005 (Cisco ASR 1001-X Router)' },
  { timestamp:'2025-07-08T10:45:00Z', user:'Admin',          action:'UPDATE',         module:'SETTINGS',     details:'Updated password policy: minimum length increased from 6 to 8 characters' },
  { timestamp:'2025-07-07T09:00:00Z', user:'Alice Johnson',  action:'CREATE',         module:'ASSETS',       details:'Batch registration of 5 new assets (AF-2025-020 to AF-2025-024) in IT & Sales' },
  { timestamp:'2025-07-06T14:30:00Z', user:'Admin',          action:'ALLOCATE',       module:'ASSETS',       details:'Allocated AF-2025-019 (APC Smart UPS 3000VA) to IT Dept – Server Room 1' },
  { timestamp:'2025-07-05T11:00:00Z', user:'Frank Moore',    action:'BOOK',           module:'BOOKINGS',     details:'Booked Polycom Video Conf Unit for Legal Briefing – 6 Jul 15:00-16:30' },
  { timestamp:'2025-07-04T09:45:00Z', user:'Admin',          action:'CREATE',         module:'DEPARTMENTS',  details:'Created new department: Procurement (PROC-001) under Operations' },
  { timestamp:'2025-07-03T16:00:00Z', user:'David Lee',      action:'TRANSFER',       module:'TRANSFERS',    details:'Transfer TRF-00147 raised – AF-2025-007 requested from Operations to IT' },
];

const LogsPage = (() => {
  let state = { search:'' };

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'badge-success', 'ALLOCATE': 'badge-primary', 'RETURN': 'badge-primary',
      'APPROVE': 'badge-success', 'COMPLETE': 'badge-success', 'AUDIT_COMPLETE': 'badge-success',
      'REPORT_ISSUE': 'badge-warning', 'TRANSFER': 'badge-primary', 'BOOK': 'badge-primary',
      'RETIRE': 'badge-danger', 'UPDATE': 'badge-neutral', 'AUDIT_START': 'badge-primary',
    };
    return colors[action] || 'badge-neutral';
  };

  const load = () => {
    const filtered = DEMO_LOGS.filter(l => 
      !state.search || `${l.user} ${l.action} ${l.module} ${l.details}`.toLowerCase().includes(state.search)
    );
    const tbody = document.getElementById('log-tbody');
    
    if(!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No logs found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(l => `
      <tr class="animate-fade-up">
        <td class="font-mono" style="font-size:.8125rem">${Utils.Format.datetime(l.timestamp)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem">
            ${Utils.avatarHtml ? Utils.avatarHtml(l.user, 'sm') : ''}
            <span style="font-weight:600">${l.user}</span>
          </div>
        </td>
        <td><span class="badge ${getActionColor(l.action)}">${l.action.replace('_',' ')}</span></td>
        <td><span style="font-size:.8125rem;color:var(--text-secondary)">${l.module}</span></td>
        <td style="font-size:.875rem;color:var(--text-secondary)">${l.details}</td>
      </tr>
    `).join('');
  };

  return { load, state };
})();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  LogsPage.load();
  Utils.setupSearch('log-search', q => { LogsPage.state.search = q.toLowerCase(); LogsPage.load(); });
});

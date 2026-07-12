/* Asset Details JS */
const DEMO_ASSET = {
  id: 1, tag: 'AF-2025-001', name: 'Dell Latitude 7420', category: 'Laptops & Computers',
  brand: 'Dell', model: 'Latitude 7420', serialNo: 'SN-DLAT7420-49827419A',
  condition: 'EXCELLENT', status: 'ALLOCATED', assignedTo: 'Alice Johnson', location: 'Remote / WFH', dept: 'Information Technology',
  purchaseDate: '2023-05-15', purchaseCost: 85000, vendor: 'TechSupplies India Pvt. Ltd.', invoiceNo: 'INV-2023-9921',
  warrantyStart: '2023-05-15', warrantyEnd: '2026-05-15', usefulLife: 5, salvageValue: 8500,
  description: 'Intel Core i7-1185G7 · 16GB DDR4 RAM · 512GB NVMe SSD · 14" FHD IPS · Win 11 Pro',
  maintenanceHistory: [
    { date:'2025-07-08', type:'SOFTWARE', ticket:'MNT-1003', technician:'Bob Smith',    cost:0,    status:'PENDING',   desc:'OS reinstallation – ransomware detected. Awaiting approval.' },
    { date:'2024-11-12', type:'ROUTINE',  ticket:'MNT-0891', technician:'IT Admin',     cost:1200, status:'COMPLETED', desc:'Annual service – cleaned thermal paste, updated BIOS & drivers.' },
    { date:'2024-03-18', type:'HARDWARE', ticket:'MNT-0612', technician:'Dell Support', cost:3800, status:'COMPLETED', desc:'Screen hinge replaced under warranty. No charge to department.' },
  ],
  timeline: [
    { date: '2025-07-08T09:00:00Z', type: 'MAINTENANCE', title: 'Maintenance Request Raised',   desc: 'Software issue reported by Bob Smith. Ticket MNT-1003 created.',          status: 'warning' },
    { date: '2024-11-12T10:00:00Z', type: 'MAINTENANCE', title: 'Annual Routine Service',         desc: 'Cleaned cooling system, updated BIOS. Battery health 94%. All clear.',  status: 'success' },
    { date: '2024-01-10T10:00:00Z', type: 'ALLOCATION',  title: 'Allocated to Alice Johnson',    desc: 'Assigned for remote work setup. Courier dispatched to employee address.',  status: 'primary' },
    { date: '2023-11-05T14:30:00Z', type: 'MAINTENANCE', title: 'Screen Hinge Replacement',      desc: 'Hinge defect under warranty. Dell on-site repair – 2 hours.',             status: 'success' },
    { date: '2023-05-20T09:15:00Z', type: 'REGISTRATION', title: 'Asset Registered',             desc: 'Added to inventory by Admin. Linked to IT Dept, Purchase Order PO-9921.', status: 'neutral' },
  ]
};

const AssetDetails = (() => {
  const urlParams = new URLSearchParams(window.location.search);
  const assetId = urlParams.get('id') || 1;

  const load = () => {
    // In real app, fetch by assetId
    const a = DEMO_ASSET;

    document.title = `${a.tag} - AssetFlow`;
    document.getElementById('header-tag').textContent = a.tag;
    document.getElementById('asset-name').textContent = a.name;
    document.getElementById('asset-cat').innerHTML = `${a.brand} ${a.model} &bull; ${a.category}${a.description ? ` &bull; <span style="color:var(--text-muted);font-size:.875rem">${a.description}</span>` : ''}`;
    document.getElementById('asset-status-badge').innerHTML = Utils.statusBadge(a.status);

    document.getElementById('val-tag').textContent = a.tag;
    document.getElementById('val-serial').textContent = a.serialNo || '—';
    document.getElementById('val-brand').textContent = `${a.brand || '—'} / ${a.model || '—'}`;
    document.getElementById('val-loc').textContent = a.location || '—';
    document.getElementById('val-assignee').textContent = a.assignedTo || 'Unassigned';
    document.getElementById('val-cond').textContent = a.condition;

    document.getElementById('qr-tag').textContent = a.tag;

    // Financial
    document.getElementById('val-pur-date').textContent = Utils.Format.date(a.purchaseDate);
    document.getElementById('val-cost').textContent = Utils.Format.currency(a.purchaseCost);

    // Simple depreciation mock: 20% per year
    const yrs = (Date.now() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const curVal = Math.max(a.salvageValue, a.purchaseCost - (a.purchaseCost * 0.2 * yrs));
    document.getElementById('val-cur-cost').textContent = Utils.Format.currency(curVal);

    document.getElementById('val-vendor').textContent = a.vendor || '—';
    document.getElementById('val-inv').textContent = a.invoiceNo || '—';
    document.getElementById('val-dept').textContent = a.dept || '—';

    const wEnd = new Date(a.warrantyEnd);
    const wValid = wEnd > new Date();
    document.getElementById('val-war-stat').innerHTML = wValid ? `<span class="badge badge-success">Active</span>` : `<span class="badge badge-danger">Expired</span>`;
    document.getElementById('val-war-end').textContent = Utils.Format.date(a.warrantyEnd);
    document.getElementById('val-life').textContent = `${a.usefulLife} Years`;

    // Timeline
    const tl = document.getElementById('asset-timeline');
    if(tl) tl.innerHTML = a.timeline.map(t => `
      <div class="timeline-item">
        <div class="timeline-dot ${t.status}">${t.type === 'ALLOCATION' ? '🔗' : t.type === 'MAINTENANCE' ? '🔧' : '📝'}</div>
        <div class="timeline-content">
          <div class="timeline-title">${t.title}</div>
          <div class="timeline-meta">${Utils.Format.datetime(t.date)}</div>
          <div class="timeline-desc">${t.desc}</div>
        </div>
      </div>
    `).join('');

    // Maintenance history table
    const maintTbody = document.getElementById('maint-tbody');
    if(maintTbody && a.maintenanceHistory && a.maintenanceHistory.length) {
      maintTbody.innerHTML = a.maintenanceHistory.map(m => `
        <tr>
          <td class="font-mono" style="font-size:.8125rem">${Utils.Format.date(m.date)}</td>
          <td><span class="badge badge-neutral">${m.type}</span></td>
          <td>${m.technician}</td>
          <td>${m.cost > 0 ? Utils.Format.currency(m.cost) : '<span style="color:var(--text-muted)">Free</span>'}</td>
          <td>${Utils.statusBadge(m.status)}</td>
        </tr>
      `).join('');
    }
  };


  const openEdit = () => {
    window.location.href = `registration.html?edit=${assetId}`;
  };

  return { load, openEdit };
})();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  AssetDetails.load();
});

/* Asset Details JS */
  const urlParams = new URLSearchParams(window.location.search);
  const assetId = urlParams.get('id');

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const canManage = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER');

  const load = async () => {
    if (!assetId) {
      Utils.Toast.error('Error', 'No asset ID provided');
      return;
    }

    try {
      const a = await API.assets.getById(assetId);

      document.title = `${a.tag} - AssetFlow`;
      document.getElementById('header-tag').textContent = Utils.escapeHtml(a.tag || '');
      document.getElementById('asset-name').textContent = Utils.escapeHtml(a.name || '');
      document.getElementById('asset-cat').innerHTML = `${Utils.escapeHtml(a.brand || '')} ${Utils.escapeHtml(a.model || '')} &bull; ${Utils.escapeHtml(a.category || '')}${a.description ? ` &bull; <span style="color:var(--text-muted);font-size:.875rem">${Utils.escapeHtml(a.description)}</span>` : ''}`;
      document.getElementById('asset-status-badge').innerHTML = Utils.statusBadge(a.status);

      document.getElementById('val-tag').textContent = Utils.escapeHtml(a.tag || '');
      document.getElementById('val-serial').textContent = Utils.escapeHtml(a.serialNo || '—');
      document.getElementById('val-brand').textContent = `${Utils.escapeHtml(a.brand || '—')} / ${Utils.escapeHtml(a.model || '—')}`;
      document.getElementById('val-loc').textContent = Utils.escapeHtml(a.location || '—');
      document.getElementById('val-assignee').textContent = Utils.escapeHtml(a.assignedTo || 'Unassigned');
      document.getElementById('val-cond').textContent = Utils.escapeHtml(a.condition || '');

      document.getElementById('qr-tag').textContent = Utils.escapeHtml(a.tag || '');

      // Financial
      document.getElementById('val-pur-date').textContent = Utils.Format.date(a.purchaseDate);
      document.getElementById('val-cost').textContent = Utils.Format.currency(a.purchaseCost || 0);

      // Simple depreciation mock: 20% per year
      const yrs = a.purchaseDate ? (Date.now() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;
      const curVal = Math.max(a.salvageValue || 0, (a.purchaseCost || 0) - ((a.purchaseCost || 0) * 0.2 * yrs));
      document.getElementById('val-cur-cost').textContent = Utils.Format.currency(curVal);

      document.getElementById('val-vendor').textContent = Utils.escapeHtml(a.vendor || '—');
      document.getElementById('val-inv').textContent = Utils.escapeHtml(a.invoiceNo || '—');
      document.getElementById('val-dept').textContent = Utils.escapeHtml(a.dept || '—');

      const wEnd = a.warrantyEnd ? new Date(a.warrantyEnd) : new Date(0);
      const wValid = wEnd > new Date();
      document.getElementById('val-war-stat').innerHTML = wValid ? `<span class="badge badge-success">Active</span>` : `<span class="badge badge-danger">Expired</span>`;
      document.getElementById('val-war-end').textContent = Utils.Format.date(a.warrantyEnd);
      document.getElementById('val-life').textContent = `${a.usefulLife || 0} Years`;

      // Timeline
      const tl = document.getElementById('asset-timeline');
      if(tl && a.timeline) {
        tl.innerHTML = a.timeline.map(t => `
          <div class="timeline-item">
            <div class="timeline-dot ${t.status}">${t.type === 'ALLOCATION' ? '🔗' : t.type === 'MAINTENANCE' ? '🔧' : '📝'}</div>
            <div class="timeline-content">
              <div class="timeline-title">${Utils.escapeHtml(t.title)}</div>
              <div class="timeline-meta">${Utils.Format.datetime(t.date)}</div>
              <div class="timeline-desc">${Utils.escapeHtml(t.desc)}</div>
            </div>
          </div>
        `).join('');
      } else if(tl) tl.innerHTML = '<div class="timeline-desc">No timeline events found.</div>';

      // Maintenance history table
      const maintTbody = document.getElementById('maint-tbody');
      if(maintTbody && a.maintenanceHistory && a.maintenanceHistory.length) {
        maintTbody.innerHTML = a.maintenanceHistory.map(m => `
          <tr>
            <td class="font-mono" style="font-size:.8125rem">${Utils.Format.date(m.date)}</td>
            <td><span class="badge badge-neutral">${Utils.escapeHtml(m.type)}</span></td>
            <td>${Utils.escapeHtml(m.technician)}</td>
            <td>${m.cost > 0 ? Utils.Format.currency(m.cost) : '<span style="color:var(--text-muted)">Free</span>'}</td>
            <td>${Utils.statusBadge(m.status)}</td>
          </tr>
        `).join('');
      } else if (maintTbody) {
        maintTbody.innerHTML = '<tr><td colspan="5">No maintenance history available.</td></tr>';
      }
    } catch (err) {
      Utils.Toast.api(err);
    }
  };


  const openEdit = () => {
    window.location.href = `registration.html?edit=${assetId}`;
  };

  return { load, openEdit };
})();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const canManage = user && (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER');
  if (!canManage) {
    // Hide edit button if present
    const editBtns = document.querySelectorAll('button[onclick="AssetDetails.openEdit()"], a[href^="registration.html?edit="]');
    editBtns.forEach(btn => btn.style.display = 'none');
  }

  AssetDetails.load();
});

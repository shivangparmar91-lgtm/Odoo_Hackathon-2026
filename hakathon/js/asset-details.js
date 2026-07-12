/* Asset Details JS */
const AssetDetails = (() => {
  const load = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const assetId = urlParams.get('id');

    if (!assetId) {
      document.getElementById('main-content').innerHTML = `<div class="empty-state"><h3>Asset Not Found</h3><p>No asset ID provided.</p><a href="asset-directory.html" class="btn btn-primary" onclick="window.handleRouting(event)">Back to Directory</a></div>`;
      return;
    }

    try {
      const a = await API.assets.getById(assetId);
      if (!a) throw new Error('Asset not found');

      document.title = `${a.tag || 'Asset'} - AssetFlow`;
      
      const el = (id) => document.getElementById(id);

      if(el('header-tag')) el('header-tag').textContent = a.tag || 'Unknown';
      if(el('asset-name')) el('asset-name').textContent = a.name || 'Unnamed Asset';
      if(el('asset-cat')) el('asset-cat').innerHTML = `${Utils.escapeHtml(a.brand || '')} ${Utils.escapeHtml(a.model || '')} &bull; ${Utils.escapeHtml(a.category || '')}${a.description ? ` &bull; <span style="color:var(--text-muted);font-size:.875rem">${Utils.escapeHtml(a.description)}</span>` : ''}`;
      if(el('asset-status-badge')) el('asset-status-badge').innerHTML = Utils.statusBadge(a.status);

      if(el('val-tag')) el('val-tag').textContent = a.tag || '—';
      if(el('val-serial')) el('val-serial').textContent = a.serialNo || '—';
      if(el('val-brand')) el('val-brand').textContent = `${a.brand || '—'} / ${a.model || '—'}`;
      if(el('val-loc')) el('val-loc').textContent = a.location || '—';
      if(el('val-assignee')) el('val-assignee').textContent = a.assignedTo || 'Unassigned';
      if(el('val-cond')) el('val-cond').textContent = a.condition || '—';

      if(el('qr-tag')) el('qr-tag').textContent = a.tag || '—';

      // Financial
      if(el('val-pur-date')) el('val-pur-date').textContent = a.purchaseDate ? Utils.Format.date(a.purchaseDate) : '—';
      if(el('val-cost')) el('val-cost').textContent = a.purchaseCost != null ? Utils.Format.currency(a.purchaseCost) : '—';

      if (a.purchaseDate && a.purchaseCost != null) {
        const yrs = (Date.now() - new Date(a.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
        const salvage = a.salvageValue || 0;
        const curVal = Math.max(salvage, a.purchaseCost - (a.purchaseCost * 0.2 * yrs));
        if(el('val-cur-cost')) el('val-cur-cost').textContent = Utils.Format.currency(curVal);
      } else {
        if(el('val-cur-cost')) el('val-cur-cost').textContent = '—';
      }

      if(el('val-vendor')) el('val-vendor').textContent = a.vendor || '—';
      if(el('val-inv')) el('val-inv').textContent = a.invoiceNo || '—';
      if(el('val-dept')) el('val-dept').textContent = a.dept || '—';

      if (a.warrantyEnd) {
        const wEnd = new Date(a.warrantyEnd);
        const wValid = wEnd > new Date();
        if(el('val-war-stat')) el('val-war-stat').innerHTML = wValid ? `<span class="badge badge-success">Active</span>` : `<span class="badge badge-danger">Expired</span>`;
        if(el('val-war-end')) el('val-war-end').textContent = Utils.Format.date(a.warrantyEnd);
      } else {
        if(el('val-war-stat')) el('val-war-stat').innerHTML = '—';
        if(el('val-war-end')) el('val-war-end').textContent = '—';
      }
      
      if(el('val-life')) el('val-life').textContent = a.usefulLife ? `${a.usefulLife} Years` : '—';

      // Timeline (fetch history if available, else use a.timeline if backend returns it)
      const tl = document.getElementById('asset-timeline');
      if(tl) {
        try {
          const history = await API.assets.getHistory(assetId);
          const events = history.content || history || [];
          if(events.length) {
            tl.innerHTML = events.map(t => `
              <div class="timeline-item">
                <div class="timeline-dot ${t.status || 'neutral'}">${t.type === 'ALLOCATION' ? '🔗' : t.type === 'MAINTENANCE' ? '🔧' : '📝'}</div>
                <div class="timeline-content">
                  <div class="timeline-title">${Utils.escapeHtml(t.title || t.type)}</div>
                  <div class="timeline-meta">${Utils.Format.datetime(t.date || t.timestamp)}</div>
                  <div class="timeline-desc">${Utils.escapeHtml(t.desc || t.description || '')}</div>
                </div>
              </div>
            `).join('');
          } else {
            tl.innerHTML = '<div class="timeline-item"><div class="timeline-content"><div class="timeline-desc">No history available</div></div></div>';
          }
        } catch(e) {
          tl.innerHTML = '<div class="timeline-item"><div class="timeline-content"><div class="timeline-desc">Could not load history</div></div></div>';
        }
      }

      // Maintenance history table
      const maintTbody = document.getElementById('maint-tbody');
      if (maintTbody) {
        try {
          const maint = await API.maintenance.getHistory(assetId);
          const records = maint.content || maint || [];
          if (records.length) {
            maintTbody.innerHTML = records.map(m => `
              <tr>
                <td class="font-mono" style="font-size:.8125rem">${Utils.Format.date(m.date || m.createdAt)}</td>
                <td><span class="badge badge-neutral">${m.type}</span></td>
                <td>${Utils.escapeHtml(m.technician || 'Pending')}</td>
                <td>${m.cost > 0 ? Utils.Format.currency(m.cost) : '<span style="color:var(--text-muted)">Free</span>'}</td>
                <td>${Utils.statusBadge(m.status)}</td>
              </tr>
            `).join('');
          } else {
            maintTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:1rem">No maintenance records</td></tr>';
          }
        } catch(e) {
          maintTbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--danger);padding:1rem">Error loading maintenance records</td></tr>';
        }
      }

    } catch(err) {
      Utils.Toast.api(err);
      document.getElementById('main-content').innerHTML = `<div class="empty-state"><h3>Error</h3><p>Could not load asset details.</p><a href="asset-directory.html" class="btn btn-primary" onclick="window.handleRouting(event)">Back to Directory</a></div>`;
    }
  };

  const openEdit = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const assetId = urlParams.get('id');
    if(assetId) {
      window.location.href = `registration.html?edit=${assetId}`;
    }
  };

  return { load, openEdit };
})();

const initAssetDetailsView = () => {
  if (!document.getElementById('asset-timeline')) return; // Check if we're on the right page
  Auth.requireAuth();
  
  const role = Auth.getRole();
  const canManage = ['ADMIN', 'ASSET_MANAGER'].includes(role);
  
  if (!canManage) {
    const editBtn = document.querySelector('.topbar-actions button.btn-primary');
    if (editBtn) editBtn.style.display = 'none';
    
    // Hide Upload Document button in Docs tab
    const docsTab = document.querySelector('[data-tab="docs"].tab-content');
    if (docsTab) {
       const uploadBtn = docsTab.querySelector('button.btn-secondary');
       if (uploadBtn) uploadBtn.style.display = 'none';
    }
  }

  AssetDetails.load();
};

document.addEventListener('DOMContentLoaded', initAssetDetailsView);
window.addEventListener('pageLoaded', initAssetDetailsView);

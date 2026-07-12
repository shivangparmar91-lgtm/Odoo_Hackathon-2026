/* Resource Booking JS */
const BookingPage = (() => {
  let state = { bookings: [], assets: [], users: [] };

  const load = async () => {
    const tbody = document.getElementById('booking-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7">${Utils.skeletonRows(4, 7)}</td></tr>`;

    try {
      // Fetch bookings + assets + users in parallel to resolve names
      const [res, assetsRes, usersRes] = await Promise.all([
        API.bookings.getAll(),
        API.assets.getAll(),
        API.employees.getAll()
      ]);
      state.bookings = res.content || res || [];
      state.assets   = Array.isArray(assetsRes) ? assetsRes : (assetsRes.content || []);
      state.users    = Array.isArray(usersRes)  ? usersRes  : (usersRes.content  || []);
    } catch (err) {
      console.error(err);
      state.bookings = [];
    }

    const assetMap = {};
    state.assets.forEach(a => { assetMap[a.id] = a; });
    const userMap  = {};
    state.users.forEach(u  => { userMap[u.id]  = u; });

    if (!state.bookings.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No bookings found.</div></td></tr>`;
    } else {
      tbody.innerHTML = state.bookings.map(b => {
        const asset = assetMap[b.assetId];
        const user  = userMap[b.userId];
        const resourceName = asset ? `${asset.assetTag} — ${asset.name}` : (b.resourceName || b.resource || '—');
        const bookedBy     = user  ? `${user.firstName} ${user.lastName}` : (b.employeeName || b.user || '—');
        const dept         = user  ? (user.department || user.dept || '') : (b.dept || '');
        // Dates
        const startDate = b.startDate || b.startTime || b.start;
        const endDate   = b.endDate   || b.endTime   || b.end;

        return `
        <tr class="animate-fade-up">
          <td>
            <div style="font-weight:600">${Utils.escapeHtml(resourceName)}</div>
            ${asset ? `<div style="font-size:.75rem;color:var(--text-muted)">${asset.category||''}</div>` : ''}
          </td>
          <td>
            <div style="font-weight:500">${Utils.escapeHtml(bookedBy)}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(dept)}</div>
          </td>
          <td style="font-size:.8125rem">${Utils.Format.date ? Utils.Format.date(startDate) : (startDate || '—')}</td>
          <td style="font-size:.8125rem">${Utils.Format.date ? Utils.Format.date(endDate) : (endDate || '—')}</td>
          <td style="font-size:.875rem;color:var(--text-secondary)">${Utils.escapeHtml(b.purpose || '')}</td>
          <td>${Utils.statusBadge(b.status)}</td>
          <td>
            ${(b.status !== 'COMPLETED' && b.status !== 'CANCELLED') 
              ? `<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="BookingPage.cancel(${b.id})">Cancel</button>` 
              : '<span style="color:var(--text-muted);font-size:.8125rem">—</span>'}
          </td>
        </tr>`;
      }).join('');
    }

    // Stats
    const el = (id) => document.getElementById(id);
    if (el('stat-confirmed'))  el('stat-confirmed').textContent  = state.bookings.filter(b => b.status === 'APPROVED').length;
    if (el('stat-pending-b'))  el('stat-pending-b').textContent  = state.bookings.filter(b => b.status === 'PENDING').length;
    if (el('stat-completed-b'))el('stat-completed-b').textContent = state.bookings.filter(b => b.status === 'COMPLETED').length;
  };

  const openAdd = async () => {
    const fields = ['book-start', 'book-end', 'book-purpose'];
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    // Load asset options dynamically
    const resSel = document.getElementById('book-resource');
    if (resSel) {
      resSel.innerHTML = '<option value="">Loading assets…</option>';
      try {
        const assets = await API.assets.getAll();
        const list = Array.isArray(assets) ? assets : (assets.content || []);
        resSel.innerHTML = '<option value="">Select Resource/Asset…</option>' +
          list.map(a => `<option value="${a.id}">${a.assetTag} — ${a.name} (${a.status})</option>`).join('');
      } catch {
        resSel.innerHTML = '<option value="">Failed to load</option>';
      }
    }
    Utils.openModal('book-modal');
  };

  const save = async () => {
    if (!Utils.validateForm({
      'book-resource': {required:true}, 'book-start': {required:true},
      'book-end': {required:true}, 'book-purpose': {required:true}
    })) return;

    const body = {
      assetId:   parseInt(document.getElementById('book-resource').value),
      startDate: document.getElementById('book-start').value,
      endDate:   document.getElementById('book-end').value,
      purpose:   document.getElementById('book-purpose').value.trim()
    };

    try {
      await API.bookings.create(body);
      Utils.Toast.success('Booked', 'Resource booking submitted.');
      Utils.closeModal('book-modal');
      load();
    } catch (err) {
      Utils.Toast.api(err);
    }
  };

  const cancel = (id) => {
    Utils.confirmDialog('Cancel Booking', 'Are you sure you want to cancel this booking?', async () => {
      try {
        await API.bookings.cancel(id);
        Utils.Toast.info('Cancelled', 'Booking cancelled.');
        load();
      } catch (err) {
        Utils.Toast.api(err);
      }
    });
  };

  return { load, openAdd, save, cancel };
})();

window.openBookModal = () => BookingPage.openAdd();
window.saveBooking   = () => BookingPage.save();

const initBookingView = () => {
  if (!document.getElementById('booking-tbody')) return;
  Auth.requireAuth();
  BookingPage.load();
};

document.addEventListener('DOMContentLoaded', initBookingView);
window.addEventListener('pageLoaded', initBookingView);

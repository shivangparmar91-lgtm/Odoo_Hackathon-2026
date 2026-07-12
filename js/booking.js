/* Resource Booking JS */
const BookingPage = (() => {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  // All roles (EMPLOYEE, DEPT_HEAD, ASSET_MANAGER, ADMIN) can book resources
  const canBook = !!user;

  let state = { page: 1, pageSize: 10, total: 0 };

  const load = async () => {
    const tbody = document.getElementById('booking-tbody');
    tbody.innerHTML = `<tr><td colspan="7"><div style="text-align:center;padding:2rem"><div class="spinner spinner-lg"></div></div></td></tr>`;

    let bookings = [];
    try {
      const params = Utils.buildQuery({ page: state.page - 1, size: state.pageSize });
      const res = await API.bookings.getAll(params);
      bookings = res.content || res || [];
      state.total = res.totalElements || bookings.length;
    } catch (err) {
      Utils.Toast.api(err);
      state.total = 0;
    }

    if (!bookings.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📅</div><h3>No bookings found</h3><p>Book a shared resource to get started.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = bookings.map(b => {
        // Users can cancel their own bookings; admins can cancel any
        const isOwner = user && (b.userId == user.id || b.user === user.name);
        const canCancel = (isOwner || user.role === 'ADMIN') && b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
        const cancelBtn = canCancel
          ? `<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="BookingPage.cancel(${b.id})">Cancel</button>`
          : `<span style="color:var(--text-muted);font-size:.8125rem">—</span>`;

        return `
        <tr class="animate-fade-up">
          <td><div style="font-weight:600">${Utils.escapeHtml(b.resource || b.resourceName || '')}</div></td>
          <td>
            <div style="font-weight:500">${Utils.escapeHtml(b.user || b.userName || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(b.dept || b.department || '')}</div>
          </td>
          <td style="font-size:.8125rem">${Utils.Format.datetime(b.start || b.startTime)}</td>
          <td style="font-size:.8125rem">${Utils.Format.datetime(b.end || b.endTime)}</td>
          <td style="font-size:.875rem;color:var(--text-secondary)">${Utils.escapeHtml(b.purpose || '')}</td>
          <td>${Utils.statusBadge(b.status)}</td>
          <td>${cancelBtn}</td>
        </tr>`;
      }).join('');
    }

    // Stats
    const el = (id) => document.getElementById(id);
    if (el('stat-confirmed'))  el('stat-confirmed').textContent  = bookings.filter(b=>b.status==='CONFIRMED').length;
    if (el('stat-pending-b'))  el('stat-pending-b').textContent  = bookings.filter(b=>b.status==='PENDING').length;
    if (el('stat-completed-b'))el('stat-completed-b').textContent= bookings.filter(b=>b.status==='COMPLETED').length;

    Utils.renderPagination(document.getElementById('book-pagination'), {
      page: state.page, totalPages: Math.ceil(state.total / state.pageSize),
      total: state.total, pageSize: state.pageSize,
      onPageChange: (p) => { state.page = p; load(); }
    });
  };

  const openAdd = () => {
    if (!canBook) { Utils.Toast.error('Access Denied', 'You must be logged in to book a resource.'); return; }
    const fields = ['book-resource','book-start','book-end','book-purpose'];
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    Utils.openModal('book-modal');
  };

  const save = async () => {
    if (!Utils.validateForm({
      'book-resource':{required:true}, 'book-start':{required:true},
      'book-end':{required:true}, 'book-purpose':{required:true}
    })) return;
    const btn = document.getElementById('book-save-btn');
    if (btn) Utils.setButtonLoading(btn, true);
    try {
      await API.bookings.create({
        resourceName: document.getElementById('book-resource').value,
        startTime: document.getElementById('book-start').value,
        endTime: document.getElementById('book-end').value,
        purpose: document.getElementById('book-purpose').value,
      });
      Utils.Toast.success('Booked', 'Resource booking submitted successfully.');
      Utils.closeModal('book-modal');
      load();
    } catch (err) { Utils.Toast.api(err); }
    if (btn) Utils.setButtonLoading(btn, false);
  };

  const cancel = (id) => {
    Utils.confirmDialog('Cancel Booking', 'Are you sure you want to cancel this booking?', async () => {
      try {
        await API.bookings.cancel(id);
        Utils.Toast.info('Cancelled', 'Booking cancelled.');
        load();
      } catch (err) { Utils.Toast.api(err); }
    });
  };

  return { load, openAdd, save, cancel };
})();

window.openBookModal = () => BookingPage.openAdd();
window.saveBooking   = () => BookingPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  BookingPage.load();
});

/* Resource Booking JS */
const BookingPage = (() => {
  let state = { bookings: [] };

  const load = async () => {
    const tbody = document.getElementById('booking-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7">${Utils.skeletonRows(4, 7)}</td></tr>`;

    try {
      const res = await API.bookings.getAll();
      state.bookings = res.content || res || [];
    } catch (err) {
      console.error(err);
      state.bookings = [];
    }

    if(!state.bookings.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No bookings found.</div></td></tr>`;
    } else {
      tbody.innerHTML = state.bookings.map(b => `
        <tr class="animate-fade-up">
          <td>
            <div style="font-weight:600">${Utils.escapeHtml(b.resourceName || b.resource || '')}</div>
          </td>
          <td>
            <div style="font-weight:500">${Utils.escapeHtml(b.employeeName || b.user || '')}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${Utils.escapeHtml(b.dept || '')}</div>
          </td>
          <td style="font-size:.8125rem">${Utils.Format.datetime(b.startTime || b.start)}</td>
          <td style="font-size:.8125rem">${Utils.Format.datetime(b.endTime || b.end)}</td>
          <td style="font-size:.875rem;color:var(--text-secondary)">${Utils.escapeHtml(b.purpose || '')}</td>
          <td>${Utils.statusBadge(b.status)}</td>
          <td>
            ${(b.status !== 'COMPLETED' && b.status !== 'CANCELLED') ? `<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="BookingPage.cancel(${b.id})">Cancel</button>` : '<span style="color:var(--text-muted);font-size:.8125rem">—</span>'}
          </td>
        </tr>
      `).join('');
    }

    // Stats
    const el = (id) => document.getElementById(id);
    if(el('stat-confirmed')) el('stat-confirmed').textContent = state.bookings.filter(b=>b.status==='CONFIRMED').length;
    if(el('stat-pending-b')) el('stat-pending-b').textContent = state.bookings.filter(b=>b.status==='PENDING').length;
    if(el('stat-completed-b'))el('stat-completed-b').textContent=state.bookings.filter(b=>b.status==='COMPLETED').length;
  };

  const openAdd = () => {
    const fields = ['book-resource','book-start','book-end','book-purpose'];
    fields.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    Utils.openModal('book-modal');
  };

  const save = async () => {
    if(!Utils.validateForm({
      'book-resource':{required:true}, 'book-start':{required:true},
      'book-end':{required:true}, 'book-purpose':{required:true}
    })) return;
    
    const body = {
      resourceName: document.getElementById('book-resource').value.trim(),
      startTime: document.getElementById('book-start').value,
      endTime: document.getElementById('book-end').value,
      purpose: document.getElementById('book-purpose').value.trim()
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
window.saveBooking = () => BookingPage.save();

const initBookingView = () => {
  if (!document.getElementById('booking-tbody')) return;
  Auth.requireAuth();
  BookingPage.load();
};

document.addEventListener('DOMContentLoaded', initBookingView);
window.addEventListener('pageLoaded', initBookingView);

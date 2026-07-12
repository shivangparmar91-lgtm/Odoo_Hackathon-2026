/* Resource Booking JS */
const DEMO_BOOKINGS = [
  { id:1, resource:'Conference Room A',       user:'Bob Smith',      dept:'HR',           start:'2025-07-12T09:00:00Z', end:'2025-07-12T11:00:00Z', purpose:'Board Meeting – Q3 Strategy Review',             status:'CONFIRMED' },
  { id:2, resource:'Epson Projector EB-X51',  user:'Eva Brown',      dept:'Sales',        start:'2025-07-12T14:00:00Z', end:'2025-07-12T16:00:00Z', purpose:'Quarterly Sales Presentation to Management',      status:'CONFIRMED' },
  { id:3, resource:'Polycom Video Conf Unit',  user:'Frank Moore',    dept:'Legal',        start:'2025-07-13T15:00:00Z', end:'2025-07-13T16:30:00Z', purpose:'Legal Briefing with External Counsel',            status:'PENDING'   },
  { id:4, resource:'Conference Room B',        user:'Grace Kim',      dept:'R&D',          start:'2025-07-14T10:00:00Z', end:'2025-07-14T12:00:00Z', purpose:'Product Roadmap Planning – Sprint 22',            status:'CONFIRMED' },
  { id:5, resource:'Canon EOS R5 Camera',      user:'Alice Johnson',  dept:'IT',           start:'2025-07-15T09:00:00Z', end:'2025-07-15T17:00:00Z', purpose:'Annual Company Photography & Team Photos',        status:'PENDING'   },
  { id:6, resource:'Conference Room A',        user:'Carol Davis',    dept:'Finance',      start:'2025-07-16T13:00:00Z', end:'2025-07-16T14:30:00Z', purpose:'Budget Review Meeting – FY 2025-26',              status:'CONFIRMED' },
  { id:7, resource:'Epson Projector EB-X51',   user:'Henry Wilson',   dept:'Operations',   start:'2025-07-10T10:00:00Z', end:'2025-07-10T11:30:00Z', purpose:'New Joiner Orientation Presentation',             status:'COMPLETED' },
  { id:8, resource:'Conference Room C',        user:'Irene Clark',    dept:'IT',           start:'2025-07-11T14:00:00Z', end:'2025-07-11T15:00:00Z', purpose:'DevOps Retrospective Meeting',                    status:'COMPLETED' },
];

const BookingPage = (() => {
  const load = () => {
    const tbody = document.getElementById('booking-tbody');
    if(!DEMO_BOOKINGS.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">No bookings found.</div></td></tr>`;
      return;
    }

    tbody.innerHTML = DEMO_BOOKINGS.map(b => `
      <tr class="animate-fade-up">
        <td>
          <div style="font-weight:600">${b.resource}</div>
        </td>
        <td>
          <div style="font-weight:500">${b.user}</div>
          <div style="font-size:.75rem;color:var(--text-muted)">${b.dept}</div>
        </td>
        <td style="font-size:.8125rem">${Utils.Format.datetime(b.start)}</td>
        <td style="font-size:.8125rem">${Utils.Format.datetime(b.end)}</td>
        <td style="font-size:.875rem;color:var(--text-secondary)">${b.purpose}</td>
        <td>${Utils.statusBadge(b.status)}</td>
        <td>
          ${b.status !== 'COMPLETED' ? `<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="BookingPage.cancel(${b.id})">Cancel</button>` : '<span style="color:var(--text-muted);font-size:.8125rem">—</span>'}
        </td>
      </tr>
    `).join('');

    // Stats
    const el = (id) => document.getElementById(id);
    if(el('stat-confirmed')) el('stat-confirmed').textContent = DEMO_BOOKINGS.filter(b=>b.status==='CONFIRMED').length;
    if(el('stat-pending-b')) el('stat-pending-b').textContent = DEMO_BOOKINGS.filter(b=>b.status==='PENDING').length;
    if(el('stat-completed-b'))el('stat-completed-b').textContent=DEMO_BOOKINGS.filter(b=>b.status==='COMPLETED').length;
  };

  const openAdd = () => {
    const fields = ['book-resource','book-start','book-end','book-purpose'];
    fields.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    Utils.openModal('book-modal');
  };

  const save = () => {
    if(!Utils.validateForm({
      'book-resource':{required:true}, 'book-start':{required:true},
      'book-end':{required:true}, 'book-purpose':{required:true}
    })) return;
    const newId = DEMO_BOOKINGS.length + 1;
    DEMO_BOOKINGS.unshift({
      id: newId,
      resource: document.getElementById('book-resource').value,
      user: 'Current User', dept: 'IT',
      start: document.getElementById('book-start').value,
      end: document.getElementById('book-end').value,
      purpose: document.getElementById('book-purpose').value,
      status: 'PENDING',
    });
    Utils.Toast.success('Booked', 'Resource booking confirmed.');
    Utils.closeModal('book-modal');
    load();
  };

  const cancel = (id) => {
    Utils.confirmDialog('Cancel Booking', 'Are you sure you want to cancel this booking?', () => {
      const b = DEMO_BOOKINGS.find(x => x.id === id);
      if(b) b.status = 'CANCELLED';
      Utils.Toast.info('Cancelled', 'Booking cancelled.');
      load();
    });
  };

  return { load, openAdd, save, cancel };
})();

window.openBookModal = () => BookingPage.openAdd();
window.saveBooking = () => BookingPage.save();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  BookingPage.load();
});

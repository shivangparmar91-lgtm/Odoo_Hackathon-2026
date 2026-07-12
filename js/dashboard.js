/* ============================================================
   AssetFlow – Dashboard JS
   KPIs, Charts, Recent Activity, Alerts
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  // Welcome banner
  const user = Auth.getUser();
  const nameEl = document.getElementById('welcome-name');
  const dateEl = document.getElementById('welcome-date');
  const topbarAvatar = document.getElementById('topbar-avatar');

  if (nameEl && user) {
    nameEl.textContent = `${user.firstName || 'Welcome'} ${user.lastName || ''}`.trim();
  }
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  if (topbarAvatar && user) {
    topbarAvatar.textContent = Utils.Format.initials(`${user.firstName} ${user.lastName}`);
  }

  // Dropdown toggle
  document.getElementById('profile-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('profile-dropdown')?.classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('profile-dropdown')?.classList.remove('open');
  });

  loadDashboard();
});

window.loadDashboard = async () => {
  await Promise.all([loadMetrics(), loadCharts(), loadRecentActivity(), loadAlerts()]);
};

// ── KPI CARDS ──────────────────────────────────────────────────
const KPI_DEFS = [
  { key: 'totalAssets',       label: 'Total Assets',        icon: '📦', color: '#6366f1', colorLight: 'rgba(99,102,241,0.15)' },
  { key: 'activeAllocations', label: 'Active Allocations',  icon: '🔗', color: '#10b981', colorLight: 'rgba(16,185,129,0.15)' },
  { key: 'pendingMaintenance',label: 'Pending Maintenance',  icon: '🔧', color: '#f59e0b', colorLight: 'rgba(245,158,11,0.15)' },
  { key: 'openAudits',        label: 'Open Audits',         icon: '🔍', color: '#38bdf8', colorLight: 'rgba(56,189,248,0.15)' },
  { key: 'overdueAssets',     label: 'Overdue Returns',     icon: '⚠️', color: '#f43f5e', colorLight: 'rgba(244,63,94,0.15)' },
  { key: 'upcomingBookings',  label: 'Upcoming Bookings',   icon: '📅', color: '#a855f7', colorLight: 'rgba(168,85,247,0.15)' },
];

async function loadMetrics() {
  const grid = document.getElementById('kpi-grid');
  try {
    // Try API first
    let metrics;
    try {
      metrics = await API.dashboard.metrics();
    } catch {
      // Demo fallback
      metrics = {
        totalAssets: 348, activeAllocations: 214, pendingMaintenance: 32,
        openAudits: 3, overdueAssets: 9, upcomingBookings: 11,
        assetGrowth: 12.5, allocationGrowth: 4.8
      };
    }

    grid.innerHTML = KPI_DEFS.map(def => `
      <div class="kpi-card animate-fade-up hover-lift" style="--kpi-color:${def.color};--kpi-color-light:${def.colorLight}">
        <div class="kpi-icon">${def.icon}</div>
        <div class="kpi-label">${def.label}</div>
        <div class="kpi-value" data-count="${metrics[def.key] || 0}">0</div>
        ${def.key === 'totalAssets' ? `<div class="kpi-sub up">↑ ${metrics.assetGrowth || 0}% this month</div>` : ''}
      </div>
    `).join('');

    // Animate count-up
    document.querySelectorAll('.kpi-value[data-count]').forEach(el => {
      Utils.countUp(el, parseInt(el.dataset.count));
    });

  } catch (err) {
    if (grid) grid.innerHTML = `<div class="empty-state"><p>Failed to load metrics</p></div>`;
  }
}

// ── CHARTS ─────────────────────────────────────────────────────
let barChart, donutChart, deptChart, maintChart;
const CHART_COLORS = ['#6366f1','#10b981','#f59e0b','#f43f5e','#38bdf8','#a855f7','#ec4899'];

const chartDefaults = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, padding: 12, titleColor: '#f1f5f9', bodyColor: '#94a3b8' } },
  scales: {
    x: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  }
});

async function loadCharts() {
  let chartData;
  try {
    chartData = await API.dashboard.chartData();
  } catch {
    // Demo data
    chartData = {
      monthly: {
        labels: ['Feb','Mar','Apr','May','Jun','Jul'],
        allocated:   [42, 58, 51, 73, 82, 96],
        returned:    [18, 24, 31, 28, 45, 41],
        maintenance: [5,   8,  6, 11, 13, 15],
      },
      statusDist: { Available: 118, Allocated: 197, Maintenance: 15, Retired: 11, Lost: 4, Pending: 3 },
      departments: {
        'Information Technology': 95,
        'Operations': 112,
        'Finance & Accounts': 58,
        'Sales & Marketing': 74,
        'Human Resources': 32,
        'Research & Development': 88,
        'Customer Support': 67,
        'Legal & Compliance': 22,
      },
      maintenance: { Pending: 5, Approved: 3, InProgress: 4, Completed: 143, Rejected: 5 },
    };
  }

  renderBarChart(chartData.monthly);
  renderDonutChart(chartData.statusDist);
  renderDeptChart(chartData.departments);
  renderMaintChart(chartData.maintenance);
}

function renderBarChart(data) {
  const ctx = document.getElementById('chart-bar');
  if (!ctx) return;
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        { label: 'Allocated', data: data.allocated,   backgroundColor: 'rgba(99,102,241,0.8)',  borderRadius: 6, borderSkipped: false },
        { label: 'Returned',  data: data.returned,    backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, borderSkipped: false },
        { label: 'Maintenance', data: data.maintenance, backgroundColor: 'rgba(245,158,11,0.8)', borderRadius: 6, borderSkipped: false },
      ]
    },
    options: { ...chartDefaults(), plugins: { ...chartDefaults().plugins, legend: { display: true, labels: { color: '#94a3b8', usePointStyle: true } } } }
  });
}

function renderDonutChart(data) {
  const ctx = document.getElementById('chart-donut');
  if (!ctx) return;
  if (donutChart) donutChart.destroy();
  const labels = Object.keys(data);
  const values = Object.values(data);
  const total  = values.reduce((a,b) => a+b, 0);

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: CHART_COLORS.slice(0, labels.length), borderWidth: 0, hoverOffset: 8 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw} (${((ctx.raw/total)*100).toFixed(1)}%)` } } } }
  });

  const legend = document.getElementById('donut-legend');
  if (legend) {
    legend.innerHTML = labels.map((l, i) => `
      <div class="donut-legend-item">
        <div class="donut-legend-left">
          <div class="donut-legend-dot" style="background:${CHART_COLORS[i]}"></div>
          <span style="color:var(--text-secondary);font-size:.8125rem">${l}</span>
        </div>
        <span class="donut-legend-val">${values[i]}</span>
      </div>
    `).join('');
  }
}

function renderDeptChart(data) {
  const ctx = document.getElementById('chart-dept');
  if (!ctx) return;
  if (deptChart) deptChart.destroy();
  deptChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{ data: Object.values(data), backgroundColor: CHART_COLORS, borderRadius: 8, borderSkipped: false }]
    },
    options: { ...chartDefaults(), indexAxis: 'y', plugins: { ...chartDefaults().plugins } }
  });
}

function renderMaintChart(data) {
  const ctx = document.getElementById('chart-maint');
  if (!ctx) return;
  if (maintChart) maintChart.destroy();
  maintChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data),
      datasets: [{ data: Object.values(data), backgroundColor: ['#f59e0b','#38bdf8','#10b981','#f43f5e'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, usePointStyle: true, font: { size: 11 } } }, tooltip: { backgroundColor: '#1e293b', borderColor: '#334155', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8' } } }
  });
}

window.switchChartPeriod = (el, period) => {
  document.querySelectorAll('[data-period]').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  loadCharts(); // In real app, pass period to API
};

// ── RECENT ACTIVITY ────────────────────────────────────────────
async function loadRecentActivity() {
  const el = document.getElementById('recent-activity');
  if (!el) return;
  let activities;
  try {
    activities = await API.dashboard.recent();
  } catch {
    activities = [
      { type: 'allocation',   text: '<strong>Surface Pro 9</strong> (AF-2025-017) allocated to <strong>Eva Brown</strong> – Sales Dept', time: '2 min ago',  color: '#6366f1' },
      { type: 'maintenance',  text: 'Maintenance ticket <strong>MNT-1004</strong> raised for <strong>Forklift Crown FC 5000</strong> – CRITICAL priority', time: '45 min ago', color: '#f43f5e' },
      { type: 'booking',      text: '<strong>Conference Room A</strong> booked by <strong>Bob Smith</strong> for Board Meeting on 12 Jul 09:00', time: '1 hr ago',   color: '#a855f7' },
      { type: 'return',       text: '<strong>Samsung 4K Monitor</strong> (AF-2025-009) returned by <strong>Frank Moore</strong> in GOOD condition', time: '2 hr ago',  color: '#10b981' },
      { type: 'transfer',     text: 'Transfer <strong>TRF-00148</strong> approved – AF-2025-013 (HP EliteBook) moved from IT → Finance', time: '3 hr ago',  color: '#38bdf8' },
      { type: 'audit',        text: 'Audit cycle <strong>Q3-2025 R&D</strong> initiated by <strong>Grace Kim</strong> – 88 assets in scope', time: '1 day ago',  color: '#38bdf8' },
      { type: 'maintenance',  text: 'Maintenance ticket <strong>MNT-1007</strong> completed – Dell PowerEdge RAID rebuild. Cost: ₹9,800', time: '3 days ago', color: '#10b981' },
      { type: 'asset',        text: 'New asset <strong>MacBook Pro M3 14"</strong> registered – IT Store, ready for allocation', time: '5 days ago', color: '#ec4899' },
    ];
  }

  el.innerHTML = `<div class="activity-feed">${activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.color || '#6366f1'}"></div>
      <div class="activity-text" style="font-size:var(--text-sm);color:var(--text-secondary)">${a.text}</div>
      <div class="activity-time">${Utils.Format.timeAgo ? Utils.Format.timeAgo(a.time) : a.time}</div>
    </div>
  `).join('')}</div>`;
}

// ── ALERTS ─────────────────────────────────────────────────────
async function loadAlerts() {
  const el = document.getElementById('alerts-list');
  if (!el) return;
  const alerts = [
    { text: '9 assets have overdue return dates – action required',          type: 'danger',  icon: '⚠️' },
    { text: '5 maintenance requests pending approval (1 CRITICAL)',          type: 'danger',  icon: '🔧' },
    { text: 'Audit cycle Q3-2025 (R&D) kicked off – 88 assets in scope',    type: 'info',    icon: '🔍' },
    { text: '3 warranty expirations this month (HP, Cisco, Dell assets)',    type: '',        icon: '📋' },
    { text: 'Forklift Crown FC 5000 grounded – hydraulic failure reported',  type: 'danger',  icon: '🏗️' },
    { text: 'Transfer TRF-00148 waiting for Finance dept acknowledgement',   type: '',        icon: '↔️' },
  ];
  const count = document.getElementById('alert-count');
  if (count) count.textContent = alerts.length;
  el.innerHTML = alerts.map(a => `
    <div class="alert-item ${a.type}">
      <span style="font-size:18px;flex-shrink:0">${a.icon}</span>
      <span style="font-size:var(--text-sm);color:var(--text-secondary)">${a.text}</span>
    </div>
  `).join('');
}

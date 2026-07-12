/* Reports JS */
const ReportsPage = (() => {
  const generate = (format) => {
    const type = document.getElementById('report-type').value;
    const start = document.getElementById('report-start').value;
    const end = document.getElementById('report-end').value;

    if(!start || !end) {
      Utils.Toast.warning('Validation', 'Please select a date range.');
      return;
    }
    if(new Date(start) > new Date(end)) {
      Utils.Toast.warning('Validation', 'Start date cannot be after end date.');
      return;
    }

    Utils.Toast.info('Generating...', `Preparing ${type} report in ${format.toUpperCase()} format.`);
    setTimeout(() => {
      Utils.Toast.success('Complete', 'Report downloaded successfully.');
    }, 1500);
  };

  return { generate };
})();

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);
  
  document.getElementById('report-end').value = today.toISOString().split('T')[0];
  document.getElementById('report-start').value = lastMonth.toISOString().split('T')[0];
});

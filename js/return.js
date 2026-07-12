/* Asset Return JS */
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const searchInput = document.getElementById('return-asset-search');
  const info = document.getElementById('asset-info');
  
  // Mock search
  searchInput.addEventListener('input', (e) => {
    if(e.target.value.length >= 3) {
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }
  });
});

window.processReturn = () => {
  const valid = Utils.validateForm({
    'return-asset-search': {required:true},
    'return-condition': {required:true}
  });
  if(!valid) return;

  const btn = document.getElementById('return-btn');
  Utils.setButtonLoading(btn, true);
  
  setTimeout(() => {
    Utils.Toast.success('Success', 'Asset has been successfully returned to inventory.');
    Utils.setButtonLoading(btn, false);
    setTimeout(() => {
      window.location.href = 'directory.html';
    }, 1500);
  }, 800);
};

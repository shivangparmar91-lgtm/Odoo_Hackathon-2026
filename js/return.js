/* Asset Return JS */
const ReturnPage = (() => {
  let assetIdToReturn = null;
  
  const setupSearch = () => {
    const searchInput = document.getElementById('return-asset-search');
    const info = document.getElementById('asset-info');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', async (e) => {
      const val = e.target.value.trim();
      if(val.length >= 3) {
        try {
          const params = Utils.buildQuery({ search: val, status: 'ALLOCATED', size: 1 });
          const res = await API.assets.getAll(params);
          const assets = res.content || res || [];
          if (assets.length > 0) {
            assetIdToReturn = assets[0].id;
            info.style.display = 'block';
            
            const infoText = info.querySelector('.info-value') || info.querySelector('div');
            if (infoText) infoText.innerHTML = `Found: <strong>${Utils.escapeHtml(assets[0].tag)}</strong> - ${Utils.escapeHtml(assets[0].name)} (Assigned to: ${Utils.escapeHtml(assets[0].assignedTo || 'Unknown')})`;
          } else {
            assetIdToReturn = null;
            info.style.display = 'none';
          }
        } catch (err) {
          assetIdToReturn = null;
          info.style.display = 'none';
        }
      } else {
        assetIdToReturn = null;
        info.style.display = 'none';
      }
    });
  };

  const processReturn = async () => {
    const valid = Utils.validateForm({
      'return-asset-search': {required:true},
      'return-condition': {required:true}
    });
    if(!valid) return;
    
    if (!assetIdToReturn) {
      Utils.Toast.error('Error', 'Please search and select a valid allocated asset.');
      return;
    }

    const btn = document.getElementById('return-btn');
    Utils.setButtonLoading(btn, true);
    
    try {
      const cond = document.getElementById('return-condition').value;
      await API.allocations.return(assetIdToReturn, { condition: cond });
      Utils.Toast.success('Success', 'Asset has been successfully returned to inventory.');
      setTimeout(() => {
        const directoryLink = document.querySelector('a[href="../assets/directory.html"]');
        if (directoryLink) {
           directoryLink.click();
        } else {
           window.location.href = 'directory.html';
        }
      }, 1500);
    } catch (err) {
      Utils.Toast.api(err);
    }
    Utils.setButtonLoading(btn, false);
  };

  return { setupSearch, processReturn };
})();

window.processReturn = () => ReturnPage.processReturn();

const initReturnView = () => {
  if (!document.getElementById('return-asset-search')) return;
  Auth.requireAuth();
  ReturnPage.setupSearch();
};

document.addEventListener('DOMContentLoaded', initReturnView);
window.addEventListener('pageLoaded', initReturnView);

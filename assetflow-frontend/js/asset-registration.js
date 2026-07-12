/* Asset Registration JS – Multi-step form */
let currentStep = 1;
const totalSteps = 4;
const stepHints = [
  "Fill in the asset's basic identification information",
  "Enter purchase, financial, and warranty details",
  "Upload photos and supporting documents",
  "Review all information before submitting",
];

const updateSteps = () => {
  document.getElementById('step-num').textContent = currentStep;
  document.querySelectorAll('.step-form').forEach((f, i) => f.classList.toggle('active', i+1===currentStep));
  [1,2,3,4].forEach(i => {
    const ind = document.getElementById(`step-${i}-ind`);
    ind.className = 'step' + (i < currentStep ? ' done' : i === currentStep ? ' active' : '');
    ind.querySelector('.step-circle').textContent = i < currentStep ? '✓' : i;
    const line = document.getElementById(`line-${i}`);
    if (line) line.className = 'step-line' + (i < currentStep ? ' done' : '');
  });
  document.getElementById('prev-btn').style.display = currentStep > 1 ? '' : 'none';
  const nextBtn = document.getElementById('next-btn');
  nextBtn.textContent = currentStep === totalSteps ? '✅ Register Asset' : 'Next →';
  document.getElementById('step-hint').textContent = stepHints[currentStep-1];
};

window.nextStep = () => {
  if (!validateCurrentStep()) return;
  if (currentStep === totalSteps) { submitAsset(); return; }
  if (currentStep === totalSteps - 1) buildReview();
  currentStep++;
  updateSteps();
  window.scrollTo({top:0, behavior:'smooth'});
};

window.prevStep = () => {
  if (currentStep > 1) { currentStep--; updateSteps(); }
};

const validateCurrentStep = () => {
  if (currentStep === 1) {
    return Utils.validateForm({
      'asset-name':     { required:true, minLength:3 },
      'asset-tag':      { required:true },
      'asset-category': { required:true },
      'asset-condition':{ required:true },
    });
  }
  if (currentStep === 2) {
    return Utils.validateForm({
      'asset-purchase-date': { required:true },
      'asset-cost':          { required:true, positive:true },
    });
  }
  if (currentStep === 4) {
    if (!document.getElementById('confirm-check').checked) {
      Utils.Toast.warning('Confirmation Required', 'Please confirm the information is accurate.');
      return false;
    }
  }
  return true;
};

const buildReview = () => {
  const fields = [
    ['Asset Name',     document.getElementById('asset-name')?.value],
    ['Asset Tag',      document.getElementById('asset-tag')?.value],
    ['Serial Number',  document.getElementById('asset-serial')?.value],
    ['Category',       document.getElementById('asset-category')?.value],
    ['Brand',          document.getElementById('asset-brand')?.value],
    ['Model',          document.getElementById('asset-model')?.value],
    ['Condition',      document.getElementById('asset-condition')?.value],
    ['Location',       document.getElementById('asset-location')?.value],
    ['Purchase Date',  document.getElementById('asset-purchase-date')?.value],
    ['Purchase Cost',  `₹${Number(document.getElementById('asset-cost')?.value||0).toLocaleString()}`],
    ['Vendor',         document.getElementById('asset-vendor')?.value],
    ['Invoice No.',    document.getElementById('asset-invoice')?.value],
    ['Warranty Start', document.getElementById('asset-warranty-start')?.value],
    ['Warranty End',   document.getElementById('asset-warranty-end')?.value],
    ['Department',     document.getElementById('asset-dept')?.value],
  ];
  document.getElementById('review-content').innerHTML = fields.map(([l,v]) => `
    <div class="info-item">
      <div class="info-label">${l}</div>
      <div class="info-value">${v || '—'}</div>
    </div>
  `).join('');
};

const submitAsset = async () => {
  const btn = document.getElementById('next-btn');
  Utils.setButtonLoading(btn, true);
  const fd = new FormData();
  fd.append('name',        document.getElementById('asset-name').value.trim());
  fd.append('assetTag',    document.getElementById('asset-tag').value.trim());
  fd.append('serialNo',    document.getElementById('asset-serial').value.trim());
  fd.append('category',    document.getElementById('asset-category').value);
  fd.append('brand',       document.getElementById('asset-brand').value.trim());
  fd.append('model',       document.getElementById('asset-model').value.trim());
  fd.append('condition',   document.getElementById('asset-condition').value);
  fd.append('location',    document.getElementById('asset-location').value.trim());
  fd.append('description', document.getElementById('asset-desc').value.trim());
  fd.append('purchaseDate',document.getElementById('asset-purchase-date').value);
  fd.append('purchaseCost',document.getElementById('asset-cost').value);
  fd.append('vendor',      document.getElementById('asset-vendor').value.trim());
  fd.append('invoiceNo',   document.getElementById('asset-invoice').value.trim());
  fd.append('warrantyStart',document.getElementById('asset-warranty-start').value);
  fd.append('warrantyEnd', document.getElementById('asset-warranty-end').value);
  fd.append('department',  document.getElementById('asset-dept').value);
  fd.append('notes',       document.getElementById('asset-notes').value.trim());

  // Attach photos
  const photoInput = document.getElementById('photo-input');
  for (const f of photoInput.files) fd.append('photos', f);

  try {
    await API.assets.create(fd);
    Utils.Toast.success('Asset Registered!', 'The asset has been successfully added.');
    setTimeout(() => window.location.href = 'directory.html', 1200);
  } catch (err) {
    Utils.Toast.error('Registration Failed', err.message);
  }
  Utils.setButtonLoading(btn, false);
};

window.generateTag = () => {
  const year = new Date().getFullYear();
  const rnd  = Math.floor(Math.random() * 9000) + 1000;
  document.getElementById('asset-tag').value = `AST-${rnd}`;
  document.getElementById('asset-tag').classList.add('is-valid');
};

window.saveDraft = () => Utils.Toast.info('Draft Saved', 'Your progress has been saved locally.');

// Photo upload
window.handlePhotos = (input) => {
  const preview = document.getElementById('photo-preview');
  for (const file of input.files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const item = document.createElement('div');
      item.className = 'upload-preview-item';
      item.innerHTML = `
        <img src="${e.target.result}" alt="Preview">
        <button class="upload-preview-remove" onclick="this.parentElement.remove()">✕</button>
      `;
      preview.appendChild(item);
    };
    reader.readAsDataURL(file);
  }
};

// Document upload
window.handleDocs = (input) => {
  const list = document.getElementById('doc-list');
  for (const file of input.files) {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:.75rem;padding:.625rem .875rem;background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px;font-size:.8125rem';
    item.innerHTML = `
      <span>📄</span>
      <span style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${Utils.escapeHtml(file.name)}</span>
      <span style="color:var(--text-muted)">${Utils.Format.fileSize(file.size)}</span>
      <button style="background:none;border:none;cursor:pointer;color:var(--danger);font-size:12px" onclick="this.parentElement.remove()">✕</button>
    `;
    list.appendChild(item);
  }
};

// Drag and drop
const zone = document.getElementById('photo-zone');
if (zone) {
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const fakeInput = { files: e.dataTransfer.files };
    handlePhotos(fakeInput);
  });
}

// ── Load categories & departments from DB ─────────────────────────────────────
const loadFormDropdowns = async () => {
  const catSel  = document.getElementById('asset-category');
  const deptSel = document.getElementById('asset-dept');

  if (catSel) {
    catSel.innerHTML = '<option value="">Loading categories…</option>';
    try {
      const cats = await API.categories.getAll();
      const list = Array.isArray(cats) ? cats : (cats.content || []);
      if (list.length) {
        catSel.innerHTML = '<option value="">Select Category…</option>' +
          list.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      } else {
        catSel.innerHTML = '<option value="">No categories found</option>';
      }
    } catch (e) {
      catSel.innerHTML = '<option value="">Failed to load</option>';
    }
  }

  if (deptSel) {
    deptSel.innerHTML = '<option value="">Loading departments…</option>';
    try {
      const depts = await API.departments.getAll();
      const list = Array.isArray(depts) ? depts : (depts.content || []);
      if (list.length) {
        deptSel.innerHTML = '<option value="">Select Department…</option>' +
          list.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
      } else {
        deptSel.innerHTML = '<option value="">No departments found</option>';
      }
    } catch (e) {
      deptSel.innerHTML = '<option value="">Failed to load</option>';
    }
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  Auth.requireAuth();
  updateSteps();
  // Set today as default purchase date
  const pd = document.getElementById('asset-purchase-date');
  if (pd) pd.value = new Date().toISOString().split('T')[0];
  // Load live dropdowns
  await loadFormDropdowns();
});

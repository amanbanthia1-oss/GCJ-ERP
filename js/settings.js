// Settings Page

function loadSettings(){
  const nameEl = document.getElementById('setCompany');
  const gstinEl = document.getElementById('setGstin');
  const addressEl = document.getElementById('setAddress');
  const phoneEl = document.getElementById('setPhone');
  const emailEl = document.getElementById('setEmail');

  if(nameEl) nameEl.value = data.settings.companyName||'';
  if(gstinEl) gstinEl.value = data.settings.gstin||'';
  if(addressEl) addressEl.value = data.settings.address||'';
  if(phoneEl) phoneEl.value = data.settings.phone||'';
  if(emailEl) emailEl.value = data.settings.email||'';
}

function saveSettings(){
  data.settings.companyName = document.getElementById('setCompany').value.trim();
  data.settings.gstin = document.getElementById('setGstin').value.trim();
  data.settings.address = document.getElementById('setAddress').value.trim();
  data.settings.phone = document.getElementById('setPhone').value.trim();
  data.settings.email = document.getElementById('setEmail').value.trim();
  saveData(data);
  fsSet('settings', 'app', data.settings);
  toast('Settings saved!');
}

function resetData(){
  if(!confirm('Reset all data? This cannot be undone.')) return;
  if(!confirm('Are you really sure?')) return;
  data = defaultData();
  saveData(data);
  // Sync to Firestore
  const batch = db.batch();
  batch.set(db.collection('settings').doc('app'), data.settings);
  batch.commit().then(() => {
    toast('Data reset!');
    renderAll();
  });
}

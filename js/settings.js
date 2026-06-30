// Settings Page

function loadSettings(){
  const nameEl = document.getElementById('settingsCompanyName');
  const gstinEl = document.getElementById('settingsGstin');
  const addressEl = document.getElementById('settingsAddress');
  const phoneEl = document.getElementById('settingsPhone');
  const emailEl = document.getElementById('settingsEmail');

  if(nameEl) nameEl.value = data.settings.companyName||'';
  if(gstinEl) gstinEl.value = data.settings.gstin||'';
  if(addressEl) addressEl.value = data.settings.address||'';
  if(phoneEl) phoneEl.value = data.settings.phone||'';
  if(emailEl) emailEl.value = data.settings.email||'';
}

function saveSettings(){
  data.settings.companyName = document.getElementById('settingsCompanyName').value.trim();
  data.settings.gstin = document.getElementById('settingsGstin').value.trim();
  data.settings.address = document.getElementById('settingsAddress').value.trim();
  data.settings.phone = document.getElementById('settingsPhone').value.trim();
  data.settings.email = document.getElementById('settingsEmail').value.trim();
  saveData(data);
  fsSet('settings', 'app', data.settings);
  alert('Settings saved!');
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
    alert('Data reset!');
    renderAll();
  });
}

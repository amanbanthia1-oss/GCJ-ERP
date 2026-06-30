// Database Layer - Firestore + localStorage
// Firebase initialized in init.js

function fsSet(col, id, data){
  if(!db) return;
  localChange = true;
  db.collection(col).doc(id).set(data)
    .then(() => setTimeout(() => { localChange = false; }, 2000))
    .catch(e => { console.log('Firestore write error:', e); localChange = false; });
}

function fsDelete(col, id){
  if(!db) return;
  localChange = true;
  db.collection(col).doc(id).delete()
    .then(() => setTimeout(() => { localChange = false; }, 2000))
    .catch(e => { console.log('Firestore delete error:', e); localChange = false; });
}

function fsSyncLocalToFirestore(){
  if(!db) return;
  localChange = true;
  const batch = db.batch();
  data.products.forEach(p => batch.set(db.collection('products').doc(p.id), p));
  data.orders.forEach(o => batch.set(db.collection('orders').doc(o.id), o));
  batch.set(db.collection('settings').doc('app'), data.settings);
  batch.commit().then(() => {
    showSyncBadge('Synced',1500);
    setTimeout(() => { localChange = false; }, 2000);
  }).catch(e => {
    console.log('Firestore sync error:', e);
    localChange = false;
  });
}

function showSyncBadge(msg,ms){
  const el = document.getElementById('syncBadge');
  if(!el)return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(()=>{el.style.display='none'},ms||2000);
}

function setupFirestoreListeners(){
  if(!db) return;

  // Products listener
  db.collection('products').onSnapshot(snap => {
    if(localChange) return;
    snap.docChanges().forEach(change => {
      const doc = {id: change.doc.id, ...change.doc.data()};
      if(change.type === 'removed'){
        data.products = data.products.filter(p => p.id !== doc.id);
      } else {
        const idx = data.products.findIndex(p => p.id === doc.id);
        if(idx>-1) data.products[idx] = doc;
        else data.products.push(doc);
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if(!initialSnapshot) showSyncBadge('Updated from another device',2000);
    // Targeted re-render: don't call showPage (fixes flicker + cart loss)
    if(currentPage === 'dashboard') renderDashboard();
    else if(currentPage === 'catalog') renderCatalog();
    else if(currentPage === 'history') renderHistory();
    // POS never re-renders on remote changes (preserves cart)
  }, e => console.log('Products listener error:', e));

  // Orders listener
  db.collection('orders').onSnapshot(snap => {
    if(localChange) return;
    snap.docChanges().forEach(change => {
      const doc = {id: change.doc.id, ...change.doc.data()};
      if(change.type === 'removed'){
        data.orders = data.orders.filter(o => o.id !== doc.id);
      } else {
        const idx = data.orders.findIndex(o => o.id === doc.id);
        if(idx>-1) data.orders[idx] = doc;
        else data.orders.push(doc);
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if(!initialSnapshot) showSyncBadge('Updated from another device',2000);
    if(currentPage === 'dashboard') renderDashboard();
    else if(currentPage === 'history') renderHistory();
  }, e => console.log('Orders listener error:', e));

  // Settings listener
  db.collection('settings').doc('app').onSnapshot(snap => {
    if(localChange || !snap.exists) return;
    data.settings = snap.data();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if(currentPage==='settings') loadSettings();
  }, e => console.log('Settings listener error:', e));
}

async function initFromFirestore(){
  const overlay = document.getElementById('loadingOverlay');
  if(!db){ overlay.style.display='none'; return; }
  try {
    overlay.style.display = 'flex';
    const [prodSnap, orderSnap, settingsSnap] = await Promise.all([
      db.collection('products').get(),
      db.collection('orders').get(),
      db.collection('settings').doc('app').get()
    ]);

    const hasFirestoreProducts = !prodSnap.empty;
    const hasFirestoreOrders = !orderSnap.empty;
    const hasLocalProducts = data.products.length > 0;
    const hasLocalOrders = data.orders.length > 0;

    // If Firestore has data, use it as source of truth
    if(hasFirestoreProducts) data.products = prodSnap.docs.map(d => ({id: d.id, ...d.data()}));
    if(hasFirestoreOrders) data.orders = orderSnap.docs.map(d => ({id: d.id, ...d.data()}));

    // If Firestore empty but localStorage has data, sync local to Firestore
    if(!hasFirestoreProducts && hasLocalProducts) {
      fsSyncLocalToFirestore();
    }

    if(settingsSnap.exists) data.settings = settingsSnap.data();
    firestoreReady = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {
    console.log('Firestore init failed, using localStorage:', e);
  }
  overlay.style.display = 'none';
  initialSnapshot = true;
  setupFirestoreListeners();
  renderAll();
  setTimeout(() => { initialSnapshot = false; }, 4000);
}

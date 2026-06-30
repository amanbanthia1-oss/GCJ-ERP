// Dashboard Page

function typeLabel(t){
  const m={'SALE':'Sale','SAMPLE':'Sample','SALE_RETURN':'Sale Return','SAMPLE_RETURN':'Sample Return'};
  return m[t]||t||'—';
}

function renderDashboard(){
  const p = data.products.length;
  const totalStock = data.products.reduce((s,x)=>s+Number(x.stock||0),0);
  const today = new Date().toISOString().split('T')[0];
  const todaySales = data.orders.filter(o=>o.date===today).reduce((s,o)=>s+Number(o.total||0),0);
  document.getElementById('stats').innerHTML = `
    <div class="stat"><div class="stat-num">${p}</div><div class="stat-label">Total Products</div></div>
    <div class="stat"><div class="stat-num">${totalStock}</div><div class="stat-label">Total Stock</div></div>
    <div class="stat"><div class="stat-num">₹${todaySales.toLocaleString('en-IN')}</div><div class="stat-label">Today's Sales</div></div>
    <div class="stat"><div class="stat-num">${data.orders.length}</div><div class="stat-label">Transactions</div></div>
  `;
  renderActivity();
}

function setActivityFilter(el,filter){
  activityFilter = filter;
  document.querySelectorAll('#activityFilter .chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  renderActivity();
}

function renderActivity(){
  let list = data.orders;
  if(activityFilter) list = list.filter(o=>o.type===activityFilter);
  list = list.slice().reverse().slice(0,20);
  const el = document.getElementById('activityList');
  if(!list.length){
    el.innerHTML = '<div class="empty"><h3>No activity</h3><p style="color:var(--stone-500);font-size:13px">Complete a transaction in POS</p></div>';
    return;
  }
  el.innerHTML = '<div class="txn-list">'+list.map(o=>`
    <div class="txn-item" onclick="viewTransaction('${o.id}')">
      <div class="txn-top">
        <div>
          <div class="txn-number">${o.orderNumber}</div>
          <div class="txn-customer">${o.customer||'Walk-in'}</div>
          <div class="txn-type">${typeLabel(o.type)}</div>
        </div>
        <div><span class="badge badge-amber">₹${Number(o.total||0).toLocaleString('en-IN')}</span></div>
      </div>
      <div class="txn-meta">
        <span>${o.date}</span>
        <span>${(o.lines||[]).length} items</span>
        <span>${o.location||'—'}</span>
      </div>
    </div>
  `).join('')+'</div>';
}

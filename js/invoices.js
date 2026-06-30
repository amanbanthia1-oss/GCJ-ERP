// Invoices/Orders Page

function renderHistory(){
  const q = (document.getElementById('historySearch').value||'').toLowerCase();
  const sort = document.getElementById('historySortBy').value;

  let list = data.orders.filter(o=>{
    if(historyFilter && o.type!==historyFilter) return false;
    if(q && !(o.orderNumber+'').toLowerCase().includes(q) && !(o.customer||'').toLowerCase().includes(q)) return false;
    return true;
  });

  const [field,dir] = sort.split('-');
  list.sort((a,b)=>{
    if(field==='date') return dir==='asc'?a.date.localeCompare(b.date):b.date.localeCompare(a.date);
    if(field==='num') return dir==='asc'?a.orderNumber.localeCompare(b.orderNumber):b.orderNumber.localeCompare(a.orderNumber);
    if(field==='amount') return dir==='asc'?Number(a.total||0)-Number(b.total||0):Number(b.total||0)-Number(a.total||0);
    return 0;
  });

  const el = document.getElementById('historyList');
  if(!list.length){
    el.innerHTML = '<div class="empty"><h3>No invoices</h3><p style="color:var(--stone-500);font-size:13px">Complete a transaction</p></div>';
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

function setHistoryFilter(el,filter){
  historyFilter = filter;
  document.querySelectorAll('#historyFilter .chip').forEach(c=>c.classList.remove('active'));
  if(el) el.classList.add('active');
  renderHistory();
}

function showInvoice(order){
  currentInvoiceOrder = order;
  document.getElementById('invoiceModalTitle').textContent = 'Invoice — '+order.orderNumber;

  const settings = data.settings;
  const lines = order.lines||[];
  const itemsHtml = lines.map(l=>`
    <div class="dl-row" style="align-items:center">
      <dt style="display:flex;align-items:center;gap:8px">
        ${l.photo?'<img class="thumb-sm" src="'+l.photo+'" alt="">':''}
        <span>${l.name||l.code||'Item'} × ${l.qty} ${l.qtyType||'Pcs'}</span>
      </dt>
      <dd>₹${Number(l.price*l.qty).toLocaleString('en-IN')}</dd>
    </div>
  `).join('');

  document.getElementById('invoiceDetails').innerHTML = `
    <div class="card">
      <div style="text-align:center;margin-bottom:12px">
        <div style="font-weight:700;font-size:16px">${settings.companyName||'Gian Chand Jain'}</div>
        ${settings.gstin?'<div style="font-size:12px;color:var(--stone-500)">GSTIN: '+settings.gstin+'</div>':''}
      </div>
      <div class="dl">
        <div class="dl-row"><dt>Invoice</dt><dd style="font-weight:700">${order.orderNumber}</dd></div>
        <div class="dl-row"><dt>Date</dt><dd>${order.date}</dd></div>
        <div class="dl-row"><dt>Type</dt><dd>${typeLabel(order.type)}</dd></div>
        <div class="dl-row"><dt>Customer</dt><dd>${order.customer}</dd></div>
        ${order.gstin?'<div class="dl-row"><dt>GSTIN</dt><dd>'+order.gstin+'</dd></div>':''}
        ${order.location?'<div class="dl-row"><dt>Location</dt><dd>'+order.location+'</dd></div>':''}
      </div>
    </div>
    <div class="card">
      <div class="card-title">Items</div>
      ${itemsHtml}
      <div class="dl-row" style="border-top:2px solid var(--stone-300);margin-top:8px;padding-top:8px;font-weight:700">
        <dt>Total</dt>
        <dd>₹${Number(order.total||0).toLocaleString('en-IN')}</dd>
      </div>
    </div>
  `;

  document.getElementById('invoiceModal').classList.add('show');
}

function closeInvoice(){
  document.getElementById('invoiceModal').classList.remove('show');
  currentInvoiceOrder = null;
}

function viewTransaction(id){
  const o = data.orders.find(x=>x.id===id);
  if(o) showInvoice(o);
}

function shareInvoice(){
  if(!currentInvoiceOrder) return;
  const text = buildInvoiceText(currentInvoiceOrder);
  if(navigator.share){
    navigator.share({title:'Invoice '+currentInvoiceOrder.orderNumber,text}).catch(()=>{});
  } else {
    window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');
  }
}

function copyInvoiceText(){
  if(!currentInvoiceOrder) return;
  const text = buildInvoiceText(currentInvoiceOrder);
  navigator.clipboard.writeText(text).then(()=>toast('Copied!')).catch(()=>toast('Copy failed','error'));
}

function printInvoice(){
  if(!currentInvoiceOrder) return;
  const w = window.open('','_blank');
  const s = data.settings;
  w.document.write('<html><head><title>Invoice '+currentInvoiceOrder.orderNumber+'</title>');
  w.document.write('<style>body{font-family:sans-serif;padding:20px;max-width:600px;margin:0 auto}table{width:100%;border-collapse:collapse}td,th{padding:8px;text-align:left;border-bottom:1px solid #ddd}.total{font-weight:700;font-size:18px;margin-top:16px}.right{text-align:right}img{max-width:100%;margin-bottom:16px;border-radius:8px}.thumb{width:32px;height:32px;border-radius:4px;object-fit:cover;vertical-align:middle}</style></head><body>');
  w.document.write('<h2>'+s.companyName+'</h2>');
  w.document.write('<p>Invoice: '+currentInvoiceOrder.orderNumber+' | Date: '+currentInvoiceOrder.date+'</p>');
  w.document.write('<p>Customer: '+currentInvoiceOrder.customer+' | Type: '+typeLabel(currentInvoiceOrder.type)+'</p>');
  w.document.write('<table><tr><th>Item</th><th>Qty</th><th class="right">Amount</th></tr>');
  (currentInvoiceOrder.lines||[]).forEach(l=>{
    const img = l.photo?'<img class="thumb" src="'+l.photo+'"> ':'';
    w.document.write('<tr><td>'+img+(l.name||l.code||'Item')+'</td><td>'+l.qty+' '+((l.qtyType||'Pcs'))+'</td><td class="right">₹'+Number(l.price*l.qty).toLocaleString('en-IN')+'</td></tr>');
  });
  w.document.write('</table>');
  w.document.write('<div class="total">Total: ₹'+Number(currentInvoiceOrder.total||0).toLocaleString('en-IN')+'</div>');
  w.document.write('</body></html>');
  w.document.close();
  w.print();
}

function buildInvoiceText(order){
  const s = data.settings;
  const lines = ['*'+s.companyName+'*','','Invoice: '+order.orderNumber,'Date: '+order.date,'Type: '+typeLabel(order.type),'Customer: '+order.customer,''];
  (order.lines||[]).forEach(l=>{
    lines.push((l.name||l.code||'Item')+' × '+l.qty+' '+(l.qtyType||'Pcs')+' = ₹'+Number(l.price*l.qty).toLocaleString('en-IN'));
  });
  lines.push('','*Total: ₹'+Number(order.total||0).toLocaleString('en-IN')+'*');
  return lines.join('\n');
}

function editInvoice(){
  if(!currentInvoiceOrder) return;
  const o = currentInvoiceOrder;
  currentEditingInvoiceId = o.id;
  document.getElementById('editInvoiceType').value = o.type;
  document.getElementById('editInvoiceDate').value = o.date;
  document.getElementById('editInvoiceCustomer').value = o.customer||'';
  document.getElementById('editInvoiceGstin').value = o.gstin||'';
  document.getElementById('editInvoiceLocation').value = o.location||'';
  document.getElementById('editInvoiceAddress').value = o.address||'';
  document.getElementById('invoiceModal').classList.remove('show');
  document.getElementById('editInvoiceModal').classList.add('show');
}

function saveEditInvoice(){
  if(!currentEditingInvoiceId) return;
  const o = data.orders.find(x=>x.id===currentEditingInvoiceId);
  if(!o) return;
  o.type = document.getElementById('editInvoiceType').value;
  o.date = document.getElementById('editInvoiceDate').value;
  o.customer = document.getElementById('editInvoiceCustomer').value.trim()||'Walk-in';
  o.gstin = document.getElementById('editInvoiceGstin').value.trim()||null;
  o.location = document.getElementById('editInvoiceLocation').value.trim()||null;
  o.address = document.getElementById('editInvoiceAddress').value.trim()||null;
  saveData(data);
  fsSet('orders', o.id, o);
  closeEditInvoice();
  renderAll();
}

function closeEditInvoice(){
  document.getElementById('editInvoiceModal').classList.remove('show');
  currentEditingInvoiceId = null;
}

function deleteInvoice(){
  if(!currentEditingInvoiceId) return;
  if(!confirm('Delete this invoice?')) return;
  data.orders = data.orders.filter(o=>o.id!==currentEditingInvoiceId);
  saveData(data);
  fsDelete('orders', currentEditingInvoiceId);
  closeEditInvoice();
  closeInvoice();
  renderAll();
}

function editInvoiceFromList(id){
  const o = data.orders.find(x=>x.id===id);
  if(!o) return;
  currentInvoiceOrder = o;
  showInvoice(o);
  editInvoice();
}

function deleteInvoiceFromList(id){
  const o = data.orders.find(x=>x.id===id);
  if(!o||!confirm('Delete this invoice?')) return;
  data.orders = data.orders.filter(x=>x.id!==id);
  saveData(data);
  fsDelete('orders', id);
  renderHistory();
}

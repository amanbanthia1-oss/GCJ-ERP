// POS (Point of Sale) Page

function renderPos(){
  renderPosProductList();
  renderPosLines();
}

function updatePosTypeHint(){
  const type = document.getElementById('posType').value;
  const hint = document.getElementById('posStockHint');
  const map = {
    'SALE': 'This will decrease stock',
    'SAMPLE': 'This will decrease stock',
    'SALE_RETURN': 'This will increase stock',
    'SAMPLE_RETURN': 'This will increase stock'
  };
  hint.textContent = map[type]||'';
}

function renderPosProductList(){
  const q = (document.getElementById('posProductSearch').value||'').toLowerCase();
  let list = data.products.filter(p=>{
    if(q && !(p.code+'').toLowerCase().includes(q) && !(p.name||'').toLowerCase().includes(q)) return false;
    return true;
  });

  const posDiv = document.getElementById('posProductList');
  if(!list.length){
    posDiv.innerHTML = '<div class="empty" style="padding:20px"><p>No products found</p><p style="font-size:12px;color:var(--stone-400)">Tap products above to add</p></div>';
    return;
  }
  posDiv.innerHTML = list.map(p=>`
    <div class="pos-product-item" onclick="togglePosLine('${p.id}')">
      ${p.photo?'<img class="pos-product-img" src="'+p.photo+'" alt="">':'<div class="pos-product-img" style="background:var(--stone-100);width:40px;height:40px;border-radius:8px"></div>'}
      <div class="pos-product-info">
        <div class="pos-product-name">${p.name||p.code||'Item'}</div>
        <div class="pos-product-code">${p.code||''}</div>
        <div class="pos-product-price">₹${Number(p.price||0).toLocaleString('en-IN')}</div>
      </div>
    </div>
  `).join('');
}

function togglePosLine(productId){
  const idx = posSelectedLines.findIndex(l=>l.productId===productId);
  if(idx>-1){
    posSelectedLines.splice(idx,1);
  }else{
    const p = data.products.find(x=>x.id===productId);
    if(p) posSelectedLines.push({productId:p.id, qty:1, price:null, qtyType:p.qtyType||'Pcs'});
  }
  renderPosProductList();
  renderPosLines();
}

function adjustPosPrice(i,val){
  if(i<0||i>=posSelectedLines.length)return;
  posSelectedLines[i].price = val?Number(val):null;
  renderPosLines();
}

function adjustPosQtyType(i,val){
  if(i<0||i>=posSelectedLines.length)return;
  posSelectedLines[i].qtyType = val;
  renderPosLines();
}

function renderPosLines(){
  const container = document.getElementById('posLines');
  const totalDiv = document.getElementById('posTotal');
  if(!posSelectedLines.length){
    container.innerHTML = '<div class="empty" style="padding:20px 0"><p>Tap products above to add</p></div>';
    totalDiv.innerHTML = '';
    return;
  }

  let total = 0;
  const lines = posSelectedLines.map((l,i)=>{
    const p = data.products.find(x=>x.id===l.productId);
    const basePrice = p?Number(p.price||0):0;
    const price = l.price!=null ? l.price : basePrice;
    total += price * l.qty;
    return `
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;gap:12px;align-items:flex-start">
          ${p&&p.photo?'<img src="'+p.photo+'" style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0">':'<div style="width:48px;height:48px;border-radius:8px;background:var(--stone-100);flex-shrink:0"></div>'}
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px">${p?p.name||p.code:'Item'}</div>
            <div style="font-size:12px;color:var(--stone-500);margin-top:2px">${p?p.code:''}</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">
              <div>
                <label style="font-size:11px;display:block;margin-bottom:2px">Qty</label>
                <input type="number" value="${l.qty}" onchange="setPosQty(${i},this.value)" style="padding:6px;font-size:13px;width:100%">
              </div>
              <div>
                <label style="font-size:11px;display:block;margin-bottom:2px">Type</label>
                <select onchange="adjustPosQtyType(${i},this.value)" style="padding:6px;font-size:13px;width:100%">
                  <option value="Pcs" ${l.qtyType==='Pcs'?'selected':''}>Pcs</option>
                  <option value="kg" ${l.qtyType==='kg'?'selected':''}>kg</option>
                  <option value="L" ${l.qtyType==='L'?'selected':''}>L</option>
                  <option value="Box" ${l.qtyType==='Box'?'selected':''}>Box</option>
                </select>
              </div>
              <div>
                <label style="font-size:11px;display:block;margin-bottom:2px">Price</label>
                <input type="number" value="${l.price!=null?l.price:basePrice}" onchange="adjustPosPrice(${i},this.value)" placeholder="${basePrice}" style="padding:6px;font-size:13px;width:100%">
              </div>
            </div>
          </div>
          <button class="btn btn-danger btn-sm" onclick="removePosLine(${i})" style="flex-shrink:0;margin-top:4px">✕</button>
        </div>
        <div style="margin-top:12px;text-align:right;font-weight:600;color:var(--amber-dark)">
          ₹${(price * l.qty).toLocaleString('en-IN')}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = lines;
  totalDiv.innerHTML = `<div style="font-size:18px;font-weight:700;color:var(--amber-dark)">Total: ₹${total.toLocaleString('en-IN')}</div>`;
}

function adjustPosLine(i,delta){
  if(i<0||i>=posSelectedLines.length)return;
  const newQty = Math.max(1, posSelectedLines[i].qty + delta);
  posSelectedLines[i].qty = newQty;
  renderPosLines();
}

function removePosLine(i){
  posSelectedLines.splice(i,1);
  renderPosProductList();
  renderPosLines();
}

function setPosQty(i,val){
  if(i<0||i>=posSelectedLines.length)return;
  const q = parseInt(val);
  if(q<1) { removePosLine(i); return; }
  posSelectedLines[i].qty = q;
  renderPosLines();
}

function completePos(){
  if(!posSelectedLines.length){
    toast('Add at least one product','warn');
    return;
  }

  const type = document.getElementById('posType').value;
  if(type==='SALE'||type==='SAMPLE'){
    for(const l of posSelectedLines){
      const p = data.products.find(x=>x.id===l.productId);
      if(p && Number(p.stock||0) < l.qty){
        if(!confirm('Insufficient stock for "'+(p.name||p.code)+'". Available: '+p.stock+' '+(p.qtyType||'Pcs')+', need: '+l.qty+' '+(l.qtyType||p.qtyType||'Pcs')+'. Continue anyway?')) return;
      }
    }
  }

  const customer = document.getElementById('posCustomer').value.trim()||'Walk-in';
  const gstin = document.getElementById('posGstin').value.trim()||null;
  const date = document.getElementById('posDate').value;
  const location = document.getElementById('posLocation').value.trim()||null;
  const address = document.getElementById('posAddress').value.trim()||null;

  let total = 0;
  const lines = posSelectedLines.map(l=>{
    const p = data.products.find(x=>x.id===l.productId);
    const basePrice = p?Number(p.price||0):0;
    const price = l.price!=null ? l.price : basePrice;
    total += price * l.qty;
    return {
      productId: l.productId,
      code: p?p.code:null,
      name: p?p.name||p.code:null,
      price: price,
      qty: l.qty,
      qtyType: l.qtyType || (p?p.qtyType:'Pcs') || 'Pcs',
      photo: p?p.photo:null
    };
  });

  const order = {
    id: genId(),
    orderNumber: 'INV-' + String(data.orders.length+1).padStart(4,'0'),
    type: type,
    customer: customer,
    gstin: gstin,
    date: date,
    location: location,
    address: address,
    lines: lines,
    subtotal: total,
    total: total,
    createdAt: new Date().toISOString()
  };

  // Update stock
  for(const l of posSelectedLines){
    const p = data.products.find(x=>x.id===l.productId);
    if(!p) continue;
    const oldStock = Number(p.stock||0);
    if(type==='SALE'||type==='SAMPLE'){
      p.stock = Math.max(0, oldStock - l.qty);
    } else if(type==='SALE_RETURN'||type==='SAMPLE_RETURN'){
      p.stock = oldStock + l.qty;
    }
    fsSet('products', p.id, p);
  }

  data.orders.push(order);
  saveData(data);
  fsSet('orders', order.id, order);

  showInvoice(order);

  posSelectedLines = [];
  renderAll();
}

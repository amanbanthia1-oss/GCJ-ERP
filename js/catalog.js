// Catalog/Products Page

function renderCatalog(){
  const q = (document.getElementById('catalogSearch').value||'').toLowerCase();
  const sort = document.getElementById('sortBy').value;

  let list = data.products.filter(p=>{
    if(q && !(p.code+'').toLowerCase().includes(q) && !(p.name||'').toLowerCase().includes(q)) return false;
    return true;
  });

  const [field,dir] = sort.split('-');
  list.sort((a,b)=>{
    let va,vb;
    if(field==='code'){va=a.code||'';vb=b.code||'';return dir==='asc'?va.localeCompare(vb):vb.localeCompare(va);}
    if(field==='name'){va=a.name||'';vb=b.name||'';return dir==='asc'?va.localeCompare(vb):vb.localeCompare(va);}
    if(field==='price'){va=Number(a.price||0);vb=Number(b.price||0);return dir==='asc'?va-vb:vb-va;}
    if(field==='stock'){va=Number(a.stock||0);vb=Number(b.stock||0);return dir==='asc'?va-vb:vb-va;}
    return 0;
  });

  const grid = document.getElementById('catalogGrid');
  if(!list.length){
    grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><h3>No products yet</h3><p style="color:var(--stone-500);font-size:13px">Add your first product</p><button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="openAddProduct()">Add product</button></div>';
    return;
  }
  grid.innerHTML = list.map(p=>`
    <div class="pcard" onclick="viewProduct('${p.id}')">
      <div class="pcard-img">${p.photo?'<img src="'+p.photo+'" alt="">':'No photo'}</div>
      <div class="pcard-body">
        <div class="pcard-name">${p.name||p.code||'Untitled'}</div>
        <div class="pcard-code">${p.code||''}</div>
        <div class="pcard-price">${p.price?'₹'+Number(p.price).toLocaleString('en-IN'):'—'}</div>
        <div class="pcard-stock">Stock: ${Number(p.stock||0)} ${p.qtyType||'Pcs'} ${p.location?'· '+p.location:''}</div>
      </div>
    </div>
  `).join('');
}

function viewProduct(id){
  currentProductId = id;
  const p = data.products.find(x=>x.id===id);
  if(!p) return;
  const el = document.getElementById('productDetailContent');
  el.innerHTML = `
    ${p.photo?'<div style="margin-bottom:14px"><img src="'+p.photo+'" style="width:100%;border-radius:12px;aspect-ratio:1;object-fit:cover"></div>':''}
    <div class="dl">
      <div class="dl-row"><dt>Code</dt><dd>${p.code||'—'}</dd></div>
      <div class="dl-row"><dt>Name</dt><dd>${p.name||'—'}</dd></div>
      <div class="dl-row"><dt>Price</dt><dd>${p.price?'₹'+Number(p.price).toLocaleString('en-IN'):'—'}</dd></div>
      <div class="dl-row"><dt>Stock</dt><dd>${Number(p.stock||0)} ${p.qtyType||'Pcs'}</dd></div>
      ${p.location?'<div class="dl-row"><dt>Location</dt><dd>'+p.location+'</dd></div>':''}
      ${p.description?'<div class="dl-row"><dt>Description</dt><dd style="text-align:right;max-width:60%">'+p.description+'</dd></div>':''}
    </div>
  `;
  document.getElementById('deleteProductBtn').style.display = 'inline-flex';
  document.getElementById('productModal').classList.add('show');
}

function closeProduct(){
  document.getElementById('productModal').classList.remove('show');
  currentProductId = null;
}

function deleteProduct(){
  const id = currentProductId;
  if(!id||!confirm('Delete this product?'))return;
  data.products = data.products.filter(p=>p.id!==id);
  saveData(data);
  fsDelete('products', id);
  closeProduct();
  renderAll();
}

function editProduct(){
  if(!currentProductId) return;
  const p = data.products.find(x=>x.id===currentProductId);
  if(!p)return;
  editingProductId = p.id;
  document.getElementById('addProductTitle').textContent = 'Edit Product';
  document.getElementById('prodCode').value = p.code||'';
  document.getElementById('prodCode').readOnly = false;
  document.getElementById('prodCodeError').style.display = 'none';
  document.getElementById('prodName').value = p.name||'';
  document.getElementById('prodPrice').value = p.price||'';
  document.getElementById('prodStock').value = p.stock||0;
  document.getElementById('prodLocation').value = p.location||'';
  document.getElementById('prodDesc').value = p.description||'';
  prodPhotoDataUrl = p.photo||null;
  if(prodPhotoDataUrl){
    document.getElementById('prodPhotoBtn').style.display='none';
    document.getElementById('prodPhotoPreview').style.display='block';
    document.getElementById('prodPhotoImg').src = prodPhotoDataUrl;
  }else{
    document.getElementById('prodPhotoBtn').style.display='flex';
    document.getElementById('prodPhotoPreview').style.display='none';
  }
  document.getElementById('productModal').classList.remove('show');
  document.getElementById('addProductModal').classList.add('show');
}

function openAddProduct(){
  editingProductId = null;
  document.getElementById('addProductTitle').textContent = 'Add Product';
  document.getElementById('prodCode').value = '';
  document.getElementById('prodCode').readOnly = false;
  document.getElementById('prodCodeError').style.display = 'none';
  document.getElementById('prodName').value = '';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodStock').value = '0';
  document.getElementById('prodLocation').value = '';
  document.getElementById('prodDesc').value = '';
  prodPhotoDataUrl = null;
  document.getElementById('prodPhotoBtn').style.display='flex';
  document.getElementById('prodPhotoPreview').style.display='none';
  document.getElementById('addProductModal').classList.add('show');
}

function closeAddProduct(){
  document.getElementById('addProductModal').classList.remove('show');
  editingProductId = null;
}

function handleProdPhoto(e){
  const file = e.target.files[0];
  if(!file)return;
  const reader = new FileReader();
  reader.onload = function(ev){
    const img = new Image();
    img.onload = function(){
      const MAX = 800;
      let w = img.width, h = img.height;
      if(w > MAX || h > MAX){
        if(w > h){ h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      prodPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      document.getElementById('prodPhotoBtn').style.display='none';
      document.getElementById('prodPhotoPreview').style.display='block';
      document.getElementById('prodPhotoImg').src = prodPhotoDataUrl;
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function removeProdPhoto(){
  prodPhotoDataUrl = null;
  document.getElementById('prodPhotoBtn').style.display='flex';
  document.getElementById('prodPhotoPreview').style.display='none';
  document.getElementById('prodPhotoInput').value = '';
}

function saveProductCore() {
  const code = document.getElementById('prodCode').value.trim();
  const name = document.getElementById('prodName').value.trim();
  const price = document.getElementById('prodPrice').value.trim();
  const stock = document.getElementById('prodStock').value.trim();
  const location = document.getElementById('prodLocation').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();

  if(!code){
    document.getElementById('prodCodeError').style.display = 'block';
    return false;
  }

  if(!editingProductId){
    const exists = data.products.find(p=>p.code===code);
    if(exists){
      document.getElementById('prodCodeError').style.display = 'block';
      document.getElementById('prodCodeError').textContent = 'Code already exists';
      return false;
    }
  }

  const id = editingProductId || genId();
  const p = editingProductId ? data.products.find(x=>x.id===editingProductId) : {};
  p.id = id;
  p.code = code;
  p.name = name;
  p.price = price?Number(price):0;
  p.stock = stock?Number(stock):0;
  p.location = location;
  p.description = desc;
  p.photo = prodPhotoDataUrl;

  if(!editingProductId) data.products.push(p);
  saveData(data);
  fsSet('products', id, p);
  return true;
}

function saveProduct(){
  if(saveProductCore()){
    closeAddProduct();
    renderAll();
  }
}

function saveProductAndContinue(){
  if(saveProductCore()){
    document.getElementById('prodCode').value = '';
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodStock').value = '0';
    document.getElementById('prodLocation').value = '';
    document.getElementById('prodDesc').value = '';
    prodPhotoDataUrl = null;
    document.getElementById('prodPhotoBtn').style.display='flex';
    document.getElementById('prodPhotoPreview').style.display='none';
    renderCatalog();
  }
}

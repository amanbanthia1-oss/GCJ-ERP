// Main App Logic - Init & Page Routing

function renderAll(){
  showPage(currentPage);
}

function showPage(page){
  currentPage = page;
  document.querySelectorAll('.content').forEach(el=>el.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-page="'+page+'"]').forEach(el=>el.classList.add('active'));
  document.querySelectorAll('.mobile-nav a').forEach(el=>el.classList.remove('active'));

  const titles={dashboard:'Dashboard',catalog:'Products',pos:'POS',history:'Invoices',settings:'Settings'};
  const subs={dashboard:'Gian Chand Jain ERP',catalog:data.products.length+' products',pos:'New Transaction',history:data.orders.length+' invoices',settings:'Business settings'};
  document.getElementById('pageTitle').textContent = titles[page];
  document.getElementById('pageSub').textContent = subs[page];
  document.getElementById('headerAction').innerHTML = page==='catalog'?'<button class="btn btn-primary btn-sm" onclick="openAddProduct()">+ Add</button>':'';

  if(page==='dashboard'){renderDashboard()}
  if(page==='catalog'){renderCatalog()}
  if(page==='pos'){renderPos()}
  if(page==='history'){renderHistory()}
  if(page==='settings'){loadSettings()}
}

document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('posDate').valueAsDate = new Date();
  loadSettings();
  renderAll();
  initFromFirestore();
});

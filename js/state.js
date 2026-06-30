// Global State & Data

function defaultData(){
  return {
    products:[],
    orders:[],
    settings:{companyName:'Gian Chand Jain',gstin:'',address:'',phone:'',email:''}
  }
}

function genId(){
  return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
}

// Global variables
const STORAGE_KEY = 'gcj_data_v3';
let data = null;
let db = null;
let firestoreReady = false;
let localChange = false;
let initialSnapshot = true;

let currentProductId = null;
let editingProductId = null;
let prodPhotoDataUrl = null;
let posSelectedLines = [];
let currentInvoiceOrder = null;
let currentEditingInvoiceId = null;
let activityFilter = '';
let historyFilter = '';
let currentPage = 'dashboard';

function getData(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY))||defaultData();
  }catch{
    return defaultData();
  }
}

function saveData(d){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch(e) {
    toast('Error saving: ' + e.message, 'error');
  }
}

function toast(msg, type='success'){
  const t = document.createElement('div');
  const bg = type==='error' ? 'var(--amber-dark)' : type==='warn' ? '#b45309' : '#166534';
  t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);z-index:99999;background:${bg};color:#fff;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:500;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.18);pointer-events:none;transition:opacity .3s`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300)},2200);
}

// Initialize data on load
data = getData();

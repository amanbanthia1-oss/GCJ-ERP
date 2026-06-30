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
    alert('Error saving data: ' + e.message + '. Try reducing photo sizes or clearing local storage.');
  }
}

// Initialize data on load
data = getData();

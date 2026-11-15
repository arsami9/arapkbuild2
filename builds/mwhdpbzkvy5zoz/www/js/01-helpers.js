/* ================= HELPERS ================= */
function $(sel){return document.querySelector(sel);}
/* ---------- Safe storage: memory + localStorage + IndexedDB mirror ---------- */
const mem={};
let idb=null,storageOK=false,idbOK=false,persistGranted=false;
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);return true;}catch(e){return false;}}
function lsDel(k){try{localStorage.removeItem(k);}catch(e){}}
function idbPut(k,v){if(!idb)return;try{idb.transaction('kv','readwrite').objectStore('kv').put(v,k);}catch(e){}}
function idbDel(k){if(!idb)return;try{idb.transaction('kv','readwrite').objectStore('kv').delete(k);}catch(e){}}
function openIdb(){return new Promise(res=>{
  try{
    if(!window.indexedDB)return res(null);
    const r=indexedDB.open('mms_db',1);
    r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv');if(!d.objectStoreNames.contains('backups'))d.createObjectStore('backups');};
    r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);r.onblocked=()=>res(null);
    setTimeout(()=>res(null),3000);
  }catch(e){res(null);}
});}
function idbAll(){return new Promise(res=>{
  if(!idb)return res({});
  try{
    const out={};const c=idb.transaction('kv','readonly').objectStore('kv').openCursor();
    c.onsuccess=()=>{const cur=c.result;if(cur){out[cur.key]=cur.value;cur.continue();}else res(out);};
    c.onerror=()=>res({});
  }catch(e){res({});}
});}
function testStorage(){try{const k='mms__test';localStorage.setItem(k,'1');const ok=localStorage.getItem(k)==='1';localStorage.removeItem(k);return ok;}catch(e){return false;}}
async function hydrateStorage(){
  idb=await openIdb();
  idbOK=!!idb;
  storageOK=testStorage();
  const fromIdb=await idbAll();
  const fromLs={};
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('mms_')===0)fromLs[k]=localStorage.getItem(k);}}catch(e){}
  const tL=parseFloat(fromLs.mms__ts)||0,tI=parseFloat(fromIdb.mms__ts)||0;
  const primary=tI>tL?fromIdb:fromLs,other=tI>tL?fromLs:fromIdb;
  Object.keys(other).forEach(k=>{mem[k]=other[k];});
  Object.keys(primary).forEach(k=>{mem[k]=primary[k];});
  flushAll();
  try{if(navigator.storage&&navigator.storage.persist){persistGranted=await navigator.storage.persist();}}catch(e){}
}
function flushAll(){Object.keys(mem).forEach(k=>{lsSet(k,mem[k]);idbPut(k,mem[k]);});}
function load(key,def){
  try{
    const raw=(key in mem)?mem[key]:lsGet(key);
    if(raw===null||raw===undefined)return def;
    const v=JSON.parse(raw);return v===null?def:v;
  }catch(e){return def;}
}
function save(key,val){
  const raw=JSON.stringify(val);
  mem[key]=raw;
  const ts=String(Date.now());mem.mms__ts=ts;
  const ok=lsSet(key,raw);lsSet('mms__ts',ts);
  idbPut(key,raw);idbPut('mms__ts',ts);
  if(!ok&&storageOK){storageOK=false;}
  updateStorageWarn();
  return ok||idbOK;
}
function updateStorageWarn(){
  const el=document.getElementById('storageWarn');if(!el)return;
  el.classList.toggle('hidden',storageOK||idbOK);
}
function wipeStorage(){
  Object.keys(mem).forEach(k=>{lsDel(k);idbDel(k);delete mem[k];});
  try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.indexOf('mms_')===0)localStorage.removeItem(k);}}catch(e){}
}
function genId(){return 'id'+Date.now()+Math.floor(Math.random()*10000);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function num(v){const n=parseFloat(v);return isNaN(n)?0:n;}
function money(n){return '৳'+num(n).toFixed(2).replace(/\.00$/,'');}
function pad2(n){return String(n).padStart(2,'0');}
function localDate(d){d=d||new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function daysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return localDate(d);}
function fmtDate(s){if(!s)return '';const p=s.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:s;}
function waNumber(phone){let d=String(phone||'').replace(/\D/g,'');if(!d)return '';if(d.startsWith('880'))return d;if(d.startsWith('0'))return '88'+d;return d;}

const ADMIN_ID='AdminAR';
let users,products,patients,doctors,memos,family,shopInfo,settings,session,darkMode,suppliers,purchases,expenses;
let currentSelection=[];
let currentReportFilter='month';
let productFilter='all',productQuery='',patientQuery='',patientFilter='all',doctorQuery='',memoQuery='',memoFilter='all';

/* TOAST */
let toastTimer;
function toast(msg,type){
  let t=document.getElementById('toastBox');
  if(!t){t=document.createElement('div');t.id='toastBox';document.body.appendChild(t);}
  t.textContent=msg;
  t.className='toast show'+(type==='error'?' error':'');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

/* MODAL */
function openModal(html){$('#modalBox').innerHTML=html;$('#modalOverlay').classList.remove('hidden');}
function closeModal(){$('#modalOverlay').classList.add('hidden');$('#modalBox').innerHTML='';}

function togglePw(id,btn){const i=document.getElementById(id);i.type=i.type==='password'?'text':'password';btn.textContent=i.type==='password'?'👁️':'🙈';}


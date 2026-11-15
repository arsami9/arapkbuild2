/* ================= INIT ================= */
async function init(){
  await hydrateStorage();
  loadState();
  setupAuthTabs();
  setupAuthForms();
  setupDrawerAndNav();
  $('#alertBtn').addEventListener('click',()=>navigate('products',{filter:'alert'}));
  $('#modalOverlay').addEventListener('click',e=>{if(e.target.id==='modalOverlay')closeModal();});
  window.addEventListener('pagehide',flushAll);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushAll();});
  updateStorageWarn();
  createSnapshot();
  if(session) startApp();
}
function loadState(){
  users=load('mms_users',[]);
  products=load('mms_products',[]);
  patients=load('mms_patients',[]);
  doctors=load('mms_doctors',[]);
  memos=load('mms_memos',[]);
  suppliers=load('mms_suppliers',[]);purchases=load('mms_purchases',[]);expenses=load('mms_expenses',[]);
  family=load('mms_family',{title:'👪 Our Model Family',body:'Model Medicine Shop is more than just a pharmacy — we are a family built on trust, care, and service to our community. For years we have worked hard to provide genuine medicines, honest advice, and friendly service to every patient who walks through our doors. Our Model Family consists of dedicated staff, trusted doctors, and loyal patients who believe in quality healthcare for everyone.'});
  shopInfo=Object.assign({icon:'💊',name:'MODEL MEDICINE SHOP',address:'',phone:'',license:'',note:''},load('mms_shopinfo',{}));
  settings=Object.assign({low:10,expDays:30,paper:'A4'},load('mms_settings',{}));
  profiles=load('mms_profiles',{});
  darkMode=!!load('mms_darkmode',false);
  session=load('mms_session',null);
  document.body.classList.toggle('dark-mode',darkMode);
  seedDemoData();
  seedCatalogV4();
  migrateData();
  applyShopInfo();
}

function migrateData(){
  memos.forEach(m=>{
    ['subtotal','totalDiscount','grandTotal','paid','due'].forEach(k=>m[k]=num(m[k]));
    m.extraDiscount=num(m.extraDiscount);
    if(!Array.isArray(m.payments)) m.payments=m.paid>0?[{date:m.date,amount:m.paid}]:[];
    (m.items||[]).forEach(i=>{i.cost=num(i.cost);});
  });
  save('mms_memos',memos);
  patients.forEach(p=>{if(!Array.isArray(p.items))p.items=[];p.paid=num(p.paid);});
  {let mx=0;patients.forEach(p=>{if(num(p.sl)>mx)mx=num(p.sl);});patients.forEach(p=>{if(!p.sl)p.sl=++mx;});}
  save('mms_patients',patients);
}

function applyShopInfo(){
  $('#appTitleText').textContent=shopInfo.icon+' '+shopInfo.name.toUpperCase();
  $('#authLogoIcon').textContent=shopInfo.icon;
  $('#authShopName').textContent=shopInfo.name.toUpperCase();
  document.title=shopInfo.name;
}
function getAdminPassword(){return load('mms_adminpass','Admin1234');}

function seedDemoData(){
  if(load('mms_seeded',false)) return;
  if(products.length===0){
    const p1={id:genId(),name:'Napa Extra',company:'Beximco Pharmaceuticals',strength:'500mg+65mg',boxQty:100,mrp:1.5,cost:1.1,stock:80,expiry:'2027-12-31'};
    const p2={id:genId(),name:'Seclo',company:'Square Pharmaceuticals',strength:'20mg',boxQty:50,mrp:7,cost:5.5,stock:8,expiry:'2027-03-30'};
    const p3={id:genId(),name:'Fexo',company:'Square Pharmaceuticals',strength:'120mg',boxQty:30,mrp:8,cost:6,stock:40,expiry:'2027-06-01'};
    products.push(p1,p2,p3);
    patients.push({id:genId(),name:'Karim Mia',address:'Mirpur, Dhaka',phone:'01711111111',products:[{id:p1.id,name:p1.name}],createdAt:localDate()});
    doctors.push({id:genId(),name:'Dr. Rahim Uddin',address:'City Hospital, Dhaka',phone:'01911111111',products:[]});
    save('mms_products',products);save('mms_patients',patients);save('mms_doctors',doctors);
  }
  save('mms_seeded',true);
}


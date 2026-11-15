/* ================= NAVIGATION HISTORY (Back / Forward) ================= */
var navStack=[],navIdx=-1,skipPop=false,memoDraft=null,profiles={};
const PAGE_TITLES={operations:'📦 Purchase & Accounts',home:'🏠 Home',products:'💊 Products',patients:'🧑‍🤝‍🧑 Patients',patient:'📋 Patient & Rx',memo:'🧾 Memo',dues:'💰 Dues',doctors:'👨‍⚕️ Doctors',reports:'📊 Reports',family:'👪 Family',settings:'⚙️ Settings',admin:'🛠️ Admin',profile:'👤 My Profile'};
function navigate(page,opts){
  opts=opts||{};
  navStack=navStack.slice(0,navIdx+1);navStack.push({page:page,opts:opts});navIdx=navStack.length-1;
  try{history[navIdx===0?'replaceState':'pushState']({i:navIdx},'');}catch(e){}
  _navigate(page,opts);updateNavBar();
}
function navGoto(i){if(i<0||i>=navStack.length)return;navIdx=i;const e=navStack[i];_navigate(e.page,e.opts);updateNavBar();}
function navBack(){if(navIdx<=0)return;try{history.back();}catch(e){navGoto(navIdx-1);}}
function navForward(){if(navIdx>=navStack.length-1)return;try{history.forward();}catch(e){navGoto(navIdx+1);}}
function updateNavBar(){
  const b=$('#nbBack'),f=$('#nbFwd');if(!b)return;
  b.disabled=navIdx<=0;f.disabled=navIdx>=navStack.length-1;
  const cur=navStack[navIdx];$('#nbTitle').textContent=cur?(PAGE_TITLES[cur.page]||''):'';
}
function setupNavBar(){
  $('#nbBack').onclick=navBack;$('#nbFwd').onclick=navForward;$('#nbHome').onclick=()=>navigate('home');
  $('#profileBtn').onclick=()=>navigate('profile');
  document.querySelector('.drawer-profile').onclick=()=>navigate('profile');
  window.addEventListener('popstate',e=>{
    if(skipPop){skipPop=false;return;}
    if(!session)return;
    if(!$('#modalOverlay').classList.contains('hidden')||$('#drawer').classList.contains('open')){closeModal();closeDrawer();skipPop=true;try{history.go(1);}catch(x){}return;}
    const i=e.state&&typeof e.state.i==='number'?e.state.i:-1;
    if(i>=0&&i<navStack.length)navGoto(i);
  });
  const t=$('#toTop');t.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
  window.addEventListener('scroll',()=>t.classList.toggle('show',window.scrollY>400),{passive:true});
}
function captureMemoDraft(){
  if(!$('#memoPatientName'))return;
  const f={sel:$('#memoPatientSelect').value,name:$('#memoPatientName').value,phone:$('#memoPatientPhone').value,date:$('#memoDate').value,method:$('#memoMethod').value,pct:$('#memoDiscPct').value,extra:$('#memoExtraDisc').value,paid:$('#memoPaidAmount').value,note:$('#memoNote').value};
  memoDraft=(memoItems.length||f.name||f.phone||f.note)?{items:memoItems.map(i=>Object.assign({},i)),f:f}:null;
}
function restoreMemoDraft(){
  if(!memoDraft)return;
  const d=memoDraft,f=d.f;
  memoItems=d.items;
  $('#memoPatientSelect').value=f.sel;$('#memoPatientName').value=f.name;$('#memoPatientPhone').value=f.phone;
  if(f.date)$('#memoDate').value=f.date;
  $('#memoMethod').value=f.method;$('#memoDiscPct').value=f.pct;$('#memoExtraDisc').value=f.extra;$('#memoPaidAmount').value=f.paid;$('#memoNote').value=f.note;
  renderMemoItems();toast('Your unfinished memo was restored');
}

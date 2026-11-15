/* ================= NAVIGATION ================= */
function setupDrawerAndNav(){
  setupNavBar();
  $('#menuBtn').addEventListener('click',openDrawer);
  $('#drawerOverlay').addEventListener('click',closeDrawer);
  $('#logoutBtn').addEventListener('click',logout);
  $('#drawerLogout').addEventListener('click',logout);
  document.querySelectorAll('.drawer li[data-page]').forEach(li=>li.addEventListener('click',()=>navigate(li.dataset.page)));
  document.querySelectorAll('.bottom-nav button').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.page)));
}
function openDrawer(){
  const r=$('.app-container').getBoundingClientRect();
  $('#drawer').style.left=Math.max(0,r.left)+'px';
  $('#drawer').classList.add('open');$('#drawerOverlay').classList.add('show');
}
function closeDrawer(){$('#drawer').classList.remove('open');$('#drawerOverlay').classList.remove('show');}

function _navigate(page,opts){
  opts=opts||{};
  if(!$('#page-memo').classList.contains('hidden')&&page!=='memo')captureMemoDraft();
  save('mms_lastnav',{page:page,opts:opts});
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById('page-'+page).classList.remove('hidden');
  const navPage=page==='patient'?'patients':page;
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===navPage));
  document.querySelectorAll('.drawer li').forEach(li=>li.classList.toggle('active',li.dataset.page===navPage));
  closeDrawer();
  window.scrollTo(0,0);
  updateAlertBadge();
  if(page==='home')renderHome();
  else if(page==='products'){productQuery='';productFilter=opts.filter||'all';renderProducts();}
  else if(page==='patients'){patientQuery='';patientFilter='all';renderPatients();}
  else if(page==='patient'){editItemId=null;renderPatientPage(opts.id);}
  else if(page==='memo'){renderMemo();restoreMemoDraft();}
  else if(page==='profile')renderProfile();
  else if(page==='dues')renderDues();
  else if(page==='doctors'){doctorQuery='';renderDoctors();}
  else if(page==='operations')renderOperations();
  else if(page==='family')renderFamily();
  else if(page==='reports')renderReports();
  else if(page==='settings')renderSettings();
  else if(page==='admin')renderAdmin();
}


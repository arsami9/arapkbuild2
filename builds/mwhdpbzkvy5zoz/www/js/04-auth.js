/* ================= AUTH ================= */
function setupAuthTabs(){
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      $('#loginForm').classList.toggle('hidden',btn.dataset.tab!=='login');
      $('#registerForm').classList.toggle('hidden',btn.dataset.tab!=='register');
    });
  });
}
function setupAuthForms(){
  $('#loginForm').addEventListener('submit',function(e){
    e.preventDefault();
    const id=$('#loginId').value.trim(), pass=$('#loginPassword').value.trim(), errorEl=$('#loginError');
    errorEl.textContent='';
    if(!id||!pass){errorEl.textContent='Please enter both Name/ID and Password to login.';return;}
    if(id.toLowerCase()===ADMIN_ID.toLowerCase()){
      if(pass===getAdminPassword()){session={id:ADMIN_ID,role:'admin'};save('mms_session',session);startApp();}
      else errorEl.textContent='Incorrect admin password.';
      return;
    }
    const user=users.find(u=>u.id.toLowerCase()===id.toLowerCase());
    if(!user){errorEl.textContent='No account found with this ID. Please register first.';return;}
    if(user.active===false){errorEl.textContent='This account is disabled. Please contact the administrator.';return;}
    if(user.password!==pass){errorEl.textContent='Incorrect password. Please try again.';return;}
    session={id:user.id,role:'user'};save('mms_session',session);startApp();
  });
  $('#registerForm').addEventListener('submit',function(e){
    e.preventDefault();
    const id=$('#regId').value.trim(),pass=$('#regPassword').value.trim(),phone=$('#regPhone').value.trim(),code=$('#regCode').value.trim();
    const errorEl=$('#regError'),successEl=$('#regSuccess');
    errorEl.textContent='';successEl.textContent='';
    if(!id){errorEl.textContent='Please enter your Name/ID.';return;}
    if(id.toLowerCase()===ADMIN_ID.toLowerCase()){errorEl.textContent='This ID is reserved. Choose another ID.';return;}
    if(users.find(u=>u.id.toLowerCase()===id.toLowerCase())){errorEl.textContent='This ID already exists. Please login instead.';return;}
    if(!/^\d{8,12}$/.test(pass)){errorEl.textContent='Password must be 8-12 digits (numbers only).';return;}
    if(!/^\d{10,14}$/.test(phone)){errorEl.textContent='Please enter a valid phone number.';return;}
    if(code!=='MARR0000'){errorEl.textContent='Invalid secret code. Registration failed.';return;}
    users.push({id,password:pass,phone,active:true,createdAt:localDate(),role:'staff'});
    save('mms_users',users);
    successEl.textContent='🎉 Registration successful! Redirecting to login...';
    $('#registerForm').reset();
    setTimeout(()=>{document.querySelector('.tab-btn[data-tab="login"]').click();$('#loginId').value=id;successEl.textContent='';},1600);
  });
}
function startApp(){
  $('#authScreen').classList.add('hidden');
  $('#appScreen').classList.remove('hidden');
  $('#menuBtn').style.visibility='visible';
  $('#headerRightIcons').classList.remove('hidden');
  $('#headerSpacer').classList.add('hidden');
  $('#adminNavItem').classList.toggle('hidden',session.role!=='admin');
  applyProfile();
  $('#subNav').classList.remove('hidden');
  document.documentElement.style.setProperty('--hh',document.querySelector('.app-header').offsetHeight+'px');
  navStack=[];navIdx=-1;memoDraft=null;
  const ln=load('mms_lastnav',null);
  const ok=ln&&ln.page&&document.getElementById('page-'+ln.page)&&(ln.page!=='patient'||(ln.opts&&patients.some(x=>x.id===ln.opts.id)))&&ln.page!=='admin'||(ln&&ln.page==='admin'&&session.role==='admin');
  navigate(ok?ln.page:'home',ok?ln.opts:{});
}
function showAuth(){
  $('#authScreen').classList.remove('hidden');
  $('#appScreen').classList.add('hidden');
  $('#menuBtn').style.visibility='hidden';
  $('#headerRightIcons').classList.add('hidden');
  $('#headerSpacer').classList.remove('hidden');
  $('#subNav').classList.add('hidden');
  $('#loginPassword').value='';$('#loginError').textContent='';
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
}
function logout(){
  if(!confirm('Are you sure you want to logout?'))return;
  flushAll();createSnapshot();
  session=null;save('mms_session',null);save('mms_lastnav',null);
  closeModal();closeDrawer();showAuth();
  toast(storageOK||idbOK?'Logged out. All your data is saved.':'Logged out. Data is kept only until you close the app. Download a backup!');
}


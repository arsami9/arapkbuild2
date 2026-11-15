/* ================= SETTINGS ================= */
function renderSettings(){
  const admin=session.role==='admin';
  $('#page-settings').innerHTML=`
    <div class="page-header"><h2>⚙️ Settings</h2></div>
    <div class="section-title">🎨 Appearance</div>
    <div class="card"><div class="switch-row">
      <div><strong>Dark Mode</strong><p>Switch between light and dark theme</p></div>
      <label class="switch"><input type="checkbox" id="darkModeToggle" ${darkMode?'checked':''}><span class="slider-toggle"></span></label>
    </div></div>

    <div class="section-title">🧾 Memo & Stock Preferences</div>
    <div class="card"><form id="prefForm">
      <label for="prefPaper">Print paper size</label>
      <select id="prefPaper"><option value="A4" ${settings.paper==='A4'?'selected':''}>A4 (normal printer)</option><option value="80" ${settings.paper==='80'?'selected':''}>80mm (thermal receipt printer)</option></select>
      <div class="row2">
        <div><label for="prefLow">Low stock alert (≤)</label><input type="number" min="0" id="prefLow" value="${num(settings.low)}"></div>
        <div><label for="prefExp">Expiry alert (days)</label><input type="number" min="1" id="prefExp" value="${num(settings.expDays)}"></div>
      </div>
      <button type="submit" class="btn-primary">Save Preferences</button>
    </form></div>

    <div class="section-title">🛡️ Data Safety</div>
    <div class="card">
      <div class="sum-line"><span>Main storage</span><b style="color:${storageOK?'var(--success)':'var(--danger)'}">${storageOK?'✅ Working':'❌ Blocked'}</b></div>
      <div class="sum-line"><span>Second copy (mirror)</span><b style="color:${idbOK?'var(--success)':'var(--danger)'}">${idbOK?'✅ Working':'⚠️ Unavailable'}</b></div>
      <div class="sum-line"><span>Protected from auto-clean</span><b>${persistGranted?'✅ Yes':'⚠️ Not guaranteed'}</b></div>
      <div class="sum-line"><span>Last backup file</span><b>${load('mms_lastbackup','')?esc(fmtDate(load('mms_lastbackup',''))):'Never'}</b></div>
      <p class="hint" style="margin-top:8px">Every change is saved instantly, a second copy is kept automatically, and logging out never erases anything. ${storageOK||idbOK?'':'<b style="color:var(--danger)">This browser blocks storage, so data is lost when the app closes. Open the app in Chrome or install the APK, and download backups.</b>'}</p>
      ${admin?`<button class="btn-outline btn-block" style="margin-top:10px" onclick="backupData()">⬇️ Download Backup Now</button>
      <div class="section-title" style="font-size:13px;margin:16px 0 4px">🕑 Automatic restore points</div><div id="snapList"></div>`:''}
    </div>

    <div class="section-title">🔒 Change Password</div>
    <div class="card"><form id="changePassForm">
      <label for="currentPass">Current Password</label><input type="password" id="currentPass">
      <label for="newPass">New Password</label><input type="password" id="newPass" placeholder="${admin?'Min 6 characters':'8-12 digits only'}">
      <label for="confirmPass">Confirm New Password</label><input type="password" id="confirmPass">
      <p class="error-msg" id="passError"></p>
      <button type="submit" class="btn-primary">Update Password</button>
    </form></div>

    ${admin?`
    <div class="section-title">🏪 Shop Information (shown on memo)</div>
    <div class="card"><form id="shopInfoForm">
      <label for="shopIcon">Shop Icon (Emoji)</label><input type="text" id="shopIcon" value="${esc(shopInfo.icon)}" maxlength="4">
      <label for="shopName">Shop Name</label><input type="text" id="shopName" value="${esc(shopInfo.name)}">
      <label for="shopAddress">Address</label><input type="text" id="shopAddress" value="${esc(shopInfo.address)}">
      <label for="shopPhone">Phone Number</label><input type="text" id="shopPhone" value="${esc(shopInfo.phone)}">
      <label for="shopLicense">Drug License No. (optional)</label><input type="text" id="shopLicense" value="${esc(shopInfo.license)}">
      <label for="shopNote">Memo footer message (optional)</label><input type="text" id="shopNote" value="${esc(shopInfo.note)}" placeholder="Get well soon! Return policy...">
      <button type="submit" class="btn-primary">Save Shop Info</button>
    </form></div>

    <div class="section-title">💾 Backup & Restore</div>
    <div class="card">
      <p class="hint" style="margin-bottom:10px;">Data lives on this device. Download a backup file regularly and keep it safe (Google Drive, WhatsApp, etc.) so you can move to a new phone.</p>
      <div class="stack">
        <button class="btn-outline btn-block" onclick="backupData()">⬇️ Download Backup</button>
        <div class="file-input-wrap"><button class="btn-outline btn-block" type="button">⬆️ Restore from Backup</button><input type="file" accept=".json" onchange="restoreData(event)"></div>
      </div>
    </div>`:''}

    <div class="section-title">ℹ️ About</div>
    <div class="card"><p style="font-size:13px;line-height:1.7;"><strong>${esc(shopInfo.icon)} ${esc(shopInfo.name)}</strong><br>Pharmacy Management App · Version 4.2<br><span class="credit">Created by ABDUR ROHMAN</span><br>Products, Patients, Doctors, Memos, Dues and Sales Reports in one place.</p></div>`;

  renderSnapshots();
  $('#darkModeToggle').onchange=function(){
    darkMode=this.checked;save('mms_darkmode',darkMode);
    document.body.classList.toggle('dark-mode',darkMode);toast(darkMode?'Dark mode on':'Dark mode off');
  };
  $('#prefForm').onsubmit=function(e){
    e.preventDefault();
    settings.paper=$('#prefPaper').value;settings.low=Math.max(0,num($('#prefLow').value));settings.expDays=Math.max(1,num($('#prefExp').value)||30);
    save('mms_settings',settings);updateAlertBadge();toast('Preferences saved!');
  };
  $('#changePassForm').onsubmit=function(e){
    e.preventDefault();
    const cur=$('#currentPass').value.trim(),nw=$('#newPass').value.trim(),cf=$('#confirmPass').value.trim(),err=$('#passError');err.textContent='';
    if(!cur||!nw||!cf){err.textContent='Please fill all fields.';return;}
    if(nw!==cf){err.textContent='New passwords do not match.';return;}
    if(admin){
      if(cur!==getAdminPassword()){err.textContent='Current password is incorrect.';return;}
      if(nw.length<6){err.textContent='New password must be at least 6 characters.';return;}
      save('mms_adminpass',nw);toast('Admin password updated!');
    }else{
      const u=users.find(x=>x.id===session.id);
      if(!u||cur!==u.password){err.textContent='Current password is incorrect.';return;}
      if(!/^\d{8,12}$/.test(nw)){err.textContent='New password must be 8-12 digits.';return;}
      u.password=nw;save('mms_users',users);toast('Password updated!');
    }
    $('#changePassForm').reset();
  };
  if(admin){
    $('#shopInfoForm').onsubmit=function(e){
      e.preventDefault();
      shopInfo.icon=$('#shopIcon').value.trim()||'💊';
      shopInfo.name=$('#shopName').value.trim()||'MODEL MEDICINE SHOP';
      shopInfo.address=$('#shopAddress').value.trim();shopInfo.phone=$('#shopPhone').value.trim();
      shopInfo.license=$('#shopLicense').value.trim();shopInfo.note=$('#shopNote').value.trim();
      save('mms_shopinfo',shopInfo);applyShopInfo();toast('Shop information updated!');
    };
  }
}
function collectBackup(){
  return {mms_users:users,mms_products:products,mms_patients:patients,mms_doctors:doctors,mms_memos:memos,mms_family:family,mms_shopinfo:shopInfo,mms_settings:settings,mms_adminpass:getAdminPassword(),mms_profiles:profiles,mms_memocounter:load('mms_memocounter',0),mms_suppliers:suppliers,mms_purchases:purchases,mms_expenses:expenses,mms_admin_notice:load('mms_admin_notice',''),mms_update_log:load('mms_update_log',[])};
}
function backupData(){
  downloadBlob(new Blob([JSON.stringify(collectBackup(),null,2)],{type:'application/json'}),'mms_backup_'+localDate()+'.json');
  save('mms_lastbackup',localDate());
  toast('Backup downloaded!');
  if(session&&!$('#page-settings').classList.contains('hidden'))renderSettings();
  if(session&&!$('#page-home').classList.contains('hidden'))renderHome();
}
function restoreFromObject(data){
  Object.keys(data).forEach(k=>{if(k.indexOf('mms_')===0&&k!=='mms__ts'&&k!=='mms_session')save(k,data[k]);});
  save('mms_seeded',true);
  loadState();
  updateAlertBadge();
  if(session)renderSettings();
}
function restoreData(event){
  const file=event.target.files[0];if(!file)return;
  if(!confirm('Restoring will replace current data with the backup. Continue?')){event.target.value='';return;}
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const data=JSON.parse(e.target.result);
      if(!data.mms_products&&!data.mms_users){toast('Invalid backup file.','error');return;}
      createSnapshot(true);
      restoreFromObject(data);
      toast('Data restored successfully!');
    }catch(err){toast('Failed to read backup file.','error');}
  };
  reader.readAsText(file);
  event.target.value='';
}
/* automatic restore points kept inside the app (IndexedDB) */
function createSnapshot(force){
  if(!idb)return;
  if(!(products.length||patients.length||memos.length||users.length||doctors.length))return;
  try{
    const now=Date.now(),last=parseFloat(load('mms_lastsnap',0))||0;
    if(!force&&now-last<30*60*1000)return;
    save('mms_lastsnap',now);
    const d=new Date(),key=localDate(d)+' '+pad2(d.getHours())+':'+pad2(d.getMinutes());
    const st=idb.transaction('backups','readwrite').objectStore('backups');
    st.put(JSON.stringify(collectBackup()),key);
    const kr=st.getAllKeys();
    kr.onsuccess=()=>{const keys=kr.result.slice().sort();while(keys.length>10){st.delete(keys.shift());}};
  }catch(e){}
}
function renderSnapshots(){
  const box=document.getElementById('snapList');if(!box)return;
  if(!session||session.role!=='admin'||!idb){box.innerHTML='';return;}
  try{
    const r=idb.transaction('backups','readonly').objectStore('backups').getAllKeys();
    r.onsuccess=()=>{
      const keys=r.result.slice().sort().reverse();
      box.innerHTML=keys.length===0?'<p class="hint">No automatic restore points yet.</p>':keys.map(k=>`<div class="switch-row"><div><strong style="font-size:13px">${esc(k)}</strong></div><button class="btn-outline" style="flex:0 0 auto" onclick="restoreSnapshot('${esc(k)}')">Restore</button></div>`).join('');
    };
  }catch(e){box.innerHTML='';}
}
function restoreSnapshot(key){
  if(!idb)return;
  try{
    const r=idb.transaction('backups','readonly').objectStore('backups').get(key);
    r.onsuccess=()=>{
      if(!r.result){toast('Restore point not found.','error');return;}
      if(!confirm('Restore data from '+key+'? Your current data will also be saved as a restore point first.'))return;
      const data=JSON.parse(r.result);
      createSnapshot(true);
      restoreFromObject(data);
      toast('Restored from '+key);
    };
  }catch(e){toast('Could not restore.','error');}
}
function backupBannerHtml(){
  if(!session||session.role!=='admin')return '';
  if(products.length+patients.length+memos.length===0)return '';
  const lb=load('mms_lastbackup','');
  const days=lb?Math.floor((new Date(localDate()+'T00:00:00')-new Date(lb+'T00:00:00'))/86400000):null;
  if(days!==null&&days<7)return '';
  return `<div class="alert-banner" onclick="backupData()">💾 ${lb?'Your last backup was '+days+' days ago.':'You have not downloaded a backup file yet.'} Tap to download one now.</div>`;
}


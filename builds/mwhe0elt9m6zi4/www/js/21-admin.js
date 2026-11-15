/* ================= ADMIN ================= */
function renderAdmin(){
  if(!session||session.role!=='admin'){$('#page-admin').innerHTML='<p class="empty-state">Access denied. Admins only.</p>';return;}
  const updateLog=load('mms_update_log',[]),notice=load('mms_admin_notice','');
  $('#page-admin').innerHTML=`
    <div class="page-header"><h2>🛠️ Admin & Update Center</h2><p class="hint">Manage users, app settings and safe in-app configuration.</p></div>
    <div class="stats-grid">
      <div class="stat-card"><span>${products.length}</span><p>Products</p></div><div class="stat-card"><span>${patients.length}</span><p>Patients</p></div><div class="stat-card"><span>${doctors.length}</span><p>Doctors</p></div><div class="stat-card"><span>${memos.length}</span><p>Memos</p></div>
    </div>
    <div class="section-title">👥 Registered Users (${users.length})</div>
    ${users.length===0?'<p class="empty-state">No registered users yet.</p>':users.map((u,i)=>`
      <div class="item-card"><div class="item-info"><h4>${esc(u.id)} ${u.active===false?'<span class="badge" style="background:#fee2e2;color:#b91c1c">Disabled</span>':'<span class="badge" style="background:#dcfce7;color:#166534">Active</span>'}</h4><p>📞 ${esc(u.phone||'Not set')} · Registered: ${esc(u.createdAt||'Unknown')}</p></div>
      <div class="item-actions"><button class="btn-outline" onclick="editUser(${i})">✏️ Edit</button><button class="btn-outline" onclick="toggleUser(${i})">${u.active===false?'✅ Enable':'⛔ Disable'}</button><button class="btn-outline" onclick="deleteUser(${i})">🗑️</button></div></div>`).join('')}
    <div class="section-title">🧩 In-App Update Center</div>
    <div class="card"><p class="hint">Admin can change supported app settings and publish an announcement without editing the HTML. Arbitrary code/plugin installation is intentionally not supported here for safety.</p>
      <form id="adminUpdateForm">
        <label for="adminAnnouncement">App announcement / notice</label><textarea id="adminAnnouncement" rows="3" maxlength="500" placeholder="Write a notice for staff...">${esc(notice)}</textarea>
        <div class="row2"><div><label for="adminLowStock">Low-stock threshold</label><input id="adminLowStock" type="number" min="0" value="${num(settings.low)}"></div><div><label for="adminExpiryDays">Expiry alert (days)</label><input id="adminExpiryDays" type="number" min="1" value="${num(settings.expDays)}"></div></div>
        <label for="adminPaper">Memo paper size</label><select id="adminPaper"><option value="A4" ${settings.paper==='A4'?'selected':''}>A4</option><option value="80" ${settings.paper==='80'?'selected':''}>80mm thermal</option></select>
        <button type="submit" class="btn-primary btn-block">💾 Apply App Settings</button>
      </form>
      <div style="margin-top:12px"><button class="btn-outline btn-block" onclick="backupData()">⬇️ Download full backup</button><button class="btn-outline btn-block" onclick="document.querySelector('#page-settings input[type=file]')?.click()">Restore backup from Settings</button></div>
    </div>
    ${notice?`<div class="alert-banner">📢 ${esc(notice)}</div>`:''}
    <div class="section-title">🕘 Recent Admin Updates</div>
    <div class="card">${updateLog.length?updateLog.slice(0,8).map(x=>`<div class="sum-line"><span>${esc(x.action)}</span><small>${esc(x.date)}</small></div>`).join(''):'<p class="hint">No changes recorded yet.</p>'}</div>
    <div class="card" style="margin-top:16px;"><h3 style="color:var(--danger);margin-bottom:8px;">⚠️ Danger Zone</h3><button class="btn-outline btn-block" style="border-color:var(--danger);color:var(--danger);" onclick="resetAllData()">Reset All App Data</button></div>
    <div class="card" style="margin-top:12px"><h3>🔐 Security limitation</h3><p class="hint">This is a browser-based HTML app. Admin screens and passwords stored on the device can be bypassed by someone who can edit the file or browser storage. This app cannot guarantee protection against hacking. For real security, use a server-side backend, database rules, HTTPS, hashed passwords, rate limiting and server-verified admin roles.</p></div>`;
  $('#adminUpdateForm').onsubmit=function(e){
    e.preventDefault();
    settings.low=Math.max(0,num($('#adminLowStock').value));settings.expDays=Math.max(1,num($('#adminExpiryDays').value)||30);settings.paper=$('#adminPaper').value;
    save('mms_settings',settings);save('mms_admin_notice',$('#adminAnnouncement').value.trim());
    logAdminUpdate('Updated app settings / announcement');updateAlertBadge();renderAdmin();toast('App settings applied.');
  };
}
function logAdminUpdate(action){const a=load('mms_update_log',[]);a.unshift({action,date:new Date().toLocaleString()});save('mms_update_log',a.slice(0,50));}
function editUser(index){
  if(!session||session.role!=='admin')return;const u=users[index];if(!u)return;
  const id=prompt('User login ID:',u.id);if(id===null)return;const cleanId=id.trim();
  if(!cleanId||cleanId.toLowerCase()===ADMIN_ID.toLowerCase()||users.some((x,i)=>i!==index&&x.id.toLowerCase()===cleanId.toLowerCase())){toast('Invalid or duplicate user ID.','error');return;}
  const phone=prompt('Phone number:',u.phone||'');if(phone===null)return;
  const newPass=prompt('New password (leave blank to keep current password):','');if(newPass===null)return;
  if(newPass&&!/^\d{8,12}$/.test(newPass)){toast('Password must be 8–12 digits.','error');return;}
  u.id=cleanId;u.phone=phone.trim();if(newPass)u.password=newPass;if(u.active===undefined)u.active=true;
  save('mms_users',users);logAdminUpdate('Edited user: '+cleanId);renderAdmin();toast('User information updated.');
}
function toggleUser(index){if(!session||session.role!=='admin')return;const u=users[index];if(!u)return;u.active=u.active===false;save('mms_users',users);logAdminUpdate((u.active?'Enabled':'Disabled')+' user: '+u.id);renderAdmin();toast(u.active?'User enabled.':'User disabled.');}
function deleteUser(index){
  if(!session||session.role!=='admin')return;const u=users[index];if(!u)return;
  if(!confirm('Delete user account "'+u.id+'"?'))return;
  users.splice(index,1);save('mms_users',users);logAdminUpdate('Deleted user: '+u.id);renderAdmin();toast('User deleted.');
}
function resetAllData(){
  if(!session||session.role!=='admin')return;
  if(!confirm('This will delete ALL data. A restore point is kept for the admin to undo. Continue?'))return;
  if(!confirm('Are you absolutely sure? This cannot be undone.'))return;
  createSnapshot(true);wipeStorage();loadState();closeDrawer();showAuth();toast('All data reset. An automatic restore point was kept for undo (admin: Settings).');
}


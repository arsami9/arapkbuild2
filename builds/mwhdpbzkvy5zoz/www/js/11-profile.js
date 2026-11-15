/* ================= USER PROFILE ================= */
function profOf(id){return profiles[id]||{};}
function initialsOf(n){return String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w.charAt(0)).join('').toUpperCase()||'?';}
function avatarInner(id){const p=profOf(id);return p.photo?'<img src="'+p.photo+'" alt="">':'<span>'+esc(initialsOf(p.name||id))+'</span>';}
function currentUserName(){if(!session)return '';return profOf(session.id).name||(session.role==='admin'?'Admin':session.id);}
function applyProfile(){
  if(!session)return;
  const p=profOf(session.id);
  $('#drawerUserName').textContent=p.name||session.id;
  $('#drawerUserRole').textContent=(p.title?p.title+' · ':'')+(session.role==='admin'?'Administrator':'Staff Member');
  document.querySelector('.drawer-profile .avatar').innerHTML=avatarInner(session.id);
  $('#profileBtn').innerHTML=avatarInner(session.id);
}
function renderProfile(){
  const id=session.id,p=profOf(id),admin=session.role==='admin',u=admin?null:users.find(x=>x.id===id);
  const mine=memos.filter(m=>m.servedById===id||(!m.servedById&&m.servedBy===(admin?'Admin':id)));
  const sales=mine.reduce((s,m)=>s+num(m.grandTotal),0);
  $('#page-profile').innerHTML=`
    <div class="page-header"><h2>👤 My Profile</h2></div>
    <div class="card pf-card">
      <div class="pf-avatar" id="pfAvatar">${avatarInner(id)}</div>
      <div class="pf-photo-btns">
        <label class="btn-outline pf-up">📷 ${p.photo?'Change':'Upload'} Photo<input type="file" accept="image/*" onchange="onProfilePhoto(event)"></label>
        ${p.photo?'<button class="btn-outline" onclick="removeProfilePhoto()">🗑️ Remove</button>':''}
      </div>
      <h3 class="pf-name">${esc(p.name||id)}</h3>
      <p class="hint" style="text-align:center;margin:0">${admin?'Administrator':'Staff Member'} · Login ID: <b>${esc(id)}</b></p>
      <div class="pf-stats"><div><b>${mine.length}</b><span>Memos made</span></div><div><b>${money(sales)}</b><span>Total sales</span></div></div>
    </div>
    <div class="section-title">✏️ Edit Profile</div>
    <div class="card"><form id="profileForm">
      <label for="pfName">Full Name *</label><input type="text" id="pfName" maxlength="40" value="${esc(p.name||'')}" placeholder="Your name">
      <label for="pfTitle">Designation</label><input type="text" id="pfTitle" maxlength="30" value="${esc(p.title||(admin?'Owner':''))}" placeholder="e.g. Owner, Pharmacist, Salesman">
      <label for="pfPhone">Phone</label><input type="tel" id="pfPhone" value="${esc(p.phone||(u&&u.phone)||'')}">
      <label for="pfEmail">Email</label><input type="email" id="pfEmail" value="${esc(p.email||'')}">
      <label for="pfAddress">Address</label><input type="text" id="pfAddress" value="${esc(p.address||'')}">
      <label for="pfBio">About me / Note</label><textarea id="pfBio" rows="3" maxlength="200">${esc(p.bio||'')}</textarea>
      <p class="error-msg" id="pfError"></p>
      <button type="submit" class="btn-primary">Save Profile</button>
    </form></div>
    <div class="stack" style="margin-top:12px">
      <button class="btn-outline btn-block" onclick="navigate('settings')">🔒 Change Password</button>
      <button class="btn-danger-outline btn-block" onclick="logout()">🚪 Logout</button>
    </div>`;
  $('#profileForm').onsubmit=function(e){
    e.preventDefault();
    const name=$('#pfName').value.trim(),phone=$('#pfPhone').value.trim(),email=$('#pfEmail').value.trim(),err=$('#pfError');err.textContent='';
    if(!name){err.textContent='Please enter your name.';return;}
    if(phone&&!/^[0-9+\-\s]{6,16}$/.test(phone)){err.textContent='Enter a valid phone number.';return;}
    if(email&&!/^\S+@\S+\.\S+$/.test(email)){err.textContent='Enter a valid email address.';return;}
    profiles[id]=Object.assign({},profiles[id],{name,title:$('#pfTitle').value.trim(),phone,email,address:$('#pfAddress').value.trim(),bio:$('#pfBio').value.trim()});
    save('mms_profiles',profiles);
    if(u){u.phone=phone||u.phone;save('mms_users',users);}
    applyProfile();renderProfile();toast('Profile saved!');
  };
}
function onProfilePhoto(ev){
  const f=ev.target.files[0];if(!f)return;
  if(!/^image\//.test(f.type)){toast('Please choose an image file.','error');return;}
  const r=new FileReader();
  r.onload=function(){
    const img=new Image();
    img.onload=function(){
      const S=256,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');
      const m=Math.min(img.width,img.height),sx=(img.width-m)/2,sy=(img.height-m)/2;
      x.fillStyle='#fff';x.fillRect(0,0,S,S);x.drawImage(img,sx,sy,m,m,0,0,S,S);
      profiles[session.id]=Object.assign({},profiles[session.id],{photo:c.toDataURL('image/jpeg',.82)});
      save('mms_profiles',profiles);applyProfile();renderProfile();toast('Profile photo updated!');
    };
    img.onerror=()=>toast('Could not read this image.','error');
    img.src=r.result;
  };
  r.readAsDataURL(f);ev.target.value='';
}
function removeProfilePhoto(){
  if(!confirm('Remove your profile photo?'))return;
  const p=Object.assign({},profiles[session.id]);delete p.photo;profiles[session.id]=p;
  save('mms_profiles',profiles);applyProfile();renderProfile();
}

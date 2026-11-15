/* ================= PATIENTS ================= */
function renderPatients(){
  $('#page-patients').innerHTML=`
    <div class="page-header"><h2>🧑‍🤝‍🧑 Patient List</h2><button class="fab-inline" onclick="openPatientForm()">+ Add Patient</button></div>
    <input type="text" class="search-box" id="patSearch" placeholder="🔍 Search serial, name, phone or address..." value="${esc(patientQuery)}">
    <div class="filter-chips" id="patChips"><button data-f="all">All</button><button data-f="due">💰 With Due</button></div>
    <p class="hint" id="patCount" style="margin:2px 2px 8px"></p>
    <div id="patList"></div>`;
  $('#patSearch').oninput=function(){patientQuery=this.value;updatePatientList();};
  document.querySelectorAll('#patChips button').forEach(b=>b.onclick=function(){patientFilter=b.dataset.f;updatePatientList();});
  updatePatientList();
}
function updatePatientList(){
  if(!$('#patList'))return;
  const q=patientQuery.toLowerCase().replace(/^#/,'').trim();
  document.querySelectorAll('#patChips button').forEach(b=>b.classList.toggle('active',b.dataset.f===patientFilter));
  let list=[...patients].sort((a,b)=>num(a.sl)-num(b.sl)).filter(p=>!q||p.name.toLowerCase().includes(q)||(p.phone||'').includes(q)||(p.address||'').toLowerCase().includes(q)||slTxt(p).includes(q)||String(p.sl)===q);
  const dueOf=p=>Math.max(getPatientDue(p.phone),Math.max(0,patientTotal(p)-num(p.paid)));
  if(patientFilter==='due') list=list.filter(p=>dueOf(p)>0);
  $('#patCount').textContent=list.length+' of '+patients.length+' patients';
  $('#patList').innerHTML=list.length===0?'<p class="empty-state">No patients found.</p>':list.map(p=>{
    const due=dueOf(p),its=p.items||[];
    return `
    <div class="item-card">
      <div class="sl-badge">${slTxt(p)}</div>
      <div class="item-info" style="cursor:pointer" onclick="navigate('patient',{id:'${p.id}'})">
        <h4 class="link-name">${esc(p.name)} ›</h4>
        <p>${[p.age?p.age+' yrs':'',p.gender||''].filter(Boolean).join(' · ')}${p.dx?' · '+esc(p.dx):''}</p>
        <p>📞 ${esc(p.phone)} | 📍 ${esc(p.address)}</p>
        ${its.length?`<p>💊 ${its.length} medicine(s) · Bill ${money(patientTotal(p))}</p>`:''}
        ${due>0?`<p class="due-text">Due: ${money(due)}</p>`:''}
      </div>
      <div class="item-actions">
        <button title="New memo" onclick="memoForPatient('${p.id}')">🧾</button>
        <button onclick="openPatientForm('${p.id}')">✏️</button>
        <button onclick="deletePatient('${p.id}')">🗑️</button>
      </div>
    </div>`;}).join('');
}
function productChecklistHtml(q){
  q=(q||'').toLowerCase();
  if(products.length===0)return '<p class="empty-state">No products available. Add products first.</p>';
  let l=q?products.filter(p=>(p.name+' '+(p.generic||'')+' '+(p.company||'')).toLowerCase().includes(q)):products;
  const tot=l.length;l=l.slice(0,60);
  return l.map(p=>`
    <label class="check-row">
      <input type="checkbox" value="${p.id}" ${currentSelection.includes(p.id)?'checked':''} onchange="toggleSelection('${p.id}',this.checked)">
      ${esc(p.name)} (${esc(p.strength)}) - ${esc(p.company)}
    </label>`).join('')+(tot>60?`<p class="hint" style="padding:6px">Showing 60 of ${tot} — type to narrow down.</p>`:'');
}
function openPatientForm(id){
  const e=id?patients.find(p=>p.id===id):null;
  currentSelection=e?(e.products||[]).map(p=>p.id):[];
  const v=k=>esc(e&&e[k]!==undefined&&e[k]!==null?e[k]:'');
  openModal(`
    <h3>${e?'Edit Patient (#'+slTxt(e)+')':'Add New Patient (#'+String(nextPatientSl()).padStart(3,'0')+')'}</h3>
    <form id="patientForm">
      <label for="patName">Patient Name *</label><input type="text" id="patName" value="${v('name')}">
      <div class="row2">
        <div><label for="patAge">Age</label><input type="number" min="0" max="120" id="patAge" value="${v('age')}"></div>
        <div><label for="patGender">Sex</label><select id="patGender"><option value="">—</option>${['Male','Female'].map(g=>`<option ${e&&e.gender===g?'selected':''}>${g}</option>`).join('')}</select></div>
      </div>
      <div class="row2">
        <div><label for="patWeight">Weight (kg)</label><input type="number" min="0" step="0.1" id="patWeight" value="${v('weight')}"></div>
        <div><label for="patBp">BP</label><input type="text" id="patBp" placeholder="120/80" value="${v('bp')}"></div>
      </div>
      <label for="patBg">Blood Group</label><select id="patBg"><option value="">—</option>${['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=>`<option ${e&&e.bg===g?'selected':''}>${g}</option>`).join('')}</select>
      <label for="patAddress">Address *</label><input type="text" id="patAddress" value="${v('address')}">
      <label for="patPhone">Phone Number *</label><input type="tel" id="patPhone" value="${v('phone')}">
      <label for="patDoctor">Doctor</label><input type="text" id="patDoctor" list="patDocList" autocomplete="off" value="${v('doctor')}">
      <datalist id="patDocList">${doctors.map(d=>`<option value="${esc(d.name)}"></option>`).join('')}</datalist>
      <label for="patCc">C/C — সমস্যা / লক্ষণ</label><input type="text" id="patCc" value="${v('cc')}">
      <label for="patDx">Dx — রোগ নির্ণয়</label><input type="text" id="patDx" value="${v('dx')}">
      <label for="patAdvice">Advice — পরামর্শ</label><textarea id="patAdvice" rows="2">${v('advice')}</textarea>
      <div class="row2">
        <div><label for="patVisit">Visit date</label><input type="date" id="patVisit" value="${esc(e&&e.visitDate?e.visitDate:localDate())}"></div>
        <div><label for="patNext">Next visit</label><input type="date" id="patNext" value="${v('nextVisit')}"></div>
      </div>
      <label>Usual Products</label>
      <input type="text" placeholder="🔍 Search products..." oninput="filterCheckList(this.value)">
      <div class="checklist" id="productCheckList">${productChecklistHtml()}</div>
      <div class="modal-actions"><button type="button" class="btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn-primary">Save Patient</button></div>
    </form>`);
  $('#patientForm').onsubmit=function(ev){
    ev.preventDefault();
    const name=$('#patName').value.trim(),address=$('#patAddress').value.trim(),phone=$('#patPhone').value.trim();
    if(!name||!address||!phone){toast('Please fill name, address and phone.','error');return;}
    if(patients.some(p=>p.phone===phone&&(!e||p.id!==e.id))){toast('A patient with this phone already exists.','error');return;}
    const sel=currentSelection.map(pid=>{const pr=products.find(x=>x.id===pid);return pr?{id:pr.id,name:pr.name}:null;}).filter(Boolean);
    const extra={age:$('#patAge').value.trim(),gender:$('#patGender').value,weight:$('#patWeight').value.trim(),bp:$('#patBp').value.trim(),bg:$('#patBg').value,doctor:$('#patDoctor').value.trim(),cc:$('#patCc').value.trim(),dx:$('#patDx').value.trim(),advice:$('#patAdvice').value.trim(),visitDate:$('#patVisit').value,nextVisit:$('#patNext').value};
    if(e){Object.assign(e,{name,address,phone,products:sel},extra);}
    else patients.push(Object.assign({id:genId(),sl:nextPatientSl(),name,address,phone,products:sel,items:[],paid:0,createdAt:localDate()},extra));
    save('mms_patients',patients);closeModal();updatePatientList();
    if(!$('#page-patient').classList.contains('hidden'))renderPatientPage();
    toast(e?'Patient updated!':'Patient added!');
  };
}
/* ---------- Prescription (separate from memo) ---------- */
function toggleSelection(id,checked){
  if(checked){if(!currentSelection.includes(id))currentSelection.push(id);}
  else currentSelection=currentSelection.filter(x=>x!==id);
}
function filterCheckList(q){const c=$('#productCheckList');if(c)c.innerHTML=productChecklistHtml(q);}
function deletePatient(id){
  if(!confirm('Delete this patient?'))return;
  patients=patients.filter(p=>p.id!==id);save('mms_patients',patients);updatePatientList();toast('Patient deleted.');
}
function memoForPatient(id){
  memoDraft=null;
  navigate('memo');
  setTimeout(()=>{const s=$('#memoPatientSelect');if(s){s.value=id;fillPatientInMemo(id);}},30);
}

let prodShow=60,productCo='';
function prodLabel(p){return p.name+(p.strength?' '+p.strength:'')+(p.company?' · '+p.company.split(' ')[0]:'');}
function slTxt(p){return String(p.sl||0).padStart(3,'0');}
function nextPatientSl(){let m=0;patients.forEach(p=>{if(num(p.sl)>m)m=num(p.sl);});return m+1;}
function docInfo(p){const d=doctors.find(x=>x.name===p.doctor)||{};return {name:p.doctor||'',degree:d.degree||'',bmdc:d.bmdc||''};}
function rxMeta(i){const a=[];if(i.meal&&MEAL[i.meal])a.push(MEAL[i.meal][0]);if(num(i.days)>0)a.push(num(i.days)+' দিন');if(num(i.qty)>0)a.push('মোট '+num(i.qty)+' পিস');return a.join(' · ');}
function rxHtml(p){
  const d=docInfo(p),items=p.items||[];
  const f=(l,v)=>`<div><b>${l}:</b> ${esc(v||'-')}</div>`;
  return `
  <div class="invoice-print rx-print" id="rxPrint">
    <div class="rx-top">
      <div><h2>${esc(shopInfo.icon)} ${esc(shopInfo.name)}</h2><small>${esc(shopInfo.address||'Your Trusted Pharmacy')}${shopInfo.phone?' | 📞 '+esc(shopInfo.phone):''}</small></div>
      <div class="rx-doc"><b>${esc(d.name||'Doctor: ________')}</b>${d.degree?esc(d.degree)+'<br>':''}${d.bmdc?'BMDC Reg: '+esc(d.bmdc):''}</div>
    </div>
    <div class="rx-info">
      <div><b>Serial No:</b> <span class="rx-sl">#${slTxt(p)}</span></div>${f('Date',fmtDate(p.visitDate||p.createdAt||localDate()))}
      <div class="full"><b>Patient:</b> <span style="font-weight:800">${esc(p.name)}</span></div>
      ${f('Age / Sex',[p.age?p.age+' yrs':'',p.gender||''].filter(Boolean).join(' / '))}${f('Weight',p.weight?p.weight+' kg':'')}
      ${f('BP',p.bp)}${f('Blood Group',p.bg)}
      ${f('Phone',p.phone)}<div class="full"><b>Address:</b> ${esc(p.address||'-')}</div>
    </div>
    <div class="rx-body">
      ${p.cc?`<div class="rx-box"><b>C/C (সমস্যা):</b> ${esc(p.cc)}</div>`:''}
      ${p.dx?`<div class="rx-box"><b>Dx (রোগ নির্ণয়):</b> ${esc(p.dx)}</div>`:''}
      <div class="rx-sym">Rx</div>
      ${items.length===0?'<p class="hint" style="padding:8px 0">No medicines added yet.</p>':items.map((i,k)=>`
        <div class="rx-med"><div class="n">${k+1}. ${esc(i.name)}</div>
        <div class="d"><span class="rx-dose">${esc(i.dose||'—')}</span> ${esc(rxMeta(i))}</div>
        ${i.note?`<div class="rx-note">📝 ${esc(i.note)}</div>`:''}</div>`).join('')}
      ${p.advice?`<div class="rx-box rx-adv"><b>পরামর্শ (Advice):</b> ${esc(p.advice)}</div>`:''}
      ${p.nextVisit?`<p class="rx-next">📅 পরবর্তী সাক্ষাৎ: <b>${fmtDate(p.nextVisit)}</b></p>`:''}
      <div class="rx-sign"><span>Doctor's Signature</span></div>
    </div>
    <div class="rx-foot">ঔষধ চিকিৎসকের পরামর্শ অনুযায়ী সেবন করুন।<div class="credit">Created by ABDUR ROHMAN</div></div>
  </div>`;
}
function rxCfg(p){return {kind:'rx',p,fileName:'Prescription_'+slTxt(p)+'_'+safeName(p.name),pw:419.53,minH:595.28};}
function whatsappRx(id){
  const p=patients.find(x=>x.id===id);if(!p)return;
  let t='*'+shopInfo.name+'*\n*PRESCRIPTION* #'+slTxt(p)+'\nPatient: '+p.name+(p.age?' ('+p.age+' yrs)':'')+'\nDate: '+fmtDate(p.visitDate||localDate())+(p.doctor?'\nDoctor: '+p.doctor:'')+(p.dx?'\nDx: '+p.dx:'')+'\n\n';
  (p.items||[]).forEach((i,k)=>{t+=(k+1)+'. '+i.name+'\n   '+(i.dose||'')+' '+rxMeta(i)+(i.note?' — '+i.note:'')+'\n';});
  if(p.advice)t+='\nAdvice: '+p.advice;
  if(p.nextVisit)t+='\nNext visit: '+fmtDate(p.nextVisit);
  window.open('https://wa.me/'+waNumber(p.phone)+'?text='+encodeURIComponent(t+'\n\nCreated by ABDUR ROHMAN'),'_blank');
}
function buildRxCanvas(cfg){
  const p=cfg.p,d=docInfo(p),W=620,P=26,S=2,FONT='"Segoe UI","Noto Sans Bengali","Noto Sans",Roboto,Arial,sans-serif';
  const items=p.items||[];
  const cv=document.createElement('canvas');cv.width=W*S;cv.height=(1500+items.length*90)*S;
  const x=cv.getContext('2d');x.scale(S,S);x.fillStyle='#fff';x.fillRect(0,0,W,cv.height);
  const T=(s,px,py,o)=>{o=o||{};x.font=(o.i?'italic ':'')+(o.w||400)+' '+(o.s||13)+'px '+(o.f||FONT);x.fillStyle=o.c||'#1e293b';x.textAlign=o.a||'left';x.textBaseline='alphabetic';x.fillText(String(s),px,py);};
  const wrap=(s,maxW,fs,w)=>{x.font=(w||400)+' '+fs+'px '+FONT;const out=[];let line='';String(s).split(/\s+/).forEach(wd=>{const t=line?line+' '+wd:wd;if(x.measureText(t).width>maxW&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);return out.length?out:[''];};
  const L=(y,dash,c)=>{x.save();x.strokeStyle=c||'#cbd5e1';x.lineWidth=1;if(dash)x.setLineDash([3,3]);x.beginPath();x.moveTo(P,y);x.lineTo(W-P,y);x.stroke();x.restore();};
  x.fillStyle='#0f766e';x.fillRect(0,0,W,84);
  T((shopInfo.icon+' '+shopInfo.name).toUpperCase(),P,34,{s:19,w:800,c:'#fff'});
  wrap(shopInfo.address||'',300,10.5).slice(0,2).forEach((l,k)=>T(l,P,52+k*14,{s:10.5,c:'#ccfbf1'}));
  if(shopInfo.phone)T('Phone: '+shopInfo.phone,P,80,{s:10.5,c:'#ccfbf1'});
  T(d.name||'Doctor: ________',W-P,32,{a:'right',s:15,w:800,c:'#fff'});
  let dy=48;if(d.degree){wrap(d.degree,260,10.5).slice(0,2).forEach(l=>{T(l,W-P,dy,{a:'right',s:10.5,c:'#ccfbf1'});dy+=14;});}
  if(d.bmdc)T('BMDC Reg: '+d.bmdc,W-P,dy,{a:'right',s:10.5,c:'#ccfbf1'});
  let y=84;x.fillStyle='#f0fdfa';x.fillRect(0,y,W,112);x.fillStyle='#99f6e4';x.fillRect(0,y+112,W,2);
  const lv=(l,v,px,py,maxW,bold)=>{T(l+': ',px,py,{w:700,s:12,c:'#115e59'});const lw=x.measureText(l+': ').width;let s=String(v||'-');x.font=(bold?800:400)+' 12.5px '+FONT;while(s.length>2&&x.measureText(s).width>maxW-lw)s=s.slice(0,-1);T(s,px+lw,py,{s:12.5,w:bold?800:400});};
  lv('Serial No','#'+slTxt(p),P,y+22,260,true);lv('Date',fmtDate(p.visitDate||p.createdAt||localDate()),W/2+10,y+22,W/2-P-10);
  lv('Patient',p.name,P,y+44,W-2*P,true);
  lv('Age / Sex',[p.age?p.age+' yrs':'',p.gender||''].filter(Boolean).join(' / '),P,y+66,260);lv('Weight',p.weight?p.weight+' kg':'',W/2+10,y+66,130);
  lv('BP',p.bp,W/2+150,y+66,100);
  lv('Phone',p.phone,P,y+88,260);lv('Address',p.address,W/2+10,y+88,W/2-P-10);
  y+=114+22;
  const box=(lab,txt,fill)=>{const ls=wrap(lab+' '+txt,W-2*P-20,12.5);const h=ls.length*17+12;x.fillStyle=fill||'#f8fafc';x.fillRect(P,y,W-2*P,h);x.strokeStyle='#cbd5e1';x.setLineDash([4,3]);x.strokeRect(P,y,W-2*P,h);x.setLineDash([]);ls.forEach((l,k)=>T(l,P+10,y+19+k*17,{s:12.5}));y+=h+8;};
  if(p.cc)box('C/C (সমস্যা):',p.cc);if(p.dx)box('Dx (রোগ নির্ণয়):',p.dx);
  y+=14;T('Rx',P,y+22,{s:34,w:800,c:'#0f766e',i:true,f:'Georgia,"Times New Roman",serif'});y+=34;
  if(!items.length){T('No medicines added yet.',P+8,y+14,{s:12.5,c:'#64748b'});y+=28;}
  items.forEach((it,k)=>{
    const nl=wrap((k+1)+'. '+it.name,W-2*P-20,14.5,800);nl.forEach((l,j)=>T(l,P+6,y+18+j*18,{s:14.5,w:800}));y+=nl.length*18+4;
    const dose=it.dose||'—';x.font='800 12.5px '+FONT;const dw=x.measureText(dose).width+16;
    x.fillStyle='#e6f7f4';x.fillRect(P+22,y+4,dw,20);T(dose,P+30,y+19,{s:12.5,w:800,c:'#0f766e'});
    T(rxMeta(it),P+22+dw+8,y+19,{s:12,c:'#334155'});y+=30;
    if(it.note){T('📝 '+it.note,P+22,y+8,{s:11.5,c:'#64748b',i:true});y+=18;}
    L(y+4,true);y+=14;
  });
  y+=6;
  if(p.advice){x.font='12.5px '+FONT;box('পরামর্শ (Advice):',p.advice,'#fffbeb');}
  if(p.nextVisit){T('📅 পরবর্তী সাক্ষাৎ: ',P,y+16,{s:12.5,w:700,c:'#115e59'});const w0=x.measureText('📅 পরবর্তী সাক্ষাৎ: ').width;T(fmtDate(p.nextVisit),P+w0+4,y+16,{s:13,w:800});y+=30;}
  y+=36;x.strokeStyle='#1e293b';x.setLineDash([]);x.beginPath();x.moveTo(W-P-170,y);x.lineTo(W-P,y);x.stroke();T("Doctor's Signature",W-P-85,y+16,{a:'center',s:11,c:'#64748b'});y+=34;
  L(y,true);y+=22;T('ঔষধ চিকিৎসকের পরামর্শ অনুযায়ী সেবন করুন।',W/2,y,{a:'center',s:11.5,c:'#64748b'});y+=20;
  T('Created by ABDUR ROHMAN',W/2,y,{a:'center',s:8,w:700,c:'#0f766e'});y+=16;
  const H=Math.ceil(Math.max(y,cfg.minH*W/cfg.pw));
  const out=document.createElement('canvas');out.width=W*S;out.height=H*S;
  const o=out.getContext('2d');o.fillStyle='#fff';o.fillRect(0,0,out.width,out.height);o.drawImage(cv,0,0,W*S,H*S,0,0,W*S,H*S);
  return out;
}
function buildMemoCanvas(cfg){
  const m=cfg.m,w58=cfg.w==='58',W=w58?232:320,P=w58?8:12,S=4,FS=w58?11:12,TS=w58?9.5:10.5,FONT='"Segoe UI","Noto Sans Bengali","Noto Sans",Roboto,Arial,sans-serif';
  const cv=document.createElement('canvas');cv.width=W*S;cv.height=(900+m.items.length*70)*S;
  const x=cv.getContext('2d');x.scale(S,S);x.fillStyle='#fff';x.fillRect(0,0,W,cv.height);
  const T=(s,px,py,o)=>{o=o||{};x.font=(o.w||400)+' '+(o.s||FS)+'px '+FONT;x.fillStyle=o.c||'#000';x.textAlign=o.a||'left';x.textBaseline='alphabetic';x.fillText(String(s),px,py);};
  const wrap=(s,maxW,fs,w)=>{x.font=(w||400)+' '+fs+'px '+FONT;const out=[];let line='';const ws=[];String(s).split(/\s+/).forEach(wd=>{if(x.measureText(wd).width<=maxW){ws.push(wd);return;}let c='';for(const ch of wd){if(x.measureText(c+ch).width>maxW&&c){ws.push(c);c=ch;}else c+=ch;}if(c)ws.push(c);});ws.forEach(wd=>{const t=line?line+' '+wd:wd;if(x.measureText(t).width>maxW&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);return out.length?out:[''];};
  const HR=()=>{y+=3;x.save();x.strokeStyle='#000';x.lineWidth=1;x.setLineDash([3,2]);x.beginPath();x.moveTo(P,y);x.lineTo(W-P,y);x.stroke();x.restore();y+=FS+3;};
  const C=(s,o)=>{wrap(s,W-2*P,(o&&o.s)||FS-1,(o&&o.w)).forEach(l=>{T(l,W/2,y,Object.assign({a:'center'},o));y+=((o&&o.s)||FS-1)+3;});};
  const R=(l,v,o)=>{o=o||{};T(l,P,y,o);T(v,W-P,y,Object.assign({a:'right'},o));y+=(o.s||FS)+4;};
  const paid=num(m.due)<=0,lineNet=m.items.reduce((s,i)=>s+num(i.total),0),extra=num(m.extraDiscount);
  let y=22,fs=FS+5;const nm=(shopInfo.icon+' '+shopInfo.name).toUpperCase();x.font='800 '+fs+'px '+FONT;while(fs>10&&x.measureText(nm).width>W-2*P){fs--;x.font='800 '+fs+'px '+FONT;}
  T(nm,W/2,y,{a:'center',s:fs,w:800});y+=fs-1;
  C(shopInfo.address||'Your Trusted Pharmacy');if(shopInfo.phone)C('Phone: '+shopInfo.phone);if(shopInfo.license)C('Drug License: '+shopInfo.license);
  HR();
  R('CASH MEMO',m.memoNo,{w:800,s:FS+2});
  R(fmtDate(m.date)+(m.time?' '+m.time:''),m.method||'Cash',{s:FS-1});
  R('Patient',m.patientName,{w:700});
  if(m.patientPhone)R('Phone',m.patientPhone,{s:FS-1});
  HR();
  /* table: SL | Item | Qty | Price | Dis | Total */
  const wSl=w58?14:16,wQ=w58?20:24,wPr=w58?35:42,wD=w58?28:34,wT=w58?38:46;
  const xT=W-P,xD=xT-wT,xP=xD-wD,xQ=xP-wPr,nameR=xQ-wQ-2,nameX=P+wSl+2,nameW=nameR-nameX;
  const th={s:TS,w:800};
  T('SL',P,y,th);T('Item',nameX,y,th);T('Qty',xQ,y,Object.assign({a:'right'},th));T('Price',xP,y,Object.assign({a:'right'},th));T('Dis',xD,y,Object.assign({a:'right'},th));T('Total',xT,y,Object.assign({a:'right'},th));
  y+=4;x.save();x.strokeStyle='#000';x.lineWidth=.8;x.beginPath();x.moveTo(P,y);x.lineTo(W-P,y);x.stroke();x.restore();y+=TS+3;
  m.items.forEach((i,k)=>{
    const ls=wrap(i.name,nameW,TS+.5,600);
    T(k+1,P,y,{s:TS});
    ls.forEach((l,j)=>T(l,nameX,y+j*(TS+3),{s:TS+.5,w:600}));
    T(i.qty,xQ,y,{s:TS,a:'right'});T(num(i.price).toFixed(2),xP,y,{s:TS,a:'right'});
    T(num(i.discount)>0?num(i.discount).toFixed(2):'-',xD,y,{s:TS,a:'right'});T(num(i.total).toFixed(2),xT,y,{s:TS,w:800,a:'right'});
    y+=ls.length*(TS+3)+1;x.save();x.strokeStyle='#9ca3af';x.lineWidth=.6;x.setLineDash([2,2]);x.beginPath();x.moveTo(P,y);x.lineTo(W-P,y);x.stroke();x.restore();y+=TS+1;
  });
  HR();
  R('Items: '+m.items.length,'Total Qty: '+m.items.reduce((s,i)=>s+num(i.qty),0),{s:FS-1});
  R('Sub Total',money(lineNet));
  if(extra>0)R('Discount'+(num(m.discPct)?' ('+m.discPct+'% on bill)':''),'− '+money(extra));
  y+=2;R('TOTAL',money(m.grandTotal),{w:800,s:FS+4});
  R('Paid',money(m.paid));R('Due',money(m.due),{w:800});
  if(num(m.prevDue)>0)R('Previous due',money(m.prevDue),{s:FS-1});
  if(num(m.totalDiscount)>0)C('You saved '+money(m.totalDiscount));
  y+=4;const st=paid?'★ PAID ★':'DUE '+money(m.due);x.font='800 '+(FS+1)+'px '+FONT;const sw=x.measureText(st).width+20;
  x.strokeStyle='#000';x.lineWidth=1.5;x.setLineDash([]);x.strokeRect(W/2-sw/2,y-FS-2,sw,FS+10);T(st,W/2,y+3,{a:'center',s:FS+1,w:800});y+=FS+12;
  if(m.note){C('📝 '+m.note);}
  HR();
  C(shopInfo.note||('Thank you for trusting '+shopInfo.name+'!'));
  if(m.servedBy)C('Served by: '+m.servedBy);
  C('Created by ABDUR ROHMAN',{w:700,s:8});
  const H=Math.ceil(y+8);
  const out=document.createElement('canvas');out.width=W*S;out.height=H*S;
  const o=out.getContext('2d');o.fillStyle='#fff';o.fillRect(0,0,out.width,out.height);o.drawImage(cv,0,0,W*S,H*S,0,0,W*S,H*S);
  return out;
}
let memoItems=[],miTab='list',editingMemoId=null;
function memoW(){return settings.memoW==='58'?'58':'80';}
function pctOptions(sel){let h='';for(let i=0;i<=15;i++)h+=`<option value="${i}" ${i===num(sel)?'selected':''}>${i===0?'0%':i+'%'}</option>`;return h;}
function miShowTab(){
  document.querySelectorAll('.mi-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.t===miTab));
  $('#miList').classList.toggle('hidden',miTab!=='list');$('#miCustom').classList.toggle('hidden',miTab!=='custom');
  if(miTab==='list')miSearchRender();
}
function miSearchRender(){
  const q=$('#miSearch').value.toLowerCase().trim(),c=$('#miResults');
  if(!q){c.innerHTML=`<p class="hint" style="padding:6px 2px">Type to search ${products.length} medicines, then tap one to add it.</p>`;return;}
  const tk=q.split(/\s+/);const l=products.filter(p=>{const h=(p.name+' '+(p.generic||'')+' '+(p.company||'')+' '+(p.strength||'')+' '+(p.barcode||'')+' '+(p.id||'')).toLowerCase();return tk.every(t=>h.includes(t));}).slice(0,12);
  c.innerHTML=l.length===0?'<p class="hint" style="padding:6px 2px">Not in Products List — use "Any Other Item" tab.</p>':l.map(p=>`
    <div class="mi-res" onclick="miAddProduct('${p.id}')">
      <div><b>${esc(p.name)} ${esc(p.strength)}</b><small>${esc([p.form,p.company].filter(Boolean).join(' · '))} · Stock ${num(p.stock)}</small></div>
      <div class="mi-res-r"><b>${money(p.mrp)}</b><span class="mi-plus">＋</span></div>
    </div>`).join('');
}
function miFullName(p){return ((p.form?p.form+' ':'')+p.name+' '+(p.strength||'')).trim();}
function miAddProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  const ex=memoItems.find(i=>i.pid===id);
  if(ex)ex.qty=num(ex.qty)+1;else memoItems.push({k:genId(),pid:id,name:miFullName(p),qty:1,price:num(p.mrp),pct:0});
  renderMemoItems();toast(miFullName(p)+' added');
}
function miAddCustom(){
  const name=$('#miCName').value.trim(),qty=num($('#miCQty').value)||1,price=$('#miCPrice').value.trim();
  if(!name){toast('Enter item name.','error');return;}
  if(price===''||num(price)<0){toast('Enter item price.','error');return;}
  memoItems.push({k:genId(),pid:'',name,qty,price:num(price),pct:0});
  $('#miCName').value='';$('#miCPrice').value='';$('#miCQty').value=1;
  renderMemoItems();toast('Item added');
}
function renderMemoItems(){
  const c=$('#memoItemsContainer');if(!c)return;
  $('#miCount').textContent=memoItems.length;
  c.innerHTML=memoItems.length===0?'<p class="empty-state" style="padding:14px 0">No items yet. Search a medicine above or add any other item.</p>':`
    <div class="mi-head"><span>SL</span><span>Item</span><span>Qty</span><span>Price/pc</span><span>Dis</span><span>Total</span><span></span></div>`+memoItems.map((i,n)=>`
    <div class="mi-row" data-k="${i.k}">
      <span class="mi-sl">${n+1}</span>
      <span class="mi-name">${esc(i.name)}${i.pid?'':' <em>other</em>'}</span>
      <input type="number" min="1" inputmode="numeric" class="mi-q" value="${esc(i.qty)}" oninput="miEdit('${i.k}','qty',this.value)">
      <input type="number" min="0" step="0.01" inputmode="decimal" class="mi-p" value="${esc(i.price)}" oninput="miEdit('${i.k}','price',this.value)">
      <select onchange="miEdit('${i.k}','pct',this.value)">${pctOptions(i.pct)}</select>
      <b class="mi-lv">৳0</b>
      <button type="button" class="mi-x" onclick="miRemove('${i.k}')">×</button>
    </div>`).join('');
  calcMemoTotals();
}
function miRemove(k){memoItems=memoItems.filter(i=>i.k!==k);renderMemoItems();}
function miQty(k,d){const i=memoItems.find(x=>x.k===k);if(!i)return;i.qty=Math.max(1,num(i.qty)+d);const el=document.querySelector('.mi-item[data-k="'+k+'"] .mi-q');if(el)el.value=i.qty;calcMemoTotals();}
function miEdit(k,f,v){const i=memoItems.find(x=>x.k===k);if(!i)return;i[f]=f==='pct'?num(v):num(v);calcMemoTotals();}
function setMemoW(w,id){settings.memoW=w;save('mms_settings',settings);viewMemoById(id);}

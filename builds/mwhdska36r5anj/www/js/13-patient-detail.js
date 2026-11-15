/* ================= PATIENT DETAIL PAGE ================= */
let curPatientId=null,editItemId=null;
const MEAL={before:['খাবারের আগে','Before meal'],after:['খাবারের পরে','After meal'],any:['যেকোনো সময়','Any time'],bed:['ঘুমানোর আগে','At bedtime']};
function doseSub(i){
  const a=[];
  if(i.dose)a.push('Dose: '+i.dose);
  if(i.meal&&MEAL[i.meal])a.push(MEAL[i.meal][1]);
  if(num(i.days)>0)a.push(num(i.days)+' days');
  if(i.note)a.push(i.note);
  return a.join(' · ');
}
function doseSubUi(i){
  const a=[];
  if(i.dose)a.push('ডোজ: '+i.dose);
  if(i.meal&&MEAL[i.meal])a.push(MEAL[i.meal][0]);
  if(num(i.days)>0)a.push(num(i.days)+' দিন');
  if(i.note)a.push(i.note);
  return a.join(' · ');
}
function setDose(d){const el=$('#itDose');if(el){el.value=d;el.focus();}}
function autoPcsFromDose(){
  const d=($('#itDose').value||'').replace(/½/g,'0.5').replace(/¼/g,'0.25');
  const nums=d.match(/\d+(\.\d+)?/g)||[];
  const perDay=nums.reduce((a,b)=>a+parseFloat(b),0);
  const days=num($('#itDays').value);
  if(perDay<=0||days<=0){toast('Enter a dose like 1+0+1 and the number of days first.','error');return;}
  $('#itQty').value=Math.ceil(perDay*days);
  $('#itQty').dispatchEvent(new Event('input'));
  toast('Pcs set to '+Math.ceil(perDay*days)+' ('+perDay+' per day × '+days+' days)');
}
function patientTotal(p){return (p.items||[]).reduce((s,i)=>s+num(i.qty)*num(i.price),0);}
function renderPatientPage(id){
  if(id)curPatientId=id;
  const p=patients.find(x=>x.id===curPatientId);
  if(!p){navigate('patients');return;}
  if(!Array.isArray(p.items))p.items=[];
  const items=p.items,total=patientTotal(p),paid=num(p.paid),due=Math.max(0,total-paid);
  const edit=editItemId?items.find(i=>i.id===editItemId):null;
  const editIdx=edit?items.indexOf(edit):-1;
  const memoDue=getPatientDue(p.phone);
  $('#page-patient').innerHTML=`
    <button class="back-btn" onclick="navigate('patients')">← Patient List</button>
    <div class="card">
      <div class="pt-hero"><div class="sl-badge" style="width:54px;height:54px;border-radius:18px;font-size:15px">#${slTxt(p)}</div><div style="min-width:0"><h2>${esc(p.name)}</h2><p class="hint" style="margin:0">Serial #${slTxt(p)} · Patient since ${esc(fmtDate(p.createdAt)||'-')}</p></div></div>
      <div class="modal-actions" style="margin-top:4px">
        <button class="btn-outline" onclick="openPatientForm('${p.id}')">✏️ Edit Info</button>
        <button class="btn-outline" onclick="memoForPatient('${p.id}')">🧾 New Memo</button>
      </div>
    </div>
    <div class="section-title">📋 Prescription</div>
    ${rxHtml(p)}
    <div class="rx-actions no-print">
      <button class="ia-print" onclick="printInvoice('rx')">🖨️ Print</button>
      <button class="ia-pdf" onclick="downloadPaperPdf('rx','${p.id}')">⬇️ Download PDF</button>
      <button class="ia-img" onclick="downloadPaperImage('rx','${p.id}')">🖼️ Download Image</button>
      <button class="ia-share" onclick="sharePaper('rx','${p.id}')">📤 Share</button>
      ${p.phone?`<button class="ia-wa" onclick="whatsappRx('${p.id}')">💬 Send on WhatsApp</button>`:''}
    </div>

    <div class="card form-card" id="itemFormCard">
      <h3 style="font-size:15px">${edit?'✏️ Edit Medicine #'+(editIdx+1):'➕ Add Medicine #'+(items.length+1)}</h3>
      <form id="itemForm">
        <label for="itName">Medicine name</label>
        <input type="text" id="itName" list="itProdList" autocomplete="off" placeholder="Type or pick a medicine" value="${esc(edit?edit.name:'')}">
        <datalist id="itProdList">${products.map(pr=>`<option value="${esc(prodLabel(pr))}"></option>`).join('')}</datalist>
        <div class="row2">
          <div><label for="itQty">Pcs</label><input type="number" min="1" id="itQty" inputmode="numeric" value="${edit?esc(edit.qty):1}"></div>
          <div><label for="itPrice">Price per pc (৳)</label><input type="number" min="0" step="0.01" id="itPrice" inputmode="decimal" value="${edit?esc(edit.price):''}"></div>
        </div>
        <label for="itDose">Dose (ডোজ)</label>
        <input type="text" id="itDose" autocomplete="off" placeholder="e.g. 1+0+1  (সকাল+দুপুর+রাত)" value="${esc(edit?(edit.dose||''):'')}">
        <div class="dose-chips">${['1+0+1','1+1+1','1+0+0','0+0+1','0+1+0','½+0+½','1+1+1+1'].map(d=>`<button type="button" onclick="setDose('${d}')">${d}</button>`).join('')}</div>
        <div class="row2">
          <div><label for="itMeal">When to take</label>
            <select id="itMeal"><option value="">— Not set —</option>${Object.keys(MEAL).map(k=>`<option value="${k}" ${edit&&edit.meal===k?'selected':''}>${MEAL[k][0]} / ${MEAL[k][1]}</option>`).join('')}</select></div>
          <div><label for="itDays">Duration (days)</label><input type="number" min="0" id="itDays" inputmode="numeric" placeholder="e.g. 7" value="${edit&&num(edit.days)>0?esc(edit.days):''}"></div>
        </div>
        <button type="button" class="btn-outline btn-block" style="margin-top:8px" onclick="autoPcsFromDose()">🔢 Auto-fill Pcs from dose × days</button>
        <label for="itNote">Note (optional)</label>
        <input type="text" id="itNote" autocomplete="off" placeholder="e.g. Take with warm water" value="${esc(edit?(edit.note||''):'')}">
        <div class="sum-line" style="margin-top:12px"><span>Line total</span><b id="itLine">৳0</b></div>
        <div class="modal-actions">
          ${edit?'<button type="button" class="btn-outline" onclick="cancelItemEdit()">Cancel</button>':''}
          <button type="submit" class="btn-primary">${edit?'Update Medicine':'+ Add to List'}</button>
        </div>
      </form>
    </div>

    <div class="section-title" style="margin-top:4px">💊 Medicine List (${items.length})</div>
    <div class="card" style="padding:10px">
      ${items.length===0?'<p class="empty-state">No medicines added yet. Add the first one above.</p>':`
      <div class="table-wrap"><table class="pt-table">
        <tr><th>#</th><th>Medicine</th><th class="n">Pcs</th><th class="n">Price</th><th class="n">Total</th><th></th></tr>
        ${items.map((i,k)=>`<tr class="${i.id===editItemId?'editing':''}">
          <td class="sl">${k+1}</td><td class="nm">${esc(i.name)}${doseSubUi(i)?`<div class="dose-line">💊 ${esc(doseSubUi(i))}</div>`:''}</td><td class="n">${num(i.qty)}</td>
          <td class="n">${num(i.price).toFixed(2)}</td><td class="n"><b>${(num(i.qty)*num(i.price)).toFixed(2)}</b></td>
          <td class="act"><button class="mini-btn" onclick="editPatientItem('${i.id}')">✏️</button> <button class="mini-btn" onclick="deletePatientItem('${i.id}')">🗑️</button></td>
        </tr>`).join('')}
      </table></div>`}
    </div>

    <div class="card form-card">
      <div class="sum-line"><span>Total Bill</span><b>${money(total)}</b></div>
      <div class="sum-line"><span>Paid</span><b style="color:var(--success)">${money(paid)}</b></div>
      <div class="sum-line big"><span>Due</span><span style="color:${due>0?'var(--danger)':'var(--success)'}">${total>0&&due<=0?'✅ PAID':money(due)}</span></div>
      <label for="ptPaid">Paid amount (৳)</label>
      <div class="pay-row"><input type="number" min="0" id="ptPaid" inputmode="decimal" value="${paid||''}" placeholder="0"><button type="button" class="btn-outline" onclick="savePatientPaid()">Save</button></div>
      <button type="button" class="btn-outline btn-block" style="margin-top:8px" onclick="savePatientPaid(true)">✅ Mark Fully Paid</button>
    </div>
    <button class="btn-primary" onclick="showStatement('${p.id}')">🖨️ Print / Download Statement</button>`;

  const ni=$('#itName'),qi=$('#itQty'),pi=$('#itPrice');
  const upd=()=>{$('#itLine').textContent=money(num(qi.value)*num(pi.value));};
  if(edit)pi.dataset.touched='1';
  ni.addEventListener('input',()=>{
    const q=ni.value.trim().toLowerCase();
    const m=products.find(x=>prodLabel(x).toLowerCase()===q);
    if(m&&!pi.dataset.touched){pi.value=m.mrp;upd();}
  });
  pi.addEventListener('input',()=>{pi.dataset.touched='1';upd();});
  qi.addEventListener('input',upd);
  $('#itemForm').onsubmit=submitPatientItem;
  upd();
  if(edit)setTimeout(()=>{const c=$('#itemFormCard');if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},60);
}
function submitPatientItem(ev){
  ev.preventDefault();
  const p=patients.find(x=>x.id===curPatientId);if(!p)return;
  const rawName=$('#itName').value.trim(),qty=num($('#itQty').value),priceRaw=$('#itPrice').value.trim();
  const mp=products.find(x=>prodLabel(x)===rawName);
  const name=mp?((mp.form?mp.form+' ':'')+mp.name+' '+mp.strength).trim():rawName.replace(/ · \S+$/,'');
  if(!name){toast('Please enter medicine name.','error');return;}
  if(qty<=0){toast('Pcs must be at least 1.','error');return;}
  if(priceRaw===''||num(priceRaw)<0){toast('Please enter the price.','error');return;}
  const price=num(priceRaw);
  p.items=p.items||[];
  const wasEdit=!!editItemId;
  const extra={dose:$('#itDose').value.trim(),meal:$('#itMeal').value,days:num($('#itDays').value),note:$('#itNote').value.trim()};
  if(wasEdit){const it=p.items.find(i=>i.id===editItemId);if(it){Object.assign(it,{name,qty,price},extra);}editItemId=null;toast('Medicine updated.');}
  else{p.items.push(Object.assign({id:genId(),name,qty,price},extra));toast('Added as #'+p.items.length);}
  save('mms_patients',patients);renderPatientPage();
  if(!wasEdit){const n=$('#itName');if(n)n.focus();}
}
function editPatientItem(id){editItemId=id;renderPatientPage();}
function cancelItemEdit(){editItemId=null;renderPatientPage();}
function deletePatientItem(id){
  const p=patients.find(x=>x.id===curPatientId);if(!p)return;
  if(!confirm('Remove this medicine from the list?'))return;
  p.items=p.items.filter(i=>i.id!==id);
  if(editItemId===id)editItemId=null;
  save('mms_patients',patients);renderPatientPage();toast('Medicine removed.');
}
function savePatientPaid(full){
  const p=patients.find(x=>x.id===curPatientId);if(!p)return;
  p.paid=full?patientTotal(p):Math.max(0,num($('#ptPaid').value));
  save('mms_patients',patients);renderPatientPage();toast(full?'Marked as fully paid.':'Paid amount saved.');
}
function statementHtml(p){
  const items=p.items||[],total=patientTotal(p),paid=num(p.paid),due=Math.max(0,total-paid);
  const stamp=total>0?(due<=0?'PAID':'DUE'):'';
  return `
  <div class="invoice-print" id="invoicePrint">
    <h2>${esc(shopInfo.icon)} ${esc(shopInfo.name)}</h2>
    <p class="shop-sub">${esc(shopInfo.address||'Your Trusted Pharmacy')}${shopInfo.phone?' | 📞 '+esc(shopInfo.phone):''}${shopInfo.license?'<br>Drug License: '+esc(shopInfo.license):''}</p>
    <hr>
    ${stamp?`<div class="stamp ${stamp==='PAID'?'paid':'due'}">${stamp}</div>`:''}
    <p style="text-align:center;font-weight:800;color:#0f766e;letter-spacing:1px;font-size:12.5px;margin-bottom:4px">MEDICINE STATEMENT</p>
    <div class="meta"><span><b>Patient:</b> ${esc(p.name)}</span><span><b>Date:</b> ${fmtDate(localDate())}</span></div>
    <div class="meta"><span><b>Phone:</b> ${esc(p.phone||'-')}</span></div>
    <div class="meta"><span><b>Address:</b> ${esc(p.address||'-')}</span></div>
    <table>
      <tr><th>#</th><th>Medicine</th><th class="n">Pcs</th><th class="n">Price</th><th class="n">Total</th></tr>
      ${items.length===0?'<tr><td colspan="5" style="text-align:center;color:#64748b">No medicines</td></tr>':items.map((i,k)=>`<tr><td>${k+1}</td><td>${esc(i.name)}${doseSub(i)?`<div style="font-size:10.5px;color:#64748b;margin-top:2px">${esc(doseSub(i))}</div>`:''}</td><td class="n">${num(i.qty)}</td><td class="n">${num(i.price).toFixed(2)}</td><td class="n">${(num(i.qty)*num(i.price)).toFixed(2)}</td></tr>`).join('')}
    </table>
    <div class="tot grand"><span>Total Bill</span><span>${money(total)}</span></div>
    <div class="tot"><span>Paid</span><span>${money(paid)}</span></div>
    <div class="tot" style="font-weight:800;color:${due<=0?'#16a34a':'#dc2626'}"><span>Due</span><span>${money(due)}</span></div>
    <p class="thanks">${esc(shopInfo.note||('Thank you for trusting '+shopInfo.name+'!'))}</p>
    <div class="credit">Created by ABDUR ROHMAN</div>
  </div>`;
}
function showStatement(id){
  const p=patients.find(x=>x.id===id);if(!p)return;
  openModal(`
    ${statementHtml(p)}
    <div class="inv-actions no-print">
      <button class="ia-print" onclick="printInvoice('statement')">🖨️ Print</button>
      <button class="ia-pdf" onclick="downloadPaperPdf('patient','${p.id}')">⬇️ Download PDF</button>
      <button class="ia-img" onclick="downloadPaperImage('patient','${p.id}')">🖼️ Download Image</button>
      <button class="ia-share" onclick="sharePaper('patient','${p.id}')">📤 Share</button>
      ${p.phone?`<button class="ia-wa" onclick="whatsappStatement('${p.id}')">💬 WhatsApp</button>`:''}
      <button class="ia-close" onclick="closeModal()">Close</button>
    </div>`);
}
function whatsappStatement(id){
  const p=patients.find(x=>x.id===id);if(!p)return;
  const total=patientTotal(p),paid=num(p.paid),due=Math.max(0,total-paid);
  let t='*'+shopInfo.name+'*\nPatient: '+p.name+'\nDate: '+fmtDate(localDate())+'\n\n';
  (p.items||[]).forEach((i,k)=>{t+=(k+1)+'. '+i.name+' x'+num(i.qty)+' = '+(num(i.qty)*num(i.price)).toFixed(2)+'\n';const ds=doseSub(i);if(ds)t+='   ('+ds+')\n';});
  t+='\nTotal: '+money(total)+'\nPaid: '+money(paid)+'\nDue: '+money(due)+'\n\nCreated by ABDUR ROHMAN';
  window.open('https://wa.me/'+waNumber(p.phone)+'?text='+encodeURIComponent(t),'_blank');
}


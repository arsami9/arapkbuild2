/* ================= MEMO ================= */
function renderMemo(){
  memoItems=[];
  if(!editingMemoId){}
  $('#page-memo').innerHTML=`
    <div class="page-header"><h2>🧾 Create Memo</h2></div>
    <div class="card form-card">
      <div class="mi-sec">1 · Patient</div>
      <div class="memo-head">
        <div class="full"><label for="memoPatientSearch">Existing Patient (optional) — Search by serial, name or phone</label>
          <input type="search" id="memoPatientSearch" autocomplete="off" placeholder="🔍 Search patient serial / name / phone…">
          <select id="memoPatientSelect" onchange="fillPatientInMemo(this.value)">
            <option value="">-- Walk-in Customer --</option>
            ${[...patients].sort((a,b)=>num(a.sl)-num(b.sl)).map(p=>`<option value="${p.id}">#${slTxt(p)} ${esc(p.name)} (${esc(p.phone)})</option>`).join('')}
          </select></div>
        <div><label for="memoPatientName">Patient Name</label><input type="text" id="memoPatientName" placeholder="Name"></div>
        <div><label for="memoPatientPhone">Phone</label><input type="tel" id="memoPatientPhone" placeholder="Phone"></div>
        <div><label for="memoDate">Date</label><input type="date" id="memoDate" value="${localDate()}"></div>
        <div><label for="memoMethod">Payment</label><select id="memoMethod">${['Cash','bKash','Nagad','Rocket','Card','Credit (Due)'].map(x=>`<option>${x}</option>`).join('')}</select></div>
      </div>
      <div class="mi-sec">2 · Add Items</div>
      <div class="mi-tabs"><button type="button" data-t="list">📦 From Products List</button><button type="button" data-t="custom">✏️ Any Other Item</button></div>
      <div id="miList">
        <div class="barcode-tools"><input type="search" id="memoBarcodeInput" autocomplete="off" placeholder="▥ Scan/type barcode and press Enter"><button type="button" onclick="startBarcodeScanner()">📷 Scan</button></div>
        <p class="hint" style="margin:-3px 0 7px">Barcode match adds the medicine automatically. Camera scanning needs browser camera permission; USB/Bluetooth scanners are also supported.</p>
        <input type="text" id="miSearch" autocomplete="off" placeholder="🔍 Search medicine, generic or company…">
        <div id="miResults"></div>
      </div>
      <div id="miCustom" class="hidden">
        <label for="miCName">Item name</label><input type="text" id="miCName" maxlength="80" placeholder="e.g. Face mask, Thermometer, Baby powder">
        <div class="row2"><div><label for="miCQty">Qty</label><input type="number" min="1" id="miCQty" value="1" inputmode="numeric"></div>
        <div><label for="miCPrice">Price per pc (৳)</label><input type="number" min="0" step="0.01" id="miCPrice" inputmode="decimal"></div></div>
        <button type="button" class="btn-outline btn-block" style="margin-top:10px" onclick="miAddCustom()">+ Add Item</button>
      </div>
      <div class="mi-sec">3 · Items <span id="miCount" class="chip">0</span></div>
      <div id="memoItemsContainer"></div>
      <div class="mi-sec">4 · Discount &amp; Payment</div>
      <div class="row2">
        <div><label for="memoDiscPct">Discount on whole memo</label><select id="memoDiscPct" onchange="calcMemoTotals()">${pctOptions(0)}</select></div>
        <div><label for="memoExtraDisc">Extra flat discount (৳)</label><input type="number" min="0" id="memoExtraDisc" placeholder="0" oninput="calcMemoTotals()"></div>
      </div>
      <div class="memo-summary">
        <p><span>Subtotal</span><span id="memoSubtotal">৳0</span></p>
        <p><span>Total Discount</span><span id="memoTotalDiscount">৳0</span></p>
        <p class="grand-total"><span>Grand Total</span><span id="memoGrandTotal">৳0</span></p>
      </div>
      <label for="memoPaidAmount">Paid Amount (৳) — leave empty if fully paid</label>
      <input type="number" min="0" id="memoPaidAmount" placeholder="Full amount" oninput="calcMemoTotals()">
      <div class="memo-summary" style="margin-top:10px;"><p style="font-weight:800;"><span>Due Amount</span><span id="memoDueDisplay" style="color:var(--danger);">৳0</span></p></div>
      <label for="memoNote">Note on receipt (optional)</label>
      <input type="text" id="memoNote" placeholder="e.g. Take medicine after meal">
      <button class="btn-primary" onclick="saveMemo()">${editingMemoId?'💾 Update Memo & Print Receipt':'✅ Save & Print Receipt'}</button>
    </div>
    <div class="history-section">
      <h3>📋 Memo History</h3>
      <input type="text" class="search-box" id="memoSearch" placeholder="🔍 Search memo no/serial, name, phone, date or amount..." value="${esc(memoQuery)}">
      <div class="filter-chips" id="memoChips"><button data-f="all">All</button><button data-f="due">💰 Due</button><button data-f="today">Today</button></div>
      <div id="memoHistoryList"></div>
    </div>`;
  const patientSearch=$('#memoPatientSearch');
  if(patientSearch)patientSearch.oninput=function(){
    const q=this.value.trim().toLowerCase(),sel=$('#memoPatientSelect'),old=sel.value;
    const matches=[...patients].sort((a,b)=>num(a.sl)-num(b.sl)).filter(p=>!q||String(p.sl||'').toLowerCase().includes(q)||String(p.name||'').toLowerCase().includes(q)||String(p.phone||'').toLowerCase().includes(q)||String(p.id||'').toLowerCase().includes(q));
    sel.innerHTML='<option value="">-- Walk-in Customer --</option>'+matches.map(p=>`<option value="${p.id}">#${slTxt(p)} ${esc(p.name)} (${esc(p.phone)})</option>`).join('');
    if(matches.some(p=>p.id===old))sel.value=old;
  };
  $('#memoSearch').oninput=function(){memoQuery=this.value;renderMemoHistoryList();};
  document.querySelectorAll('#memoChips button').forEach(b=>b.onclick=function(){memoFilter=b.dataset.f;renderMemoHistoryList();});
  document.querySelectorAll('.mi-tabs button').forEach(b=>b.onclick=function(){miTab=b.dataset.t;miShowTab();});
  $('#miSearch').oninput=miSearchRender;
  const bcInput=$('#memoBarcodeInput');if(bcInput){bcInput.onkeydown=function(ev){if(ev.key==='Enter'){ev.preventDefault();handleScannedBarcode(this.value);this.value='';}};bcInput.onchange=function(){const v=this.value.trim();if(v){handleScannedBarcode(v);this.value='';}};}
  miShowTab();renderMemoItems();renderMemoHistoryList();
}
function addMemoRow(){
  const c=$('#memoItemsContainer');
  const rowId='row'+Date.now()+Math.floor(Math.random()*1000);
  const div=document.createElement('div');
  div.className='memo-row';div.id=rowId;
  div.innerHTML=`
    <input type="text" class="memo-prod" list="memoProdList" autocomplete="off" placeholder="Type medicine…" oninput="onMemoProductChange('${rowId}')" onchange="onMemoProductChange('${rowId}')">
    <input type="number" min="1" value="1" class="memo-qty" oninput="calcMemoTotals()">
    <input type="number" min="0" step="0.01" class="memo-price" placeholder="0" oninput="calcMemoTotals()">
    <input type="number" min="0" value="0" class="memo-discount" oninput="calcMemoTotals()">
    <span class="memo-line-total">৳0</span>
    <button type="button" class="remove-row" onclick="removeMemoRow('${rowId}')">×</button>`;
  c.appendChild(div);
}
function onMemoProductChange(rowId){
  const row=document.getElementById(rowId);if(!row)return;
  const v=row.querySelector('.memo-prod').value.trim();
  const p=v?products.find(x=>prodLabel(x)===v):null;
  if(p){row.dataset.pid=p.id;row.querySelector('.memo-price').value=p.mrp;row.querySelector('.memo-prod').title='Stock: '+num(p.stock);}
  else{row.dataset.pid='';}
  calcMemoTotals();
}
function removeMemoRow(){}
function memoCalc(){
  let subtotal=0,lineDisc=0;
  memoItems.forEach(i=>{const g=num(i.qty)*num(i.price);i.g=g;i.d=Math.round(g*num(i.pct))/100;subtotal+=g;lineDisc+=i.d;});
  const pctEl=$('#memoDiscPct'),pct=pctEl?num(pctEl.value):0;
  const pctAmt=Math.round((subtotal-lineDisc)*pct)/100,flat=num($('#memoExtraDisc')&&$('#memoExtraDisc').value);
  const r2=v=>Math.round(v*100)/100;subtotal=r2(subtotal);const totalDisc=r2(lineDisc+pctAmt+flat),grand=Math.max(0,r2(subtotal-totalDisc));
  const paidEl=$('#memoPaidAmount'),paidInput=paidEl?paidEl.value.trim():'';
  const paid=paidInput===''?grand:Math.min(num(paidInput),grand);
  return {subtotal,lineDisc,pct,pctAmt,flat,extra:pctAmt+flat,totalDisc,grand,paid,due:Math.max(0,r2(grand-paid))};
}
function calcMemoTotals(){
  const c=memoCalc();
  document.querySelectorAll('.mi-row').forEach(el=>{const i=memoItems.find(x=>x.k===el.dataset.k);if(i)el.querySelector('.mi-lv').textContent=money(i.g-i.d);});
  $('#memoSubtotal').textContent=money(c.subtotal);
  $('#memoTotalDiscount').textContent=money(c.totalDisc);
  $('#memoGrandTotal').textContent=money(c.grand);
  $('#memoDueDisplay').textContent=money(c.due);
}
function fillPatientInMemo(patientId){
  if(!patientId)return;
  const p=patients.find(x=>x.id===patientId);if(!p)return;
  $('#memoPatientName').value=p.name;$('#memoPatientPhone').value=p.phone;
  const due=getPatientDue(p.phone);
  if(due>0)toast('Previous due of this patient: '+money(due));
  const rx=p.items||[],usual=(p.products||[]).filter(pr=>products.find(x=>x.id===pr.id));
  if(rx.length>0&&confirm("Load this patient's prescription medicines into the memo?")){
    memoItems=[];
    rx.forEach(i=>{const pr=products.find(x=>miFullName(x)===i.name);memoItems.push({k:genId(),pid:pr?pr.id:'',name:i.name,qty:num(i.qty)||1,price:num(i.price)||(pr?num(pr.mrp):0),pct:0});});
    renderMemoItems();
  }else if(rx.length===0&&usual.length>0&&confirm("Load this patient's usual products into the memo?")){
    memoItems=[];usual.forEach(pr=>{const x=products.find(y=>y.id===pr.id);memoItems.push({k:genId(),pid:x.id,name:miFullName(x),qty:1,price:num(x.mrp),pct:0});});
    renderMemoItems();
  }
}
function saveMemo(){
  const patientName=$('#memoPatientName').value.trim(),patientPhone=$('#memoPatientPhone').value.trim();
  const date=$('#memoDate').value||localDate(),selId=$('#memoPatientSelect').value;
  if(!patientName){toast('Please enter patient name.','error');return;}
  const c=memoCalc(),items=[],over=[];
  memoItems.forEach(i=>{
    const qty=num(i.qty);if(qty<=0||!String(i.name||'').trim())return;
    const prod=i.pid?products.find(p=>p.id===i.pid):null;
    if(prod&&qty>num(prod.stock))over.push(prod.name);
    items.push({productId:prod?prod.id:'',name:i.name.trim(),qty:qty,price:num(i.price),discount:i.d,pct:num(i.pct),cost:prod?num(prod.cost):0,total:i.g-i.d});
  });
  if(items.length===0){toast('Please add at least one item.','error');return;}
  const added=autoSaveMemoData(patientName,patientPhone,selId,items);
  const now=new Date(),prevDue=patientPhone?getPatientDue(patientPhone):0;
  const memo={
    id:editingMemoId||genId(),memoNo:editingMemoId?(memos.find(x=>x.id===editingMemoId)||{}).memoNo||nextMemoNo():nextMemoNo(),date:date,time:pad2(now.getHours())+':'+pad2(now.getMinutes()),patientName:patientName,patientPhone:patientPhone,items:items,
    subtotal:c.subtotal,extraDiscount:c.extra,totalDiscount:c.totalDisc,discPct:c.pct,flatDisc:c.flat,grandTotal:c.grand,paid:c.paid,due:c.due,
    method:$('#memoMethod').value,note:$('#memoNote').value.trim(),prevDue:prevDue,servedBy:currentUserName(),servedById:session?session.id:'',
    payments:c.paid>0?[{date:date,amount:c.paid}]:[]
  };
  if(editingMemoId){
    const ix=memos.findIndex(x=>x.id===editingMemoId),old=ix>=0?memos[ix]:null;
    if(old){
      (old.items||[]).forEach(i=>{const p=products.find(p=>p.id===i.productId);if(p)p.stock=num(p.stock)+num(i.qty);});
      items.forEach(i=>{const p=products.find(p=>p.id===i.productId);if(p)p.stock=Math.max(0,num(p.stock)-i.qty);});
      memo.payments=old.payments||[];memo.prevDue=old.prevDue||0;memos[ix]=memo;
    }
  }else{
    memos.push(memo);
    items.forEach(i=>{const p=products.find(p=>p.id===i.productId);if(p)p.stock=Math.max(0,num(p.stock)-i.qty);});
  }
  save('mms_memos',memos);save('mms_products',products);
  updateAlertBadge();memoDraft=null;
  let msg=editingMemoId?'Memo updated!':'Memo saved!';
  editingMemoId=null;
  if(added.np||added.ni)msg+=' Added to lists: '+(added.np?'1 patient':'')+(added.np&&added.ni?' & ':'')+(added.ni?added.ni+' product(s)':'');
  else if(over.length)msg='Saved. Stock was lower than quantity for: '+over.join(', ');
  toast(msg);
  renderMemo();
  showInvoice(memo);
}
function filteredMemos(){
  const q=memoQuery.toLowerCase(),today=localDate();
  return [...memos].reverse().filter(m=>{
    if(memoFilter==='due'&&!(m.due>0))return false;
    if(memoFilter==='today'&&m.date!==today)return false;
    return !q||String(m.memoNo||'').toLowerCase().includes(q)||String(m.patientName||'').toLowerCase().includes(q)||String(m.patientPhone||'').includes(q)||String(m.date||'').includes(q)||String(m.id||'').toLowerCase().includes(q)||String(m.grandTotal||'').includes(q);
  });
}
function renderMemoHistoryList(){
  const c=$('#memoHistoryList');if(!c)return;
  document.querySelectorAll('#memoChips button').forEach(b=>b.classList.toggle('active',b.dataset.f===memoFilter));
  const list=filteredMemos().slice(0,60);
  if(list.length===0){c.innerHTML='<p class="empty-state">No memos found.</p>';return;}
  c.innerHTML=list.map(m=>`
    <div class="item-card">
      <div class="item-info">
        <h4>${esc(m.memoNo)} - ${esc(m.patientName)}</h4>
        <p>${fmtDate(m.date)} | ${money(m.grandTotal)} | <span class="${m.due>0?'status-due':'status-paid'}">${m.due>0?'Due '+money(m.due):'✅ Paid'}</span></p>
      </div>
      <div class="item-actions">
        ${m.due>0?`<button title="Collect due" onclick="recordPayment('${m.id}')">💰</button>`:''}
        <button title="Edit memo" onclick="editMemo('${m.id}')">✏️</button>
        <button title="View / Download" onclick="viewMemoById('${m.id}')">👁️</button>
        <button title="Delete memo and restore stock" onclick="deleteMemo('${m.id}')">🗑️</button>
      </div>
    </div>`).join('');
}
function viewMemoById(id){const m=memos.find(x=>x.id===id);if(m)showInvoice(m);}
function editMemo(id){
  const m=memos.find(x=>x.id===id);if(!m)return;
  closeModal();editingMemoId=id;
  navigate('memo');
  setTimeout(()=>{
    memoItems=(m.items||[]).map(i=>({k:genId(),pid:i.productId||'',name:i.name,qty:num(i.qty)||1,price:num(i.price),pct:num(i.pct),g:num(i.qty)*num(i.price),d:num(i.discount)}));
    const set=(sel,val)=>{const el=$(sel);if(el)el.value=val==null?'':val;};
    set('#memoPatientName',m.patientName);set('#memoPatientPhone',m.patientPhone);set('#memoDate',m.date);set('#memoMethod',m.method||'Cash');set('#memoDiscPct',m.discPct||0);set('#memoExtraDisc',m.flatDisc||0);set('#memoPaidAmount',m.paid);set('#memoNote',m.note||'');
    const sel=$('#memoPatientSelect');if(sel){const p=patients.find(p=>p.phone&&p.phone===m.patientPhone||p.name===m.patientName);if(p)sel.value=p.id;}
    renderMemoItems();calcMemoTotals();
    const h=$('#page-memo .page-header h2');if(h)h.textContent='✏️ Edit Memo '+m.memoNo;
    window.scrollTo({top:0,behavior:'smooth'});
  },30);
}
function deleteMemo(id){
  const m=memos.find(x=>x.id===id);if(!m)return;
  if(!confirm('Delete memo '+m.memoNo+'? Sold quantities will be added back to stock.'))return;
  m.items.forEach(i=>{const p=products.find(x=>x.id===i.productId);if(p)p.stock=num(p.stock)+num(i.qty);});
  save('mms_products',products);
  memos=memos.filter(x=>x.id!==id);save('mms_memos',memos);
  renderMemoHistoryList();updateAlertBadge();toast('Memo deleted & stock restored.');
}
function recordPayment(memoId){
  const memo=memos.find(m=>m.id===memoId);if(!memo)return;
  openModal(`
    <h3>💰 Collect Payment</h3>
    <p style="font-size:13px;color:var(--muted);margin-bottom:6px;">${esc(memo.memoNo)} — ${esc(memo.patientName)}<br>Due: <b class="status-due">${money(memo.due)}</b></p>
    <form id="paymentForm">
      <label for="paymentAmount">Payment Amount (৳)</label>
      <input type="number" min="1" id="paymentAmount" value="${memo.due}">
      <div class="modal-actions"><button type="button" class="btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn-primary">Save Payment</button></div>
    </form>`);
  $('#paymentForm').onsubmit=function(e){
    e.preventDefault();
    const a=num($('#paymentAmount').value);
    if(a<=0){toast('Enter a valid amount.','error');return;}
    applyPayment(memo,Math.min(a,memo.due));
    save('mms_memos',memos);closeModal();
    if($('#memoHistoryList'))renderMemoHistoryList();
    if(!$('#page-dues').classList.contains('hidden'))renderDues();
    if(!$('#page-home').classList.contains('hidden'))renderHome();
    toast('Payment recorded!');
  };
}
function applyPayment(memo,amount){
  memo.payments=memo.payments||[];
  memo.payments.push({date:localDate(),amount});
  memo.paid=Math.min(num(memo.grandTotal),num(memo.paid)+amount);
  memo.due=Math.max(0,num(memo.grandTotal)-memo.paid);
}


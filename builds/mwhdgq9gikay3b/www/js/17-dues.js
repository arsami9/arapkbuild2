/* ================= DUE LIST ================= */
function renderDues(){
  const groups={};
  memos.filter(m=>num(m.due)>0).forEach(m=>{
    const k=dueKey(m);
    if(!groups[k])groups[k]={name:m.patientName,phone:m.patientPhone,total:0,memos:[]};
    groups[k].total+=num(m.due);groups[k].memos.push(m);
  });
  const list=Object.entries(groups).sort((a,b)=>b[1].total-a[1].total);
  const grand=list.reduce((s,[,g])=>s+g.total,0);
  $('#page-dues').innerHTML=`
    <div class="page-header"><h2>💰 Due List</h2></div>
    <div class="stats-grid">
      <div class="stat-card"><span style="color:var(--danger)">${money(grand)}</span><p>Total Outstanding</p></div>
      <div class="stat-card"><span>${list.length}</span><p>Customers with Due</p></div>
    </div>
    ${list.length===0?'<p class="empty-state">🎉 No dues. All memos are fully paid.</p>':list.map(([k,g])=>`
      <div class="item-card">
        <div class="item-info">
          <h4>${esc(g.name)}</h4>
          <p>${g.phone?'📞 '+esc(g.phone)+' | ':''}${g.memos.length} memo(s)</p>
          <p class="due-text">Due: ${money(g.total)}</p>
        </div>
        <div class="item-actions">
          <button title="Collect" onclick="collectGroup('${esc(k).replace(/'/g,'')}')">💰</button>
          ${g.phone?`<button title="WhatsApp reminder" onclick="remindDue('${esc(k).replace(/'/g,'')}')">💬</button>`:''}
        </div>
      </div>`).join('')}`;
  window._dueGroups=groups;
}
function getGroupByEscKey(k){
  const g=window._dueGroups||{};
  const real=Object.keys(g).find(key=>esc(key).replace(/'/g,'')===k);
  return real?g[real]:null;
}
function collectGroup(k){
  const g=getGroupByEscKey(k);if(!g)return;
  openModal(`
    <h3>💰 Collect from ${esc(g.name)}</h3>
    <p style="font-size:13px;color:var(--muted);margin-bottom:6px;">Total due: <b class="status-due">${money(g.total)}</b><br>Payment is applied to the oldest memo first.</p>
    <form id="groupPayForm">
      <label for="gpAmount">Amount received (৳)</label>
      <input type="number" min="1" id="gpAmount" value="${g.total}">
      <div class="modal-actions"><button type="button" class="btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn-primary">Save Payment</button></div>
    </form>`);
  $('#groupPayForm').onsubmit=function(e){
    e.preventDefault();
    let a=num($('#gpAmount').value);
    if(a<=0){toast('Enter a valid amount.','error');return;}
    a=Math.min(a,g.total);
    [...g.memos].sort((x,y)=>x.date<y.date?-1:1).forEach(m=>{
      if(a<=0)return;
      const pay=Math.min(a,num(m.due));applyPayment(m,pay);a-=pay;
    });
    save('mms_memos',memos);closeModal();renderDues();toast('Payment recorded!');
  };
}
function remindDue(k){
  const g=getGroupByEscKey(k);if(!g)return;
  const t='Dear '+g.name+', your due balance at '+shopInfo.name+' is '+money(g.total)+'. Please clear it at your earliest convenience. Thank you!';
  window.open('https://wa.me/'+waNumber(g.phone)+'?text='+encodeURIComponent(t),'_blank');
}


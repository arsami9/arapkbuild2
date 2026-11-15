/* ================= HOME ================= */
function renderHome(){
  const today=localDate();
  const lowStockList=products.filter(isLowStock);
  const expiringList=products.filter(p=>getExpiryStatus(p.expiry));
  const totalDue=memos.reduce((s,m)=>s+num(m.due),0);
  const todayMemos=memos.filter(m=>m.date===today);
  const todaySales=todayMemos.reduce((s,m)=>s+num(m.grandTotal),0);
  const collected=memos.reduce((s,m)=>s+(m.payments||[]).filter(p=>p.date===today).reduce((a,p)=>a+num(p.amount),0),0);
  let alertHtml='';
  if(lowStockList.length>0||expiringList.length>0){
    alertHtml=`<div class="alert-banner" onclick="navigate('products',{filter:'alert'})">⚠️ ${lowStockList.length} low stock & ${expiringList.length} expiring/expired product(s). Tap to view.</div>`;
  }
  const recent=[...memos].reverse().slice(0,5);
  $('#page-home').innerHTML=`
    <div class="welcome-banner">
      <h2>Welcome, ${esc(session.id)} 👋</h2>
      <p>${new Date().toDateString()}</p>
      <div class="today-row">
        <div><b>${money(todaySales)}</b><small>Today's Sales</small></div>
        <div><b>${money(collected)}</b><small>Cash Collected</small></div>
        <div><b>${todayMemos.length}</b><small>Memos Today</small></div>
      </div>
    </div>
    ${backupBannerHtml()}
    ${alertHtml}
    <div class="stats-grid">
      <div class="stat-card"><span>${products.length}</span><p>Products</p></div>
      <div class="stat-card"><span>${patients.length}</span><p>Patients</p></div>
      <div class="stat-card"><span style="color:var(--danger)">${money(totalDue)}</span><p>Total Due</p></div>
      <div class="stat-card"><span style="color:var(--accent)">${lowStockList.length}</span><p>Low Stock Items</p></div>
    </div>
    <div class="card">
      <h3 style="font-size:15px;">Quick Actions</h3>
      <div class="qa-grid">
        <button onclick="navigate('memo')">🧾 New Memo</button>
        <button onclick="navigate('products');setTimeout(()=>openProductForm(),50)">💊 Add Product</button>
        <button onclick="navigate('patients');setTimeout(()=>openPatientForm(),50)">🧑‍🤝‍🧑 Add Patient</button>
        <button onclick="navigate('dues')">💰 Collect Due</button>
      </div>
    </div>
    <div class="history-section">
      <h3>📋 Recent Memos</h3>
      ${recent.length===0?'<p class="empty-state">No memos yet. Create your first memo!</p>':recent.map(m=>`
        <div class="item-card">
          <div class="item-info"><h4>${esc(m.memoNo)} - ${esc(m.patientName)}</h4><p>${fmtDate(m.date)} | ${money(m.grandTotal)} | <span class="${m.due>0?'status-due':'status-paid'}">${m.due>0?'Due '+money(m.due):'✅ Paid'}</span></p></div>
          <div class="item-actions"><button onclick="viewMemoById('${m.id}')">👁️</button></div>
        </div>`).join('')}
    </div>`;
}


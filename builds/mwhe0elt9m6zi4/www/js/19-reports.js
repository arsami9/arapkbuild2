/* ================= REPORTS ================= */
function filterMemosByRange(key){
  const today=localDate();
  if(key==='today')return memos.filter(m=>m.date===today);
  if(key==='week')return memos.filter(m=>m.date>=daysAgo(6)&&m.date<=today);
  if(key==='month')return memos.filter(m=>m.date.slice(0,7)===today.slice(0,7));
  return memos;
}
function filterReportStart(k){return k==='today'?localDate():k==='week'?daysAgo(6):k==='month'?localDate().slice(0,8)+'01':'0000-01-01';}
function renderReports(filterKey){
  currentReportFilter=filterKey||currentReportFilter||'month';
  const filtered=filterMemosByRange(currentReportFilter);
  const totalSales=filtered.reduce((s,m)=>s+num(m.grandTotal),0);
  const totalDiscount=filtered.reduce((s,m)=>s+num(m.totalDiscount),0);
  const totalDue=filtered.reduce((s,m)=>s+num(m.due),0);
  const expenseTotal=(expenses||[]).filter(x=>x.date>=(filterReportStart(currentReportFilter))&&x.date<=localDate()).reduce((s,x)=>s+num(x.amount),0);
  const hasCost=filtered.some(m=>m.items.some(i=>num(i.cost)>0));
  const profit=filtered.reduce((s,m)=>s+memoProfit(m),0);
  const productTotals={};
  filtered.forEach(m=>m.items.forEach(i=>{productTotals[i.name]=(productTotals[i.name]||0)+num(i.qty);}));
  const top=Object.entries(productTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxQty=top.length?top[0][1]:1;
  // last 7 days
  const days=[];for(let i=6;i>=0;i--){const d=daysAgo(i);days.push({d,label:d.slice(8)+'/'+d.slice(5,7),v:memos.filter(m=>m.date===d).reduce((s,m)=>s+num(m.grandTotal),0)});}
  const maxDay=Math.max(1,...days.map(x=>x.v));
  const low=products.filter(isLowStock),exp=products.filter(p=>getExpiryStatus(p.expiry));
  $('#page-reports').innerHTML=`
    <div class="page-header"><h2>📊 Sales Reports</h2></div>
    <div class="filter-tabs">
      ${[['today','Today'],['week','7 Days'],['month','This Month'],['all','All Time']].map(([k,l])=>`<button class="${currentReportFilter===k?'active':''}" onclick="renderReports('${k}')">${l}</button>`).join('')}
    </div>
    <div class="stats-grid">
      <div class="stat-card"><span>${money(totalSales)}</span><p>Total Sales</p></div>
      <div class="stat-card"><span>${money(expenseTotal)}</span><p>Recorded Expenses</p></div>
      <div class="stat-card"><span style="color:var(--success)">${hasCost?money(profit):'—'}</span><p>Est. Profit ${hasCost?'':'(add purchase price)'}</p></div>
      <div class="stat-card"><span style="color:var(--danger)">${money(totalDue)}</span><p>Due in Period</p></div>
      <div class="stat-card"><span>${filtered.length}</span><p>Memos · Discount ${money(totalDiscount)}</p></div>
    </div>
    <div class="section-title">📈 Last 7 Days Sales</div>
    <div class="card"><div class="chart7">${days.map(x=>`<div class="col"><div class="val">${x.v>0?Math.round(x.v):''}</div><div class="bar" style="height:${Math.max(3,x.v/maxDay*92)}%"></div><div class="day">${x.label}</div></div>`).join('')}</div></div>
    <div class="section-title">🏆 Top Selling Products</div>
    <div class="card">
      ${top.length===0?'<p class="empty-state">No sales data for this period.</p>':top.map(([n,q])=>`
        <div class="report-bar-item"><div class="report-bar-label"><span>${esc(n)}</span><span>${q} pcs</span></div>
        <div class="report-bar-track"><div class="report-bar-fill" style="width:${q/maxQty*100}%"></div></div></div>`).join('')}
    </div>
    <div class="section-title">⚠️ Low Stock (≤ ${num(settings.low)})</div>
    ${low.length===0?'<p class="empty-state">No low stock products.</p>':low.map(p=>`<div class="item-card"><div class="item-info"><h4>${esc(p.name)}</h4><p>Stock remaining: ${num(p.stock)}</p></div><div class="item-actions"><button onclick="openRestock('${p.id}')">➕</button></div></div>`).join('')}
    <div class="section-title">⏰ Expiring / Expired</div>
    ${exp.length===0?'<p class="empty-state">No expiring products.</p>':exp.map(p=>{const e=getExpiryStatus(p.expiry);return `<div class="item-card"><div class="item-info"><h4>${esc(p.name)}</h4><p>Expiry: ${fmtDate(p.expiry)}</p></div><span class="chip ${e.cls}">${e.label}</span></div>`;}).join('')}
    <div class="section-title">⬇️ Export (Excel / CSV)</div>
    <div class="card"><div class="stack">
      <button class="btn-outline btn-block" onclick="exportCsv('memos')">Download Memos / Sales (${currentReportFilter})</button>
      <button class="btn-outline btn-block" onclick="exportCsv('products')">Download Products & Stock</button>
      <button class="btn-outline btn-block" onclick="exportCsv('dues')">Download Due List</button>
      <button class="btn-outline btn-block" onclick="exportCsv('expenses')">Download Expenses</button>
      <button class="btn-outline btn-block" onclick="navigate('operations')">📦 Manage Purchases, Suppliers & Expenses</button>
    </div></div>`;
}
function csvCell(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function exportCsv(kind){
  let rows=[];
  if(kind==='memos'){
    rows.push(['Memo No','Date','Patient','Phone','Items','Subtotal','Discount','Grand Total','Paid','Due']);
    filterMemosByRange(currentReportFilter).forEach(m=>rows.push([m.memoNo,m.date,m.patientName,m.patientPhone,m.items.map(i=>i.name+' x'+i.qty).join('; '),m.subtotal,m.totalDiscount,m.grandTotal,m.paid,m.due]));
  }else if(kind==='products'){
    rows.push(['Name','Strength','Company','Barcode','Box Qty','MRP','Purchase Price','Stock','Expiry']);
    products.forEach(p=>rows.push([p.name,p.strength,p.company,p.barcode||'',p.boxQty,p.mrp,p.cost||'',p.stock,p.expiry||'']));
  }else if(kind==='expenses'){
    rows.push(['Date','Category','Description','Amount','Payment Method']);(expenses||[]).forEach(x=>rows.push([x.date,x.category,x.description,x.amount,x.method]));
  }else{
    rows.push(['Memo No','Date','Patient','Phone','Grand Total','Paid','Due']);
    memos.filter(m=>num(m.due)>0).forEach(m=>rows.push([m.memoNo,m.date,m.patientName,m.patientPhone,m.grandTotal,m.paid,m.due]));
  }
  const csv='﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
  downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),'MMS_'+kind+'_'+localDate()+'.csv');
  toast('CSV downloaded.');
}


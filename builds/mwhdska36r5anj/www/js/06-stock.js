/* ================= STOCK / EXPIRY / DUE ================= */
function isLowStock(p){return num(p.stock)<=num(settings.low);}
function getExpiryStatus(expiry){
  if(!expiry) return null;
  const diff=Math.round((new Date(expiry+'T00:00:00')-new Date(localDate()+'T00:00:00'))/86400000);
  if(diff<0) return {label:'❌ Expired',cls:'chip-danger'};
  if(diff<=num(settings.expDays)) return {label:'⏰ Expires in '+diff+'d',cls:'chip-warn'};
  return null;
}
function alertCount(){return products.filter(p=>isLowStock(p)||getExpiryStatus(p.expiry)).length;}
function updateAlertBadge(){
  const total=alertCount(), badge=$('#alertBadge');
  if(total>0){badge.textContent=total>9?'9+':total;badge.classList.remove('hidden');}
  else badge.classList.add('hidden');
}
function dueKey(m){return (m.patientPhone||m.patientName||'').trim().toLowerCase();}
function getPatientDue(phone){return memos.filter(m=>m.patientPhone===phone&&m.patientPhone).reduce((s,m)=>s+num(m.due),0);}
function nextMemoNo(){
  let max=load('mms_memocounter',0);
  memos.forEach(m=>{const n=parseInt(String(m.memoNo).replace(/\D/g,''),10);if(n>max)max=n;});
  max++;save('mms_memocounter',max);
  return 'MMS-'+String(max).padStart(4,'0');
}
function memoProfit(m){
  const costTotal=(m.items||[]).reduce((s,i)=>s+num(i.cost)*num(i.qty),0);
  return num(m.grandTotal)-costTotal;
}


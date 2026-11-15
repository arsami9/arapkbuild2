/* Model Medicine Shop - Smart Tools add-on (features.js)
   Adds: Sales Return, Stock Adjustment, Reorder List, Daily Closing, Profit & Loss,
   plus Android WebView bridge (file save + print). Loaded AFTER the main script. */
(function(){
'use strict';
if(window.__MMS_EXT__)return;window.__MMS_EXT__=true;
var PAGE='tools',tab='ret',retMemoId=null,closeDate=null,pnlFrom=null,pnlTo=null;
function D(id){return document.getElementById(id);}
function r2(v){return Math.round(num(v)*100)/100;}
function stockLog(){return load('mms_stocklog',[]);}
function row(l,v,c){return '<div class="sum-line"><span>'+l+'</span><b'+(c?' style="color:'+c+'"':'')+'>'+v+'</b></div>';}

/* ---------- Android bridge (only active inside the APK) ---------- */
if(window.AndroidBridge){
  if(typeof window.AndroidBridge.saveFile==='function'){
    window.downloadBlob=function(blob,name){
      var rd=new FileReader();
      rd.onloadend=function(){
        try{window.AndroidBridge.saveFile(String(rd.result).split(',')[1]||'',name,blob.type||'application/octet-stream');}
        catch(e){toast('Could not save file.','error');}
      };
      rd.readAsDataURL(blob);
    };
  }
  if(typeof window.AndroidBridge.print==='function'){
    window.print=function(){try{window.AndroidBridge.print();}catch(e){toast('Print failed.','error');}};
  }
}

/* ---------- backup includes stock log ---------- */
var _cb=collectBackup;
collectBackup=function(){var o=_cb();o.mms_stocklog=stockLog();return o;};

/* ---------- page + drawer + navigation hook ---------- */
function setup(){
  var main=document.querySelector('main.content');
  if(main&&!D('page-tools')){var s=document.createElement('section');s.id='page-tools';s.className='page hidden';main.appendChild(s);}
  var ul=document.querySelector('#drawer ul');
  if(ul&&!D('toolsNavItem')){
    var li=document.createElement('li');li.id='toolsNavItem';li.textContent='🧰 Smart Tools';
    li.onclick=function(){navigate(PAGE);};
    ul.insertBefore(li,ul.querySelector('li[data-page="settings"]')||null);
  }
  PAGE_TITLES.tools='🧰 Smart Tools';
  var orig=_navigate;
  _navigate=function(page,opts){orig(page,opts);if(page===PAGE)renderTools();};
}

function renderTools(){
  var el=D('page-tools');if(!el)return;
  var tabs=[['ret','↩️ Return'],['adj','🛠️ Stock'],['reo','🛒 Reorder'],['cls','📒 Closing'],['pnl','📈 P&L']];
  el.innerHTML='<div class="page-header"><h2>🧰 Smart Tools</h2></div><div class="filter-chips">'+
    tabs.map(function(t){return '<button data-t="'+t[0]+'" class="'+(tab===t[0]?'active':'')+'">'+t[1]+'</button>';}).join('')+
    '</div><div id="toolsBody"></div>';
  el.querySelectorAll('.filter-chips button').forEach(function(b){b.onclick=function(){tab=b.dataset.t;renderTools();};});
  var fn={ret:tReturn,adj:tAdjust,reo:tReorder,cls:tClose,pnl:tPnl}[tab]||tReturn;
  try{fn();}catch(e){D('toolsBody').innerHTML='<p class="empty-state">Something went wrong. Please try again.</p>';}
}

/* ---------- 1. Sales return ---------- */
function tReturn(){
  var b=D('toolsBody');
  b.innerHTML='<div class="card form-card"><label for="rtQ">Find memo (no / name / phone)</label>'+
    '<input id="rtQ" class="search-box" placeholder="🔍 MMS-0001, name or phone"><div id="rtList"></div></div><div id="rtForm"></div>';
  var q=D('rtQ');q.oninput=drawList;drawList();drawForm();
  function drawList(){
    var t=q.value.trim().toLowerCase();
    var l=memos.slice().reverse().filter(function(m){
      return !t||(String(m.memoNo)+' '+m.patientName+' '+(m.patientPhone||'')).toLowerCase().indexOf(t)>=0;
    }).slice(0,15);
    var box=D('rtList');
    box.innerHTML=l.length?l.map(function(m){
      return '<div class="item-card"><div class="item-info"><h4>'+esc(m.memoNo)+' - '+esc(m.patientName)+'</h4><p>'+fmtDate(m.date)+' | '+money(m.grandTotal)+'</p></div><div class="item-actions"><button data-id="'+m.id+'">↩️</button></div></div>';
    }).join(''):'<p class="empty-state">No memos found.</p>';
    box.querySelectorAll('button[data-id]').forEach(function(x){
      x.onclick=function(){retMemoId=x.dataset.id;drawForm();D('rtForm').scrollIntoView({behavior:'smooth'});};
    });
  }
  function drawForm(){
    var f=D('rtForm'),m=memos.find(function(x){return x.id===retMemoId;});
    if(!m){f.innerHTML='';return;}
    f.innerHTML='<div class="card form-card"><h3 style="font-size:15px">Return from '+esc(m.memoNo)+'</h3>'+
      m.items.map(function(i,k){
        return '<div class="sum-line"><span>'+esc(i.name)+' <small>(sold '+num(i.qty)+' × '+num(i.price).toFixed(2)+')</small></span><input type="number" min="0" max="'+num(i.qty)+'" value="0" data-k="'+k+'" class="rtq" style="width:70px;padding:8px"></div>';
      }).join('')+'<button class="btn-primary" id="rtGo">Process Return</button></div>';
    D('rtGo').onclick=function(){processReturn(m);};
  }
}
function processReturn(m){
  var rets=[];
  document.querySelectorAll('.rtq').forEach(function(el){
    var it=m.items[+el.dataset.k],n=Math.floor(num(el.value));
    if(it&&n>0)rets.push({k:+el.dataset.k,q:Math.min(n,num(it.qty))});
  });
  if(!rets.length){toast('Enter a return quantity.','error');return;}
  if(!confirm('Process this return? Stock will be added back.'))return;
  var lineNet0=m.items.reduce(function(s,i){return s+num(i.total);},0),extra0=num(m.extraDiscount),gross=0,names=[];
  rets.forEach(function(r){
    var it=m.items[r.k],q=num(it.qty),net=q>0?num(it.total)/q*r.q:0;
    gross+=net;names.push(it.name+' x'+r.q);
    var p=products.find(function(x){return x.id===it.productId;});
    if(p)p.stock=num(p.stock)+r.q;
    it.discount=r2(num(it.discount)*(q-r.q)/q);it.total=r2(num(it.total)-net);it.qty=q-r.q;
  });
  m.items=m.items.filter(function(i){return num(i.qty)>0;});
  var share=(extra0>0&&lineNet0>0)?extra0*gross/lineNet0:0,refund=r2(gross-share);
  m.extraDiscount=r2(extra0-share);
  m.subtotal=r2(m.items.reduce(function(s,i){return s+num(i.qty)*num(i.price);},0));
  m.totalDiscount=r2(m.items.reduce(function(s,i){return s+num(i.discount);},0)+m.extraDiscount);
  var oldPaid=num(m.paid);
  m.grandTotal=Math.max(0,r2(num(m.grandTotal)-refund));
  var newPaid=Math.min(oldPaid,m.grandTotal),cash=r2(oldPaid-newPaid);
  m.paid=newPaid;m.due=Math.max(0,r2(m.grandTotal-newPaid));
  m.payments=m.payments||[];
  if(cash>0)m.payments.push({date:localDate(),amount:-cash});
  m.returns=(m.returns||[]).concat([{date:localDate(),amount:refund,cash:cash,items:names}]);
  save('mms_memos',memos);save('mms_products',products);updateAlertBadge();
  retMemoId=null;toast('Return done. Refund to customer: '+money(cash));renderTools();
}

/* ---------- 2. Stock adjustment ---------- */
function tAdjust(){
  var b=D('toolsBody'),log=stockLog().slice(0,12);
  b.innerHTML='<div class="card form-card"><label for="adQ">Search medicine</label>'+
    '<input id="adQ" class="search-box" placeholder="🔍 name / company / barcode"><select id="adP" size="5" style="height:auto"></select>'+
    '<div class="row2"><div><label for="adT">Action</label><select id="adT"><option value="dec">Reduce (damaged/expired)</option><option value="inc">Add</option><option value="set">Set exact stock</option></select></div>'+
    '<div><label for="adN">Quantity</label><input id="adN" type="number" min="0" inputmode="numeric"></div></div>'+
    '<label for="adR">Reason</label><input id="adR" placeholder="e.g. Damaged, Expired, Count correction">'+
    '<button class="btn-primary" id="adGo">Save Adjustment</button></div>'+
    '<div class="section-title">Recent adjustments</div>'+
    (log.length?log.map(function(x){return '<div class="item-card"><div class="item-info"><h4>'+esc(x.name)+'</h4><p>'+fmtDate(x.date)+' · '+x.before+' → <b>'+x.after+'</b> · '+esc(x.reason||'-')+'</p></div></div>';}).join(''):'<p class="empty-state">None yet.</p>');
  function fill(){
    var t=D('adQ').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var l=products.filter(function(p){
      var h=(p.name+' '+(p.generic||'')+' '+(p.company||'')+' '+(p.strength||'')+' '+(p.barcode||'')).toLowerCase();
      return t.every(function(x){return h.indexOf(x)>=0;});
    }).slice(0,40);
    D('adP').innerHTML=l.map(function(p){return '<option value="'+p.id+'">'+esc(p.name+' '+(p.strength||'')+' — stock '+num(p.stock))+'</option>';}).join('');
  }
  D('adQ').oninput=fill;fill();
  D('adGo').onclick=function(){
    var p=products.find(function(x){return x.id===D('adP').value;}),raw=D('adN').value.trim(),n=num(raw),ty=D('adT').value;
    if(!p){toast('Select a medicine.','error');return;}
    if(raw===''||n<0){toast('Enter a valid quantity.','error');return;}
    var before=num(p.stock),after=ty==='inc'?before+n:ty==='dec'?Math.max(0,before-n):n;
    p.stock=after;
    var lg=stockLog();lg.unshift({date:localDate(),name:(p.name+' '+(p.strength||'')).trim(),before:before,after:after,reason:D('adR').value.trim()});
    save('mms_stocklog',lg.slice(0,200));save('mms_products',products);updateAlertBadge();
    toast('Stock updated: '+before+' → '+after);renderTools();
  };
}

/* ---------- 3. Reorder list ---------- */
function reorderRows(){
  var low=num(settings.low);
  return products.filter(function(p){return num(p.stock)<=low;}).map(function(p){
    var box=Math.max(1,num(p.boxQty)||1),need=Math.max(box,low*3-num(p.stock)),qty=Math.ceil(need/box)*box;
    return {p:p,qty:qty,cost:qty*num(p.cost)};
  }).sort(function(a,b){return a.p.name.localeCompare(b.p.name);});
}
function tReorder(){
  var rows=reorderRows(),total=rows.reduce(function(s,r){return s+r.cost;},0);
  D('toolsBody').innerHTML='<div class="stats-grid"><div class="stat-card"><span>'+rows.length+'</span><p>Items to reorder</p></div><div class="stat-card"><span>'+money(total)+'</span><p>Estimated cost</p></div></div>'+
    (rows.length?'<div class="stack" style="margin-bottom:12px"><button class="btn-outline btn-block" id="roShare">📤 Share list (WhatsApp / apps)</button><button class="btn-outline btn-block" id="roCsv">⬇️ Download CSV</button></div>':'')+
    (rows.length?rows.slice(0,100).map(function(r){
      return '<div class="item-card"><div class="item-info"><h4>'+esc(r.p.name)+' <small>'+esc(r.p.strength||'')+'</small></h4><p>🏭 '+esc(r.p.company||'')+'</p><p>Stock <b>'+num(r.p.stock)+'</b> → order <b>'+r.qty+'</b>'+(r.cost>0?' · '+money(r.cost):'')+'</p></div></div>';
    }).join('')+(rows.length>100?'<p class="hint">Showing 100 of '+rows.length+' (CSV has all).</p>':''):'<p class="empty-state">🎉 No low-stock items.</p>');
  if(!rows.length)return;
  D('roShare').onclick=function(){
    var t='*'+shopInfo.name+' — Order list ('+fmtDate(localDate())+')*\n\n'+rows.map(function(r,k){return (k+1)+'. '+r.p.name+' '+(r.p.strength||'')+' ('+(r.p.company||'')+') — '+r.qty;}).join('\n');
    if(navigator.share){navigator.share({title:'Order list',text:t}).catch(function(){});}
    else window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank');
  };
  D('roCsv').onclick=function(){
    var out=[['Name','Strength','Company','Stock','Order Qty','Est. Cost']].concat(rows.map(function(r){return [r.p.name,r.p.strength||'',r.p.company||'',num(r.p.stock),r.qty,r.cost];}));
    downloadBlob(new Blob(['\uFEFF'+out.map(function(r){return r.map(csvCell).join(',');}).join('\r\n')],{type:'text/csv;charset=utf-8'}),'MMS_reorder_'+localDate()+'.csv');
    toast('CSV saved.');
  };
}

/* ---------- 4. Daily closing ---------- */
function tClose(){
  closeDate=closeDate||localDate();
  D('toolsBody').innerHTML='<div class="card form-card"><label for="clD">Date</label><input type="date" id="clD" value="'+closeDate+'"></div><div id="clOut"></div>';
  D('clD').onchange=function(){closeDate=this.value||localDate();drawClose();};
  drawClose();
  function drawClose(){
    var d=closeDate,day=memos.filter(function(m){return m.date===d;});
    var sales=0,disc=0,items=0,sale=0,dueIn=0,ret=0,methods={};
    day.forEach(function(m){sales+=num(m.grandTotal);disc+=num(m.totalDiscount);items+=(m.items||[]).reduce(function(s,i){return s+num(i.qty);},0);var k=m.method||'Cash';methods[k]=(methods[k]||0)+num(m.paid);});
    memos.forEach(function(m){
      (m.payments||[]).forEach(function(p){if(p.date===d){if(m.date===d)sale+=num(p.amount);else dueIn+=num(p.amount);}});
      (m.returns||[]).forEach(function(r){if(r.date===d)ret+=num(r.amount);});
    });
    var ex=(expenses||[]).filter(function(x){return x.date===d;}).reduce(function(s,x){return s+num(x.amount);},0);
    var pu=(purchases||[]).filter(function(x){return x.date===d;}).reduce(function(s,x){return s+num(x.total);},0);
    var cashIn=sale+dueIn,net=cashIn-ex-pu;
    D('clOut').innerHTML='<div class="card">'+row('Memos',day.length)+row('Items sold',items)+row('Total sales',money(sales))+row('Discount given',money(disc))+row('Returns / refunds',money(ret))+
      '<hr style="border:none;border-top:1px dashed var(--border);margin:8px 0">'+
      Object.keys(methods).map(function(k){return row('Paid via '+esc(k),money(methods[k]));}).join('')+
      row('Collected at sale',money(sale))+row('Old due collected',money(dueIn))+row('Total money in',money(cashIn))+
      row('Expenses','− '+money(ex),'var(--danger)')+row('Purchases','− '+money(pu),'var(--danger)')+
      '<div class="sum-line big"><span>Net for the day</span><span style="color:'+(net>=0?'var(--success)':'var(--danger)')+'">'+money(net)+'</span></div></div>';
  }
}

/* ---------- 5. Profit & Loss ---------- */
function tPnl(){
  pnlTo=pnlTo||localDate();pnlFrom=pnlFrom||localDate().slice(0,8)+'01';
  D('toolsBody').innerHTML='<div class="card form-card"><div class="row2"><div><label for="plF">From</label><input type="date" id="plF" value="'+pnlFrom+'"></div><div><label for="plT">To</label><input type="date" id="plT" value="'+pnlTo+'"></div></div></div><div id="plOut"></div>';
  D('plF').onchange=function(){pnlFrom=this.value||pnlFrom;drawPnl();};
  D('plT').onchange=function(){pnlTo=this.value||pnlTo;drawPnl();};
  drawPnl();
  function drawPnl(){
    var f=pnlFrom,t=pnlTo;
    var ms=memos.filter(function(m){return m.date>=f&&m.date<=t;});
    var rev=0,cogs=0,missing=0;
    ms.forEach(function(m){rev+=num(m.grandTotal);(m.items||[]).forEach(function(i){if(num(i.cost)>0)cogs+=num(i.cost)*num(i.qty);else missing++;});});
    var ex=(expenses||[]).filter(function(x){return x.date>=f&&x.date<=t;}).reduce(function(s,x){return s+num(x.amount);},0);
    var gross=rev-cogs,net=gross-ex;
    D('plOut').innerHTML='<div class="card">'+row('Memos',ms.length)+row('Revenue',money(rev))+row('Cost of goods sold','− '+money(cogs))+row('Gross profit',money(gross),'var(--success)')+row('Expenses','− '+money(ex),'var(--danger)')+
      '<div class="sum-line big"><span>Net profit</span><span style="color:'+(net>=0?'var(--success)':'var(--danger)')+'">'+money(net)+'</span></div>'+
      (missing?'<p class="hint">'+missing+' sold line(s) have no purchase price, so profit may be overstated.</p>':'')+'</div>';
  }
}

setup();
})();

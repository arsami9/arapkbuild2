/* ================= INVOICE ================= */
function invoiceHtml(m){
  const paid=num(m.due)<=0,w=memoW(),hr='<div class="rc-hr"></div>';
  const qtySum=m.items.reduce((s,i)=>s+num(i.qty),0),dpct=num(m.discPct);
  const lineNet=m.items.reduce((s,i)=>s+num(i.total),0),extra=num(m.extraDiscount);
  return `
  <div class="invoice-print rcpt w${w}" id="invoicePrint">
    <div class="rc-c rc-shop">${esc(shopInfo.icon)} ${esc(shopInfo.name)}</div>
    <div class="rc-c rc-sm">${esc(shopInfo.address||'Your Trusted Pharmacy')}${shopInfo.phone?'<br>📞 '+esc(shopInfo.phone):''}${shopInfo.license?'<br>Drug License: '+esc(shopInfo.license):''}</div>
    ${hr}
    <div class="rc-row rc-big"><span>CASH MEMO</span><span>${esc(m.memoNo)}</span></div>
    <div class="rc-row rc-sm"><span>${fmtDate(m.date)}${m.time?' '+esc(m.time):''}</span><span>${esc(m.method||'Cash')}</span></div>
    <div class="rc-row"><span>Patient</span><b>${esc(m.patientName)}</b></div>
    ${m.patientPhone?`<div class="rc-row rc-sm"><span>Phone</span><span>${esc(m.patientPhone)}</span></div>`:''}
    ${hr}
    <table class="rc-tb">
      <tr><th class="c">SL</th><th class="l">Item</th><th>Qty</th><th>Price</th><th>Dis</th><th>Total</th></tr>
      ${m.items.map((i,k)=>`<tr><td class="c">${k+1}</td><td class="l">${esc(i.name)}</td><td>${i.qty}</td><td>${num(i.price).toFixed(2)}</td><td>${num(i.discount)>0?num(i.discount).toFixed(2):'-'}</td><td><b>${num(i.total).toFixed(2)}</b></td></tr>`).join('')}
    </table>
    ${hr}
    <div class="rc-row rc-sm"><span>Items: ${m.items.length}</span><span>Total Qty: ${qtySum}</span></div>
    <div class="rc-row"><span>Sub Total</span><span>${money(lineNet)}</span></div>
    ${extra>0?`<div class="rc-row"><span>Discount${dpct?' ('+dpct+'% on bill)':''}</span><span>− ${money(extra)}</span></div>`:''}
    <div class="rc-row rc-tot"><span>TOTAL</span><span>${money(m.grandTotal)}</span></div>
    <div class="rc-row"><span>Paid</span><span>${money(m.paid)}</span></div>
    <div class="rc-row"><b>Due</b><b>${money(m.due)}</b></div>
    ${num(m.prevDue)>0?`<div class="rc-row rc-sm"><span>Previous due</span><span>${money(m.prevDue)}</span></div>`:''}
    ${num(m.totalDiscount)>0?`<div class="rc-c rc-sm">You saved ${money(m.totalDiscount)}</div>`:''}
    <div class="rc-c"><span class="rc-stamp">${paid?'★ PAID ★':'DUE '+money(m.due)}</span></div>
    ${m.note?`<div class="rc-c rc-sm" style="margin-top:4px">📝 ${esc(m.note)}</div>`:''}
    ${hr}
    <div class="rc-c rc-sm">${esc(shopInfo.note||('Thank you for trusting '+shopInfo.name+'!'))}</div>
    ${m.servedBy?`<div class="rc-c rc-sm">Served by: ${esc(m.servedBy)}</div>`:''}
    <div class="rc-c memo-policy-note">এখানে বাকিতে ঔষধ বিক্রি করা হয় না..?</div>
    <div class="rc-c rc-sm rc-credit">Created by ABDUR ROHMAN</div>
  </div>`;
}
function showInvoice(m){
  const w=memoW();
  openModal(`
    ${invoiceHtml(m)}
    <div class="rc-w no-print"><span>Receipt width</span><button class="${w==='58'?'on':''}" onclick="setMemoW('58','${m.id}')">58 mm</button><button class="${w==='80'?'on':''}" onclick="setMemoW('80','${m.id}')">80 mm</button></div>
    <div class="inv-actions no-print">
      <button class="btn-outline" onclick="editMemo('${m.id}')">✏️ Edit Memo</button>
      <button class="ia-print" onclick="printInvoice('memo')">🖨️ Print</button>
      <button class="ia-pdf" onclick="downloadPaperPdf('memo','${m.id}')">⬇️ Download PDF</button>
      <button class="ia-img" onclick="downloadPaperImage('memo','${m.id}')">🖼️ Download Image</button>
      <button class="ia-share" onclick="sharePaper('memo','${m.id}')">📤 Share</button>
      ${m.patientPhone?`<button class="ia-wa" onclick="whatsappInvoice('${m.id}')">💬 WhatsApp</button>`:''}
      <button class="ia-close" onclick="closeModal()">Close</button>
    </div>`);
}
function printInvoice(kind){
  kind=kind||'memo';
  let st=document.getElementById('pageStyle');
  if(!st){st=document.createElement('style');st.id='pageStyle';document.head.appendChild(st);}
  const is80=kind==='statement'&&settings.paper==='80';
  st.textContent=kind==='rx'?'@page{size:A5;margin:6mm;}':kind==='memo'?'@page{size:'+memoW()+'mm auto;margin:1.5mm;}':is80?'@page{size:80mm auto;margin:3mm;}':'@page{size:A4;margin:12mm;}';
  ['memo','rx','statement'].forEach(k=>document.body.classList.toggle('pk-'+k,k===kind));
  document.body.classList.toggle('paper-80',is80);
  setTimeout(()=>window.print(),50);
}

/* Draw a paper (memo or statement) on a canvas, used for PDF + image download */
function buildPaperCanvas(cfg){
  if(cfg.kind==='memo')return buildMemoCanvas(cfg);
  if(cfg.kind==='rx')return buildRxCanvas(cfg);
  const W=760,P=40,S=2,FONT='"Segoe UI","Noto Sans Bengali","Noto Sans",Roboto,Arial,sans-serif';
  const tall=document.createElement('canvas');
  tall.width=W*S;tall.height=(780+cfg.items.length*56)*S;
  const x=tall.getContext('2d');x.scale(S,S);
  x.fillStyle='#fff';x.fillRect(0,0,W,tall.height);
  function T(s,px,py,o){o=o||{};x.font=(o.w||'400')+' '+(o.s||14)+'px '+FONT;x.fillStyle=o.c||'#1e293b';x.textAlign=o.a||'left';x.textBaseline='alphabetic';x.fillText(String(s),px,py);}
  function fit(s,maxW,o){x.font=((o&&o.w)||'400')+' '+((o&&o.s)||14)+'px '+FONT;s=String(s);if(x.measureText(s).width<=maxW)return s;while(s.length>1&&x.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s+'…';}
  function line(y,dash,c,wd){x.save();x.strokeStyle=c||'#cbd5e1';x.lineWidth=wd||1;if(dash)x.setLineDash([6,4]);x.beginPath();x.moveTo(P,y);x.lineTo(W-P,y);x.stroke();x.restore();}
  let y=P+10;
  x.fillStyle='#0f766e';x.fillRect(0,0,W,8);
  T(fit(shopInfo.name.toUpperCase(),W-2*P,{s:26,w:'800'}),W/2,y+16,{a:'center',s:26,w:'800',c:'#115e59'});y+=40;
  if(shopInfo.address){T(fit(shopInfo.address,W-2*P,{s:13}),W/2,y,{a:'center',s:13,c:'#64748b'});y+=20;}
  const sub=[shopInfo.phone?'Phone: '+shopInfo.phone:'',shopInfo.license?'Drug License: '+shopInfo.license:''].filter(Boolean).join('   |   ');
  if(sub){T(sub,W/2,y,{a:'center',s:13,c:'#64748b'});y+=20;}
  y+=6;line(y,true);y+=28;
  if(cfg.title){T(cfg.title,W/2,y,{a:'center',s:15,w:'800',c:'#0f766e'});y+=28;}
  cfg.meta.forEach(r=>{
    const lab=r.l+': ';T(lab,P,y,{w:'700'});const lw=x.measureText(lab).width;
    T(fit(r.v,r.r?330:W-2*P-lw,{}),P+lw,y);
    if(r.r)T(r.r,W-P,y,{a:'right'});
    y+=26;
  });
  y+=6;
  const cx=cfg.disc?{no:P+10,name:P+36,qty:W-P-250,price:W-P-170,disc:W-P-100,tot:W-P-10}:{no:P+10,name:P+36,qty:W-P-200,price:W-P-110,tot:W-P-10};
  const hc={w:'700',s:13,c:'#115e59'};
  x.fillStyle='#e6f7f4';x.fillRect(P,y,W-2*P,32);
  T('#',cx.no,y+21,hc);T('Product',cx.name,y+21,hc);
  T(cfg.disc?'Qty':'Pcs',cx.qty,y+21,Object.assign({a:'right'},hc));T('Price',cx.price,y+21,Object.assign({a:'right'},hc));
  if(cfg.disc)T('Disc',cx.disc,y+21,Object.assign({a:'right'},hc));
  T('Total',cx.tot,y+21,Object.assign({a:'right'},hc));
  y+=32;
  if(cfg.items.length===0){T('No items',W/2,y+24,{a:'center',s:13,c:'#64748b'});y+=34;line(y,false,'#e2e8f0');}
  cfg.items.forEach((i,k)=>{
    T(k+1,cx.no,y+22,{s:13});T(fit(i.name,cx.qty-cx.name-50,{s:13}),cx.name,y+22,{s:13});
    T(i.qty,cx.qty,y+22,{s:13,a:'right'});T(num(i.price).toFixed(2),cx.price,y+22,{s:13,a:'right'});
    if(cfg.disc)T(num(i.discount).toFixed(2),cx.disc,y+22,{s:13,a:'right'});
    T(num(i.total).toFixed(2),cx.tot,y+22,{s:13,a:'right'});
    if(i.sub){T(fit(i.sub,W-2*P-50,{s:11}),cx.name,y+40,{s:11,c:'#64748b'});y+=52;}else y+=34;
    line(y,false,'#e2e8f0');
  });
  y+=26;
  cfg.totals.forEach(t=>{
    if(t.rule){line(y-10,false,'#1e293b',1.5);y+=6;}
    T(t.l,W-P-250,y,{s:t.s||14,w:t.w,c:t.c});T(t.v,W-P-10,y,{s:t.s||14,w:t.w,c:t.c,a:'right'});
    y+=t.h||24;
  });
  y+=22;line(y,true);y+=30;
  T(fit(cfg.note,W-2*P,{s:13}),W/2,y,{a:'center',s:13,c:'#64748b'});y+=26;
  T('Created by ABDUR ROHMAN',W/2,y,{a:'center',s:8,w:'700',c:'#0f766e'});y+=16;
  const H=Math.ceil(y+P/2);
  const out=document.createElement('canvas');out.width=W*S;out.height=H*S;
  const o=out.getContext('2d');o.fillStyle='#fff';o.fillRect(0,0,out.width,out.height);
  o.drawImage(tall,0,0,W*S,H*S,0,0,W*S,H*S);
  if(cfg.stamp){
    const col=cfg.stamp==='PAID'?'#16a34a':'#dc2626';
    o.save();o.scale(S,S);o.translate(W/2,H/2);o.rotate(-0.42);o.globalAlpha=.14;
    o.font='900 130px '+FONT;o.textAlign='center';o.textBaseline='middle';
    const tw=o.measureText(cfg.stamp).width;
    o.strokeStyle=col;o.lineWidth=12;o.strokeRect(-tw/2-34,-100,tw+68,200);
    o.fillStyle=col;o.fillText(cfg.stamp,0,6);o.restore();
  }
  return out;
}
function safeName(s){return String(s).replace(/[^\wঀ-৿]+/g,'_').replace(/^_+|_+$/g,'')||'file';}
function memoPaperCfg(m){
  const paid=num(m.due)<=0;
  return {kind:'memo',m:m,w:memoW(),pw:(memoW()==='58'?164.41:226.77),fit:true,title:'',disc:true,items:m.items,fileName:'Memo_'+m.memoNo,stamp:paid?'PAID':'DUE',
    meta:[{l:'Memo No',v:m.memoNo,r:'Date: '+fmtDate(m.date)},{l:'Patient',v:m.patientName,r:'Phone: '+(m.patientPhone||'-')}],
    totals:[{l:'Subtotal',v:money(m.subtotal)},{l:'Discount',v:'- '+money(m.totalDiscount)},{l:'Grand Total',v:money(m.grandTotal),s:18,w:'800',h:30,rule:true},{l:'Paid',v:money(m.paid)},{l:'Due',v:money(m.due),w:'800',s:16,c:paid?'#16a34a':'#dc2626'}],
    note:shopInfo.note||('Thank you for trusting '+shopInfo.name+'!')};
}
function statementCfg(p){
  const items=p.items||[],total=patientTotal(p),paid=num(p.paid),due=Math.max(0,total-paid);
  return {kind:'statement',title:'MEDICINE STATEMENT',disc:false,fileName:'Statement_'+safeName(p.name),stamp:total>0?(due<=0?'PAID':'DUE'):'',
    items:items.map(i=>({name:i.name,sub:doseSub(i),qty:num(i.qty),price:num(i.price),discount:0,total:num(i.qty)*num(i.price)})),
    meta:[{l:'Patient',v:p.name,r:'Date: '+fmtDate(localDate())},{l:'Phone',v:p.phone||'-'},{l:'Address',v:p.address||'-'}],
    totals:[{l:'Total Bill',v:money(total),s:18,w:'800',h:30},{l:'Paid',v:money(paid)},{l:'Due',v:money(due),w:'800',s:16,c:due<=0?'#16a34a':'#dc2626'}],
    note:shopInfo.note||('Thank you for trusting '+shopInfo.name+'!')};
}
function canvasToBlob(canvas,type,q){return new Promise(res=>canvas.toBlob(res,type,q));}
async function canvasToPdfBlob(canvas,cfg){
  const jpegBlob=await canvasToBlob(canvas,'image/jpeg',0.93);
  const jpeg=new Uint8Array(await jpegBlob.arrayBuffer());
  const iw=canvas.width,ih=canvas.height;
  const pw=(cfg&&cfg.pw)||595.28,imgH=pw*ih/iw,ph=(cfg&&cfg.fit)?imgH:Math.max((cfg&&cfg.minH)||841.89,imgH);
  const enc=new TextEncoder(),parts=[],offs=[];let len=0;
  const push=u=>{parts.push(u);len+=u.length;};
  const str=s=>push(enc.encode(s));
  str('%PDF-1.4\n');
  const obj=(n,body)=>{offs[n]=len;str(n+' 0 obj\n'+body+'\nendobj\n');};
  obj(1,'<</Type/Catalog/Pages 2 0 R>>');
  obj(2,'<</Type/Pages/Kids[3 0 R]/Count 1>>');
  obj(3,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 '+pw.toFixed(2)+' '+ph.toFixed(2)+']/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>');
  offs[4]=len;
  str('4 0 obj\n<</Type/XObject/Subtype/Image/Width '+iw+'/Height '+ih+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+jpeg.length+'>>\nstream\n');
  push(jpeg);str('\nendstream\nendobj\n');
  const content='q '+pw.toFixed(2)+' 0 0 '+imgH.toFixed(2)+' 0 '+(ph-imgH).toFixed(2)+' cm /Im0 Do Q';
  obj(5,'<</Length '+content.length+'>>\nstream\n'+content+'\nendstream');
  const xref=len;
  let t='xref\n0 6\n0000000000 65535 f \n';
  for(let i=1;i<=5;i++)t+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
  t+='trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n'+xref+'\n%%EOF';
  str(t);
  return new Blob(parts,{type:'application/pdf'});
}
function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},1500);
}
function paperCfg(kind,id){
  if(kind==='memo'){const m=memos.find(x=>x.id===id);return m?memoPaperCfg(m):null;}
  const p=patients.find(x=>x.id===id);if(!p)return null;return kind==='rx'?rxCfg(p):statementCfg(p);
}
async function downloadPaperPdf(kind,id){
  const c=paperCfg(kind,id);if(!c)return;
  try{toast('Preparing PDF...');const b=await canvasToPdfBlob(buildPaperCanvas(c),c);downloadBlob(b,c.fileName+'.pdf');toast('PDF downloaded: '+c.fileName+'.pdf');}
  catch(e){toast('Could not create PDF. Try the image download.','error');}
}
async function downloadPaperImage(kind,id){
  const c=paperCfg(kind,id);if(!c)return;
  try{const b=await canvasToBlob(buildPaperCanvas(c),'image/png');downloadBlob(b,c.fileName+'.png');toast('Image downloaded.');}
  catch(e){toast('Could not create image.','error');}
}
async function sharePaper(kind,id){
  const c=paperCfg(kind,id);if(!c)return;
  try{
    const b=await canvasToBlob(buildPaperCanvas(c),'image/png');
    const file=new File([b],c.fileName+'.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:c.fileName,text:shopInfo.name});}
    else{downloadBlob(b,file.name);toast('Sharing not supported here. Image downloaded instead.');}
  }catch(e){if(e&&e.name!=='AbortError')toast('Share failed.','error');}
}
function memoText(m){
  let s='*'+shopInfo.name+'*\n';
  if(shopInfo.phone)s+='Phone: '+shopInfo.phone+'\n';
  s+='Memo: '+m.memoNo+'\nDate: '+fmtDate(m.date)+'\nPatient: '+m.patientName+'\n\n';
  m.items.forEach((i,k)=>{s+=(k+1)+'. '+i.name+' x'+i.qty+' = '+num(i.total).toFixed(2)+'\n';});
  s+='\n'+(num(m.totalDiscount)>0?'Discount: -'+money(m.totalDiscount)+'\n':'')+'Total: '+money(m.grandTotal)+'\nPaid: '+money(m.paid)+'\nDue: '+money(m.due)+'\n\nThank you!';
  return s;
}
function whatsappInvoice(id){
  const m=memos.find(x=>x.id===id);if(!m)return;
  const n=waNumber(m.patientPhone);
  window.open('https://wa.me/'+n+'?text='+encodeURIComponent(memoText(m)),'_blank');
}


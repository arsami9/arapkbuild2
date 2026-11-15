/* ================= MEMO: auto-save to lists ================= */
function autoSaveMemoData(name,phone,selId,items){
  let np=0,ni=0;const low=name.toLowerCase();
  const exists=patients.some(p=>p.id===selId)||patients.some(p=>phone?p.phone===phone:p.name.toLowerCase()===low);
  if(!exists){patients.push({id:genId(),sl:nextPatientSl(),name:name,address:'',phone:phone,products:[],items:[],paid:0,createdAt:localDate()});np=1;}
  items.forEach(it=>{
    if(it.productId)return;
    const nm=it.name.trim().toLowerCase();
    let pr=products.find(p=>miFullName(p).toLowerCase()===nm||(!p.strength&&p.name.toLowerCase()===nm));
    if(!pr){pr={id:genId(),name:it.name.trim(),generic:'',cat:'Other',form:'',company:'Other',strength:'',boxQty:1,mrp:it.price,cost:0,stock:0,expiry:''};products.push(pr);ni++;}
    it.productId=pr.id;it.cost=num(pr.cost);
  });
  if(np)save('mms_patients',patients);
  return {np:np,ni:ni};
}

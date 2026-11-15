/* ================= PRODUCTS ================= */
function renderProducts(){
  const cos=[...new Set(products.map(p=>p.company).filter(Boolean))].sort();
  prodShow=60;productCo='';
  $('#page-products').innerHTML=`
    <div class="page-header"><h2>💊 Products List</h2><button class="fab-inline" onclick="openProductForm()">+ Add Product</button></div>
    <input type="text" class="search-box" id="prodSearch" placeholder="🔍 Search medicine, generic or company..." value="${esc(productQuery)}">
    <select id="prodCo" class="co-select"><option value="">🏭 All Companies (${cos.length})</option>${cos.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
    <div class="filter-chips" id="prodChips">
      <button data-f="all">All</button><button data-f="low">⚠️ Low Stock</button><button data-f="alert">⏰ Expiry</button>
    </div>
    <p class="hint" id="prodCount" style="margin:2px 2px 8px"></p>
    <div id="prodList"></div>
    <button class="btn-outline btn-block hidden" id="prodMore" style="margin:4px 0 14px">Show more ▼</button>`;
  $('#prodSearch').oninput=function(){productQuery=this.value;prodShow=60;updateProductList();};
  $('#prodCo').onchange=function(){productCo=this.value;prodShow=60;updateProductList();};
  $('#prodMore').onclick=function(){prodShow+=60;updateProductList();};
  document.querySelectorAll('#prodChips button').forEach(b=>b.onclick=function(){productFilter=b.dataset.f;prodShow=60;updateProductList();});
  updateProductList();
}
function updateProductList(){
  const q=productQuery.toLowerCase().trim();
  document.querySelectorAll('#prodChips button').forEach(b=>b.classList.toggle('active',b.dataset.f===productFilter));
  let list=products.filter((p,idx)=>(!productCo||p.company===productCo)&&(!q||q.split(/\s+/).every(t=>(p.name+' '+(p.generic||'')+' '+(p.company||'')+' '+(p.cat||'')+' '+(p.strength||'')+' '+(p.id||'')+' '+(p.barcode||'')+' '+(idx+1)+' '+(p.sl||'')).toLowerCase().includes(t))));
  if(productFilter==='low') list=list.filter(isLowStock);
  if(productFilter==='alert') list=list.filter(p=>isLowStock(p)||getExpiryStatus(p.expiry));
  const total=list.length,shown=list.slice(0,prodShow);
  $('#prodCount').textContent=total+' of '+products.length+' medicines'+(total>shown.length?' · showing '+shown.length:'');
  $('#prodMore').classList.toggle('hidden',total<=shown.length);
  $('#prodList').innerHTML=total===0?'<p class="empty-state">No products found.</p>':shown.map(p=>{
    const exp=getExpiryStatus(p.expiry), low=isLowStock(p);
    const sub=[p.form,p.generic&&p.generic!==p.name?p.generic:'',p.cat].filter(Boolean).join(' · ');
    return `
    <div class="item-card ${num(p.stock)<=0?'out-stock-card':low?'low-stock-card':''}">
      <div class="item-info">
        <h4>${esc(p.name)} <span style="font-weight:500;color:var(--muted);font-size:12px;">${esc(p.strength)}</span></h4>
        ${sub?`<p style="font-size:11.5px">${esc(sub)}</p>`:''}
        <p>🏭 ${esc(p.company)}</p>
        <p>Box: ${esc(p.boxQty)} | MRP: <b>${money(p.mrp)}</b>${num(p.cost)>0?' | Cost: '+money(p.cost):''}</p>
        <p>Stock: <b>${num(p.stock)}</b> ${num(p.stock)<=0?'<span class="out-stock-badge">⛔ OUT OF STOCK</span>':low?'<span class="low-stock-badge">⚠ LOW STOCK</span>':''} ${p.barcode?'<span class="chip">▥ '+esc(p.barcode)+'</span>':''} ${exp?`<span class="chip ${exp.cls}">${exp.label}</span>`:''}</p>
      </div>
      <div class="item-actions">
        <button title="Add stock" onclick="openRestock('${p.id}')">➕</button>
        <button onclick="openProductForm('${p.id}')">✏️</button>
        <button onclick="deleteProduct('${p.id}')">🗑️</button>
      </div>
    </div>`;}).join('');
}
function openProductForm(id){
  const e=id?products.find(p=>p.id===id):null;
  openModal(`
    <h3>${e?'Edit Product':'Add New Product'}</h3>
    <form id="productForm">
      <label for="pName">Product Name</label><input type="text" id="pName" value="${esc(e?e.name:'')}" placeholder="e.g. Napa Extra">
      <label for="pCompany">Company</label><input type="text" id="pCompany" value="${esc(e?e.company:'')}" placeholder="e.g. Beximco Pharmaceuticals">
      <label for="pStrength">Strength</label><input type="text" id="pStrength" value="${esc(e?e.strength:'')}" placeholder="e.g. 500mg">
      <label for="pBarcode">Barcode (optional)</label><input type="text" id="pBarcode" value="${esc(e&&e.barcode?e.barcode:'')}" placeholder="Scan or type product barcode" inputmode="numeric">
      <p class="hint">Barcode must be unique when provided. USB/Bluetooth scanners usually type the code into this field.</p>
      <label for="pBoxQty">Box Quantity</label><input type="number" id="pBoxQty" value="${esc(e?e.boxQty:'')}" placeholder="e.g. 100">
      <div class="row2">
        <div><label for="pMrp">MRP / Sell Price (৳)</label><input type="number" step="0.01" min="0" id="pMrp" value="${esc(e?e.mrp:'')}" placeholder="2.50"></div>
        <div><label for="pCost">Purchase Price (৳)</label><input type="number" step="0.01" min="0" id="pCost" value="${esc(e&&e.cost?e.cost:'')}" placeholder="optional"></div>
      </div>
      <p class="hint">Purchase price is optional. It is used to calculate profit in reports.</p>
      <div class="row2">
        <div><label for="pStock">Stock Quantity</label><input type="number" min="0" id="pStock" value="${e&&e.stock!==undefined?esc(e.stock):0}"></div>
        <div><label for="pExpiry">Expiry Date</label><input type="date" id="pExpiry" value="${esc(e&&e.expiry?e.expiry:'')}"></div>
      </div>
      <div class="modal-actions"><button type="button" class="btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn-primary">Save Product</button></div>
    </form>`);
  $('#productForm').onsubmit=function(ev){
    ev.preventDefault();
    const name=$('#pName').value.trim(),company=$('#pCompany').value.trim(),strength=$('#pStrength').value.trim();
    const boxQty=$('#pBoxQty').value.trim(),mrp=$('#pMrp').value.trim(),cost=$('#pCost').value.trim(),barcode=$('#pBarcode').value.trim();
    const stock=$('#pStock').value.trim()||0,expiry=$('#pExpiry').value;
    if(!name||!company||!strength||!boxQty||mrp===''){toast('Please fill in all required fields.','error');return;}
    if(barcode&&products.some(p=>p.barcode===barcode&&(!e||p.id!==e.id))){toast('This barcode is already assigned to another product.','error');return;}
    if(!e&&products.some(p=>p.name.toLowerCase()===name.toLowerCase()&&p.strength.toLowerCase()===strength.toLowerCase()&&p.company.toLowerCase()===company.toLowerCase())){toast('This product already exists.','error');return;}
    if(e){Object.assign(e,{name,company,strength,boxQty,mrp,cost,stock,expiry,barcode});}
    else products.push({id:genId(),name,company,strength,boxQty,mrp,cost,stock,expiry,barcode});
    save('mms_products',products);closeModal();updateProductList();updateAlertBadge();
    toast(e?'Product updated!':'Product added!');
  };
}
function openRestock(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  openModal(`
    <h3>➕ Add Stock</h3>
    <p style="font-size:13px;color:var(--muted);margin-bottom:6px;">${esc(p.name)} ${esc(p.strength)} — current stock: <b>${num(p.stock)}</b></p>
    <form id="restockForm">
      <label for="rsQty">Quantity to add</label><input type="number" min="1" id="rsQty" placeholder="e.g. 100">
      <label for="rsExp">New expiry date (optional)</label><input type="date" id="rsExp" value="${esc(p.expiry||'')}">
      <div class="modal-actions"><button type="button" class="btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn-primary">Add Stock</button></div>
    </form>`);
  $('#restockForm').onsubmit=function(ev){
    ev.preventDefault();
    const q=num($('#rsQty').value);
    if(q<=0){toast('Enter a valid quantity.','error');return;}
    p.stock=num(p.stock)+q;
    if($('#rsExp').value)p.expiry=$('#rsExp').value;
    save('mms_products',products);closeModal();updateProductList();updateAlertBadge();toast('Stock updated: '+p.stock);
  };
}
function deleteProduct(id){
  if(!confirm('Delete this product?'))return;
  products=products.filter(p=>p.id!==id);save('mms_products',products);updateProductList();updateAlertBadge();toast('Product deleted.');
}


/* ================= DOCTORS ================= */
function renderDoctors(){
  $('#page-doctors').innerHTML=`
    <div class="page-header"><h2>👨‍⚕️ Doctors List</h2><button class="fab-inline" onclick="openDoctorForm()">+ Add Doctor</button></div>
    <input type="text" class="search-box" id="docSearch" placeholder="🔍 Search serial, name, phone, degree or address..." value="${esc(doctorQuery)}">
    <div id="docList"></div>`;
  $('#docSearch').oninput=function(){doctorQuery=this.value;updateDoctorList();};
  updateDoctorList();
}
function updateDoctorList(){
  const q=doctorQuery.toLowerCase();
  const list=doctors.filter((d,idx)=>!q||(d.name||'').toLowerCase().includes(q)||(d.phone||'').toLowerCase().includes(q)||(d.address||'').toLowerCase().includes(q)||(d.degree||'').toLowerCase().includes(q)||(d.bmdc||'').toLowerCase().includes(q)||String(d.sl||idx+1).includes(q)||(d.id||'').toLowerCase().includes(q));
  $('#docList').innerHTML=list.length===0?'<p class="empty-state">No doctors found.</p>':list.map(d=>`
    <div class="item-card">
      <div class="item-info">
        <h4>${esc(d.name)}</h4>
        <p>📞 ${esc(d.phone)} | 📍 ${esc(d.address)}</p>
        <div>${(d.products||[]).map(pr=>`<span class="chip">${esc(pr.name)}</span>`).join('')||'<span style="font-size:11px;color:var(--muted);">No products</span>'}</div>
      </div>
      <div class="item-actions">
        <button onclick="openDoctorForm('${d.id}')">✏️</button>
        <button onclick="deleteDoctor('${d.id}')">🗑️</button>
      </div>
    </div>`).join('');
}
function openDoctorForm(id){
  const e=id?doctors.find(d=>d.id===id):null;
  currentSelection=e?e.products.map(p=>p.id):[];
  openModal(`
    <h3>${e?'Edit Doctor':'Add New Doctor'}</h3>
    <form id="doctorForm">
      <label for="docName">Doctor Name</label><input type="text" id="docName" value="${esc(e?e.name:'')}">
      <label for="docDegree">Degree</label><input type="text" id="docDegree" value="${esc(e&&e.degree?e.degree:'')}" placeholder="e.g. MBBS, FCPS">
      <label for="docBmdc">BMDC Reg. No</label><input type="text" id="docBmdc" value="${esc(e&&e.bmdc?e.bmdc:'')}">
      <label for="docAddress">Address / Chamber</label><input type="text" id="docAddress" value="${esc(e?e.address:'')}">
      <label for="docPhone">Phone Number</label><input type="tel" id="docPhone" value="${esc(e?e.phone:'')}">
      <label>Products</label>
      <input type="text" placeholder="🔍 Search products..." oninput="filterCheckList(this.value)">
      <div class="checklist" id="productCheckList">${productChecklistHtml()}</div>
      <div class="modal-actions"><button type="button" class="btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn-primary">Save Doctor</button></div>
    </form>`);
  $('#doctorForm').onsubmit=function(ev){
    ev.preventDefault();
    const name=$('#docName').value.trim(),address=$('#docAddress').value.trim(),phone=$('#docPhone').value.trim();
    if(!name||!address||!phone){toast('Please fill in all fields.','error');return;}
    const sel=currentSelection.map(pid=>{const pr=products.find(x=>x.id===pid);return pr?{id:pr.id,name:pr.name}:null;}).filter(Boolean);
    const degree=$('#docDegree').value.trim(),bmdc=$('#docBmdc').value.trim();
    if(e){Object.assign(e,{name,address,phone,products:sel,degree,bmdc});}
    else doctors.push({id:genId(),name,address,phone,products:sel,degree,bmdc});
    save('mms_doctors',doctors);closeModal();updateDoctorList();
    toast(e?'Doctor updated!':'Doctor added!');
  };
}
function deleteDoctor(id){
  if(!confirm('Delete this doctor?'))return;
  doctors=doctors.filter(d=>d.id!==id);save('mms_doctors',doctors);updateDoctorList();toast('Doctor deleted.');
}


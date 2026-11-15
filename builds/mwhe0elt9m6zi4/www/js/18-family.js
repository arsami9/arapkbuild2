/* ================= MODEL FAMILY ================= */
function renderFamily(){
  $('#page-family').innerHTML=`
    <div class="family-banner"><h2>${esc(family.title)}</h2></div>
    <div class="card family-content"><p>${esc(family.body)}</p></div>
    ${session.role==='admin'?'<button class="btn-outline btn-block" onclick="editFamily()">✏️ Edit Content</button>':''}`;
}
function editFamily(){
  openModal(`
    <h3>Edit Model Family Content</h3>
    <form id="familyForm">
      <label for="famTitle">Title</label><input type="text" id="famTitle" value="${esc(family.title)}">
      <label for="famBody">Description</label><textarea id="famBody" rows="8">${esc(family.body)}</textarea>
      <div class="modal-actions"><button type="button" class="btn-outline" onclick="closeModal()">Cancel</button><button type="submit" class="btn-primary">Save</button></div>
    </form>`);
  $('#familyForm').onsubmit=function(e){
    e.preventDefault();
    family.title=$('#famTitle').value.trim()||family.title;
    family.body=$('#famBody').value.trim()||family.body;
    save('mms_family',family);closeModal();renderFamily();toast('Content updated!');
  };
}


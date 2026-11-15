/* ================= BARCODE SCANNER (camera + USB/Bluetooth) ================= */
let barcodeStream=null,barcodeScanActive=false;
function handleScannedBarcode(raw){
  const code=String(raw||'').trim();if(!code)return;
  const p=products.find(x=>String(x.barcode||'').trim()===code||String(x.id||'')===code);
  if(!p){toast('Barcode not found. Add this barcode in Products List first.','error');const q=$('#miSearch');if(q){q.value=code;miSearchRender();}return;}
  if(num(p.stock)<=0){toast(p.name+' is out of stock.','error');return;}
  miAddProduct(p.id);
  const inp=$('#memoBarcodeInput');if(inp)inp.focus();
}
async function startBarcodeScanner(){
  if(!('BarcodeDetector' in window)){openModal(`<h3>📷 Barcode Scanner</h3><p class="hint">Camera barcode detection is not supported in this browser. You can use a USB/Bluetooth scanner in the barcode field, or type the barcode manually.</p><label for="manualBarcode">Barcode</label><input id="manualBarcode" inputmode="numeric" placeholder="Enter barcode"><div class="modal-actions"><button class="btn-outline" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="handleScannedBarcode(document.getElementById('manualBarcode').value);closeModal()">Find Product</button></div>`);return;}
  openModal(`<h3>📷 Scan Product Barcode</h3><video id="barcodeVideo" autoplay muted playsinline></video><p id="scannerStatus" class="scanner-status">Starting camera… Keep the barcode inside the frame.</p><div class="modal-actions"><button class="btn-outline" onclick="stopBarcodeScanner();closeModal()">Cancel</button></div>`);
  try{
    barcodeStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    const video=$('#barcodeVideo');if(!video){stopBarcodeScanner();return;}video.srcObject=barcodeStream;await video.play();
    const detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128','code_39','itf','qr_code']});barcodeScanActive=true;
    const scan=async()=>{if(!barcodeScanActive)return;try{const v=$('#barcodeVideo');if(v&&v.readyState>=2){const codes=await detector.detect(v);if(codes.length){const val=codes[0].rawValue;stopBarcodeScanner();closeModal();handleScannedBarcode(val);return;}}}catch(e){}if(barcodeScanActive)requestAnimationFrame(scan);};requestAnimationFrame(scan);
  }catch(e){stopBarcodeScanner();const st=$('#scannerStatus');if(st)st.textContent='Camera unavailable. Allow camera permission and use HTTPS, or enter barcode manually.';toast('Unable to access camera.','error');}
}
function stopBarcodeScanner(){barcodeScanActive=false;if(barcodeStream){barcodeStream.getTracks().forEach(t=>t.stop());barcodeStream=null;}}
window.addEventListener('pagehide',stopBarcodeScanner);

document.addEventListener('DOMContentLoaded',init);

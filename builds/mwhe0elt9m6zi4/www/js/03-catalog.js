/* ================= CATALOG v4 (30 companies, 2000+ medicines, 150 patients) ================= */
const CO=[['Square Pharmaceuticals',1],['Beximco Pharmaceuticals',.95],['Incepta Pharmaceuticals',1],['Renata Limited',1.03],['Eskayef Pharmaceuticals',1.05],['ACI Limited',.95],['Opsonin Pharma',.92],['Aristopharma',1.02],['ACME Laboratories',1],['Drug International',.97],['Healthcare Pharmaceuticals',1.08],['Popular Pharmaceuticals',.93],['Sun Pharma Bangladesh',1.12],['Ibn Sina Pharmaceutical',.94],['Radiant Pharmaceuticals',.9],['Orion Pharma',1],['Mystic Pharmaceuticals',.9],['Navana Pharmaceuticals',.92],['Jayson Pharmaceuticals',.9],['Zenith Pharmaceuticals',.95],['Albion Laboratories',.9],['Ambee Pharmaceuticals',.92],['Edruc Limited',.9],['Techno Drugs',.9],['Delta Pharma',.9],['General Pharmaceuticals',.92],['GlaxoSmithKline Bangladesh',1.25],['Sanofi Bangladesh',1.25],['Novartis (Bangladesh)',1.25],['Globe Pharmaceuticals',.9]];
const CAT_ROWS=`Paracetamol|Analgesic & Antipyretic|Tab.|3|500mg:1.2;650mg:1.8|Napa/Beximco,Ace/Square
Paracetamol|Analgesic & Antipyretic|Syp.|3|120mg/5ml:32
Paracetamol + Caffeine|Analgesic & Antipyretic|Tab.|3|500mg+65mg:2.2|Napa Extra/Beximco,Ace Plus/Square
Aceclofenac|NSAID|Tab.|3|100mg:4.5
Diclofenac Sodium|NSAID|Tab.|3|50mg:2.5|Voltaren/Novartis
Diclofenac Sodium|NSAID|Inj.|2|75mg/3ml:14
Diclofenac Sodium|NSAID|Gel|3|1% 30gm:95
Naproxen|NSAID|Tab.|3|250mg:3.5;500mg:6
Ibuprofen|NSAID|Tab.|2|200mg:1.5;400mg:2.5
Ibuprofen|NSAID|Susp.|2|100mg/5ml 100ml:62
Ketorolac Tromethamine|NSAID|Tab.|2|10mg:6
Etoricoxib|NSAID|Tab.|3|60mg:8;90mg:12;120mg:15
Celecoxib|NSAID|Cap.|2|200mg:9
Piroxicam|NSAID|Cap.|1|20mg:4
Mefenamic Acid|NSAID|Tab.|3|250mg:2;500mg:3.5
Esomeprazole|Antiulcerant (PPI)|Tab.|3|20mg:7;40mg:10|Sergel/Healthcare,Maxpro/Renata
Omeprazole|Antiulcerant (PPI)|Cap.|3|20mg:5;40mg:8|Seclo/Square,Losectil/Eskayef
Pantoprazole|Antiulcerant (PPI)|Tab.|3|20mg:6;40mg:8.5
Pantoprazole|Antiulcerant (PPI)|Inj.|3|40mg:55
Rabeprazole|Antiulcerant (PPI)|Tab.|3|10mg:6;20mg:8
Lansoprazole|Antiulcerant (PPI)|Cap.|1|30mg:8
Esomeprazole|Antiulcerant (PPI)|Inj.|2|40mg:110
Ranitidine|Antiulcerant (H2)|Tab.|2|150mg:2.5;300mg:4.5
Famotidine|Antiulcerant (H2)|Tab.|1|20mg:3;40mg:5
Domperidone|Prokinetic|Tab.|3|10mg:2.5
Domperidone|Prokinetic|Susp.|3|5mg/5ml 60ml:55
Metoclopramide|Prokinetic|Tab.|2|10mg:1.2
Ondansetron|Antiemetic|Tab.|3|4mg:3.5;8mg:6
Ondansetron|Antiemetic|Inj.|2|4mg/2ml:12
Aluminium Hydroxide + Magnesium Hydroxide|Antacid|Susp.|3|200ml:60
Aluminium Hydroxide + Magnesium Hydroxide + Simethicone|Antacid|Tab.|3|Chewable:1.2
Sodium Alginate + Sodium Bicarbonate + Calcium Carbonate|Antacid|Susp.|2|200ml:125
Simethicone|Antiflatulent|Tab.|1|40mg:1.5
Loperamide|Antidiarrheal|Cap.|2|2mg:2.5
Oral Rehydration Saline|Rehydration|Sachet|3|1 sachet:5|Orsaline-N/Square
Zinc Sulfate|Mineral|Tab.|3|20mg:3
Zinc Sulfate|Mineral|Syp.|3|20mg/5ml 100ml:55
Lactulose|Laxative|Syp.|2|3.35g/5ml 200ml:190
Bisacodyl|Laxative|Tab.|1|5mg:1.2
Hyoscine Butylbromide|Antispasmodic|Tab.|3|10mg:3
Mebeverine|Antispasmodic|Tab.|2|135mg:5
Rifaximin|Antibiotic (GI)|Tab.|2|200mg:22;400mg:40
Amoxicillin|Antibiotic|Cap.|3|250mg:4;500mg:7
Amoxicillin|Antibiotic|Susp.|3|125mg/5ml 100ml:85
Amoxicillin + Clavulanic Acid|Antibiotic|Tab.|3|625mg:32
Amoxicillin + Clavulanic Acid|Antibiotic|Susp.|2|156mg/5ml 100ml:190
Azithromycin|Antibiotic|Tab.|3|250mg:22;500mg:40|Zimax/Square
Azithromycin|Antibiotic|Susp.|3|200mg/5ml 15ml:110
Clarithromycin|Antibiotic|Tab.|2|250mg:18;500mg:35
Ciprofloxacin|Antibiotic|Tab.|3|250mg:6;500mg:10|Ciprocin/Square
Levofloxacin|Antibiotic|Tab.|3|250mg:15;500mg:25;750mg:40
Moxifloxacin|Antibiotic|Tab.|2|400mg:70
Cefixime|Antibiotic|Cap.|3|200mg:22;400mg:38
Cefixime|Antibiotic|Susp.|3|100mg/5ml 30ml:120
Cefuroxime|Antibiotic|Tab.|3|250mg:30;500mg:55
Cefuroxime|Antibiotic|Susp.|2|125mg/5ml 70ml:200
Cefpodoxime|Antibiotic|Tab.|2|100mg:20;200mg:35
Cefradine|Antibiotic|Cap.|2|250mg:7;500mg:14
Cefalexin|Antibiotic|Cap.|2|500mg:8
Cefaclor|Antibiotic|Cap.|2|250mg:12;500mg:22
Flucloxacillin|Antibiotic|Cap.|2|500mg:12
Ceftriaxone|Antibiotic|Inj.|3|500mg:60;1gm:100
Cefotaxime|Antibiotic|Inj.|2|1gm:80
Cefuroxime|Antibiotic|Inj.|2|750mg:120
Doxycycline|Antibiotic|Cap.|2|100mg:5
Metronidazole|Antiprotozoal|Tab.|3|400mg:1.5;200mg:1|Filmet/Beximco,Flagyl/Sanofi
Metronidazole|Antiprotozoal|Susp.|3|200mg/5ml 60ml:45
Tinidazole|Antiprotozoal|Tab.|2|500mg:3
Nitrofurantoin|Antibiotic (UTI)|Cap.|1|100mg:6
Cotrimoxazole|Antibiotic|Tab.|1|480mg:2.5;960mg:5
Gentamicin|Antibiotic|Inj.|1|80mg/2ml:10
Fluconazole|Antifungal|Cap.|3|50mg:8;150mg:25
Itraconazole|Antifungal|Cap.|2|100mg:40
Terbinafine|Antifungal|Tab.|2|250mg:20
Terbinafine|Antifungal|Cream|2|1% 10gm:80
Clotrimazole|Antifungal|Cream|3|1% 10gm:40
Ketoconazole|Antifungal|Cream|2|2% 15gm:55
Albendazole|Anthelmintic|Tab.|3|400mg:10
Albendazole|Anthelmintic|Susp.|3|200mg/5ml 10ml:30
Mebendazole|Anthelmintic|Tab.|2|100mg:3;500mg:9
Ivermectin|Anthelmintic|Tab.|3|6mg:8;12mg:16
Cetirizine|Antihistamine|Tab.|3|10mg:2.5|Alatrol/Square
Cetirizine|Antihistamine|Syp.|3|5mg/5ml 60ml:40
Fexofenadine|Antihistamine|Tab.|3|60mg:6;120mg:8;180mg:12|Fexo/Square
Levocetirizine|Antihistamine|Tab.|3|5mg:5
Levocetirizine|Antihistamine|Syp.|2|2.5mg/5ml 60ml:60
Loratadine|Antihistamine|Tab.|2|10mg:3
Chlorpheniramine Maleate|Antihistamine|Tab.|1|4mg:0.5
Montelukast|Respiratory|Tab.|3|4mg:12;5mg:14;10mg:18|Monas/ACME
Salbutamol|Respiratory|Tab.|2|2mg:0.6;4mg:0.9
Salbutamol|Respiratory|Syp.|3|2mg/5ml 100ml:40
Salbutamol|Respiratory|Inhaler|3|100mcg:220|Ventolin/GlaxoSmithKline
Ambroxol|Respiratory|Tab.|3|30mg:2.5
Ambroxol|Respiratory|Syp.|3|30mg/5ml 100ml:70
Bromhexine|Respiratory|Tab.|2|8mg:1.5
Acetylcysteine|Respiratory|Tab.|2|600mg:12
Dextromethorphan|Respiratory|Syp.|2|15mg/5ml 100ml:65
Prednisolone|Corticosteroid|Tab.|3|5mg:1;10mg:2;20mg:3.5
Methylprednisolone|Corticosteroid|Tab.|1|4mg:8;16mg:28
Dexamethasone|Corticosteroid|Tab.|2|0.5mg:0.8
Dexamethasone|Corticosteroid|Inj.|2|8mg/2ml:20
Deflazacort|Corticosteroid|Tab.|2|6mg:12;30mg:50
Amlodipine|Antihypertensive|Tab.|3|5mg:3;10mg:5
Losartan Potassium|Antihypertensive|Tab.|3|25mg:4;50mg:7
Telmisartan|Antihypertensive|Tab.|2|40mg:8;80mg:13
Olmesartan|Antihypertensive|Tab.|3|20mg:10;40mg:16
Valsartan|Antihypertensive|Tab.|2|80mg:10;160mg:16
Bisoprolol|Antihypertensive|Tab.|3|2.5mg:5;5mg:8
Atenolol|Antihypertensive|Tab.|3|25mg:1.5;50mg:2.5
Propranolol|Antihypertensive|Tab.|2|10mg:1;40mg:2
Metoprolol|Antihypertensive|Tab.|2|50mg:4
Carvedilol|Antihypertensive|Tab.|2|6.25mg:4;12.5mg:7
Enalapril|Antihypertensive|Tab.|1|5mg:3
Ramipril|Antihypertensive|Tab.|2|5mg:6
Amlodipine + Losartan|Antihypertensive|Tab.|2|5mg+50mg:11
Hydrochlorothiazide|Diuretic|Tab.|1|25mg:2
Furosemide|Diuretic|Tab.|2|20mg:1.5;40mg:2.5|Lasix/Sanofi
Spironolactone|Diuretic|Tab.|2|25mg:5;50mg:8
Atorvastatin|Lipid-lowering|Tab.|3|10mg:8;20mg:13;40mg:20
Rosuvastatin|Lipid-lowering|Tab.|3|5mg:10;10mg:15;20mg:22
Fenofibrate|Lipid-lowering|Cap.|1|160mg:15
Clopidogrel|Antiplatelet|Tab.|3|75mg:8|Plavix/Sanofi
Aspirin|Antiplatelet|Tab.|3|75mg:1.2
Isosorbide Mononitrate|Antianginal|Tab.|1|20mg:4
Trimetazidine|Antianginal|Tab.|2|35mg:7
Ivabradine|Antianginal|Tab.|1|5mg:15
Metformin|Antidiabetic|Tab.|3|500mg:2;850mg:3
Gliclazide|Antidiabetic|Tab.|3|80mg:4
Glimepiride|Antidiabetic|Tab.|3|1mg:4;2mg:6;3mg:8|Amaryl/Sanofi
Pioglitazone|Antidiabetic|Tab.|2|15mg:5;30mg:8
Sitagliptin|Antidiabetic|Tab.|2|50mg:20;100mg:30
Vildagliptin|Antidiabetic|Tab.|2|50mg:18
Linagliptin|Antidiabetic|Tab.|1|5mg:70
Empagliflozin|Antidiabetic|Tab.|2|10mg:70;25mg:100
Dapagliflozin|Antidiabetic|Tab.|2|5mg:25;10mg:40
Cholecalciferol (Vitamin D3)|Vitamin|Cap.|3|2000IU:8;20000IU:25;40000IU:40
Calcium + Vitamin D3|Mineral & Vitamin|Tab.|3|500mg+200IU:6
Calcium + Vitamin D3|Mineral & Vitamin|Syp.|2|200ml:140
Calcium Carbonate|Mineral|Tab.|2|500mg:3
Multivitamin + Multimineral|Vitamin|Cap.|3|1 cap:5
Multivitamin|Vitamin|Syp.|3|100ml:70
Vitamin B-Complex|Vitamin|Tab.|3|1 tab:1.5
Methylcobalamin|Vitamin|Tab.|3|500mcg:6;1500mcg:12
Methylcobalamin|Vitamin|Inj.|2|500mcg/ml:30
Vitamin B1 + B6 + B12|Vitamin|Tab.|3|1 tab:4.5
Folic Acid|Vitamin|Tab.|2|5mg:0.6
Ferrous Fumarate + Folic Acid|Iron|Cap.|3|200mg+0.5mg:3
Iron + Multivitamin|Iron|Syp.|3|150ml:90
Vitamin C|Vitamin|Tab.|3|250mg:1.5;500mg:3
Omega-3 Fatty Acid|Supplement|Cap.|2|1000mg:15
Vitamin E|Vitamin|Cap.|1|400IU:6
Gabapentin|Neuro|Cap.|2|100mg:6;300mg:12
Pregabalin|Neuro|Cap.|3|50mg:12;75mg:18
Amitriptyline|Neuro|Tab.|2|10mg:1;25mg:1.5
Clonazepam|Neuro|Tab.|3|0.5mg:3
Escitalopram|Psychiatric|Tab.|3|10mg:10;20mg:15
Sertraline|Psychiatric|Tab.|2|50mg:10
Flupentixol + Melitracen|Psychiatric|Tab.|2|0.5mg+10mg:12
Betahistine|Vertigo|Tab.|2|8mg:5;16mg:9
Flunarizine|Neuro|Tab.|2|5mg:5;10mg:8
Cinnarizine|Vertigo|Tab.|1|25mg:2
Carbamazepine|Anticonvulsant|Tab.|1|200mg:3
Sodium Valproate|Anticonvulsant|Tab.|1|200mg:6;500mg:11
Levetiracetam|Anticonvulsant|Tab.|1|500mg:18
Tolperisone|Muscle relaxant|Tab.|2|150mg:8
Thiocolchicoside|Muscle relaxant|Tab.|2|4mg:8
Eperisone|Muscle relaxant|Tab.|2|50mg:8
Tamsulosin|Urology|Cap.|2|0.4mg:10
Finasteride|Urology|Tab.|1|5mg:9
Levothyroxine|Thyroid|Tab.|3|25mcg:1.5;50mcg:2;100mcg:3
Carbimazole|Thyroid|Tab.|1|5mg:3
Allopurinol|Anti-gout|Tab.|2|100mg:2;300mg:4
Febuxostat|Anti-gout|Tab.|2|40mg:10;80mg:14
Colchicine|Anti-gout|Tab.|1|0.5mg:6
Alendronate|Bone|Tab.|1|70mg:30
Tranexamic Acid|Haemostatic|Cap.|3|500mg:8
Tranexamic Acid|Haemostatic|Inj.|2|500mg/5ml:40
Ethamsylate|Haemostatic|Tab.|2|500mg:6
Norethisterone|Hormone|Tab.|2|5mg:4
Betamethasone|Dermatological|Cream|2|0.1% 10gm:35|Betnovate/GlaxoSmithKline
Clobetasol|Dermatological|Cream|2|0.05% 15gm:45|Dermovate/GlaxoSmithKline
Mupirocin|Dermatological|Oint.|3|2% 5gm:130
Fusidic Acid|Dermatological|Cream|2|2% 10gm:150
Permethrin|Dermatological|Lotion|2|5% 30ml:110
Calamine Lotion|Dermatological|Lotion|2|100ml:70
Silver Sulfadiazine|Dermatological|Cream|2|1% 25gm:120
Hydrocortisone|Dermatological|Cream|1|1% 15gm:40
Povidone Iodine|Antiseptic|Sol.|3|5% 100ml:60
Ciprofloxacin|Eye/Ear|Drop|3|0.3% 5ml:55
Moxifloxacin|Eye/Ear|Drop|2|0.5% 5ml:130
Tobramycin + Dexamethasone|Eye/Ear|Drop|2|5ml:110
Carboxymethylcellulose|Eye/Ear|Drop|3|0.5% 10ml:110
Timolol|Eye/Ear|Drop|1|0.5% 5ml:150
Xylometazoline|Nasal|Drop|3|0.1% 10ml:55
Sodium Chloride (Saline)|Nasal|Drop|2|0.65% 15ml:50
Mometasone|Nasal|Spray|2|50mcg:280`;

function hashStr(s){let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
function mkRng(seed){let a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function roundPrice(v){return v<3?Math.round(v*20)/20:v<10?Math.round(v*10)/10:v<100?Math.round(v*2)/2:Math.round(v);}
function buildCatalog(){
  const out=[];
  CAT_ROWS.split('\n').forEach(line=>{
    line=line.trim();if(!line)return;
    const [g,cat,form,pop,sts,br]=line.split('|');
    const N=pop==='3'?13:pop==='2'?8:4;
    const brands={};
    (br||'').split(',').filter(Boolean).forEach(x=>{const [b,c]=x.split('/');const i=CO.findIndex(o=>o[0].startsWith(c));if(i>=0)brands[i]=b;});
    const elig=CO.map((_,i)=>i).filter(i=>i<26||i===29);
    const st=hashStr(g+form)%elig.length,pick=[];
    for(let k=0;pick.length<Math.min(N,elig.length)&&k<80;k++){const i=elig[(st+k*7)%elig.length];if(!pick.includes(i))pick.push(i);}
    Object.keys(brands).map(Number).forEach(i=>{
      if(pick.includes(i))return;
      let j=pick.length-1;while(j>=0&&brands[pick[j]]!==undefined)j--;
      if(j>=0)pick.splice(j,1);pick.push(i);
    });
    sts.split(';').forEach(s=>{
      const k=s.lastIndexOf(':'),str=s.slice(0,k),base=parseFloat(s.slice(k+1));
      pick.forEach(ci=>{
        const r=mkRng(hashStr(g+form+str+ci));
        const mrp=roundPrice(base*CO[ci][1]*(0.96+r()*0.1));
        const bq=/^(Tab|Cap)/.test(form)?(mrp<3?100:mrp<8?50:30):/^Inj/.test(form)?5:/^Sachet/.test(form)?50:1;
        const stock=r()<.12?Math.floor(r()*9)+1:Math.floor(r()*360)+15;
        let expiry=(2027+Math.floor(r()*2))+'-'+pad2(1+Math.floor(r()*12))+'-28';
        if(r()<.015)expiry='2026-10-'+pad2(15+Math.floor(r()*15));
        out.push({id:'pc'+out.length,name:brands[ci]||g,generic:g,cat,form,company:CO[ci][0],strength:str,boxQty:bq,mrp,cost:Math.round(mrp*(0.76+r()*0.06)*100)/100,stock,expiry});
      });
    });
  });
  return out;
}

const PT_MALE=['Abdul Karim','Abdul Malek','Abdur Rashid','Abdur Razzak','Abul Kalam','Abul Hashem','Md. Rafiqul','Md. Jahangir','Md. Shafiqul','Md. Anwar','Md. Kamal','Md. Alamgir','Md. Mizanur','Md. Habibur','Md. Rubel','Md. Sohel','Md. Faruk','Md. Babul','Md. Selim','Md. Nazrul','Md. Monir','Md. Shahin','Md. Sumon','Md. Jewel','Md. Rakib','Md. Tanvir','Md. Imran','Md. Arif','Md. Masud','Md. Hasan','Md. Liton','Md. Shamim','Md. Jashim','Md. Rezaul','Md. Delwar','Md. Badal','Md. Ruhul','Md. Shahidul','Md. Nurul','Md. Humayun','Md. Zahid','Md. Mamun','Sirajul','Kabir','Mostafa','Yusuf'];
const PT_MSUR=['Islam','Hossain','Ahmed','Miah','Uddin','Khan','Sarker','Sheikh','Talukder','Bhuiyan','Chowdhury','Rahman','Mondal','Howlader','Pramanik','Akand','Patwary','Mia','Haque','Alam'];
const PT_FEM=['Rahima','Salma','Nasima','Rokeya','Shirin','Jahanara','Morjina','Hasina','Fatema','Ayesha','Rabeya','Sufia','Momtaz','Rehana','Shahida','Nazma','Parvin','Laila','Sabina','Taslima','Rumana','Shapla','Mahmuda','Khadiza','Anwara','Beauty','Josna','Kulsum','Monowara','Runa','Sathi','Farida','Sultana','Rowshan','Amena','Halima','Bilkis','Shahana','Nurjahan','Jesmin'];
const PT_FSUR=['Begum','Khatun','Akter','Parvin','Banu'];
const PT_HINDU=[['Gopal Chandra Das','Male'],['Bimal Kumar Saha','Male'],['Nitai Chandra Dey','Male'],['Shyamal Kanti Roy','Male'],['Shipra Rani Das','Female'],['Rina Rani Saha','Female'],['Mina Rani Dey','Female'],['Sumon Chandra Sarker','Male']];
const PT_PLACES=['Hospital Road, Kishoreganj Sadar','Puran Thana, Kishoreganj Sadar','Boro Bazar, Kishoreganj Sadar','Rail Station Road, Kishoreganj Sadar','Chowdhury Para, Kishoreganj Sadar','Maszid Para, Kishoreganj Sadar','Bhairab Bazar, Bhairab','Kuliarchar Sadar, Kuliarchar','Katiadi Bazar, Katiadi','Gachihata, Katiadi','Hossainpur Sadar, Hossainpur','Pakundia Bazar, Pakundia','Itna Sadar, Itna','Mithamain Sadar, Mithamain','Nikli Sadar, Nikli','Austagram Sadar, Austagram','Karimganj Sadar, Karimganj','Jangalia, Karimganj','Tarail Sadar, Tarail','Bajitpur Sadar, Bajitpur'];
const SEED_DOCTORS=[
  {name:'Dr. Md. Abdur Rahim',degree:'MBBS, BCS (Health), FCPS (Medicine)',bmdc:'A-48215',address:'Kishoreganj Sadar Hospital, Kishoreganj'},
  {name:'Dr. Nasrin Sultana',degree:'MBBS, DCH (Child Health)',bmdc:'A-52780',address:'Child Care Clinic, Hospital Road, Kishoreganj'},
  {name:'Dr. Kamrul Hasan',degree:'MBBS, MD (Cardiology)',bmdc:'A-41376',address:'Heart & General Clinic, Kishoreganj'},
  {name:'Dr. Shahida Akter',degree:'MBBS, FCPS (Gynae & Obs)',bmdc:'A-55102',address:'Mother Care Hospital, Kishoreganj'},
  {name:'Dr. Mahbubur Rahman',degree:'MBBS, MD (Dermatology)',bmdc:'A-46933',address:'Skin & VD Clinic, Bhairab'},
  {name:'Dr. Tania Islam',degree:'MBBS, CCD (Diabetology)',bmdc:'A-57641',address:'Diabetic Care Center, Kishoreganj'},
  {name:'Dr. Sajjad Hossain',degree:'MBBS, D-Ortho',bmdc:'A-44018',address:'Orthopaedic Clinic, Katiadi'},
  {name:'Dr. Anisur Rahman',degree:'MBBS, MCPS (Medicine)',bmdc:'A-50467',address:'Upazila Health Complex, Kuliarchar'}
];
/* [generic, strength, dose, meal, days, qty|null, note] */
const COND=[
 {t:'a',a:[16,70],cc:'জ্বর, গা ব্যথা ও মাথাব্যথা (২-৩ দিন)',dx:'Viral Fever',adv:'পর্যাপ্ত বিশ্রাম নিন ও প্রচুর পানি পান করুন। ৩ দিনে জ্বর না কমলে আবার দেখা করুন।',rx:[['Paracetamol','500mg','1+1+1','after',3],['Vitamin C','500mg','0+1+0','after',7],['Oral Rehydration Saline','1 sachet','1+1+1','any',3,6,'১ প্যাকেট ১ লিটার পানিতে মিশিয়ে খান']]},
 {t:'a',a:[18,80],cc:'বুক জ্বালাপোড়া, পেট ব্যথা, টক ঢেকুর',dx:'Gastritis / GERD',adv:'তেল-মসলা ও ভাজাপোড়া এড়িয়ে চলুন। খাবারের পর সাথে সাথে শুয়ে পড়বেন না।',rx:[['Esomeprazole','20mg','1+0+1','before',14],['Domperidone','10mg','1+1+1','before',7],['Aluminium Hydroxide + Magnesium Hydroxide','200ml','2 চামচ, প্রয়োজনে','after',7,1]]},
 {t:'a',a:[16,80],cc:'সর্দি, কাশি ও গলা খুসখুস',dx:'Acute Upper Respiratory Infection',adv:'কুসুম গরম পানি পান করুন। ধুলাবালি ও ঠান্ডা এড়িয়ে চলুন।',rx:[['Fexofenadine','120mg','0+0+1','after',7],['Ambroxol','30mg','1+1+1','after',5],['Paracetamol','500mg','1+0+1','after',3]]},
 {t:'a',a:[35,85],cc:'মাথা ঘোরা, মাথাব্যথা',dx:'Hypertension',adv:'লবণ কম খান, নিয়মিত হাঁটুন এবং প্রতি সপ্তাহে বিপি মাপুন।',hi:1,rx:[['Amlodipine','5mg','1+0+0','any',30],['Losartan Potassium','50mg','0+0+1','any',30]]},
 {t:'a',a:[35,85],cc:'অতিরিক্ত পিপাসা, ঘন ঘন প্রস্রাব, দুর্বলতা',dx:'Type 2 Diabetes Mellitus',adv:'মিষ্টি ও ভাত কম খান। প্রতিদিন ৩০ মিনিট হাঁটুন। ১ মাস পর রক্তের সুগার পরীক্ষা করুন।',rx:[['Metformin','500mg','1+0+1','after',30],['Gliclazide','80mg','1+0+0','before',30]]},
 {t:'a',a:[16,80],cc:'পাতলা পায়খানা, পেট মোচড়ানো',dx:'Acute Gastroenteritis',adv:'বেশি করে স্যালাইন ও তরল খাবার খান। হাত ধুয়ে খাবার খান।',rx:[['Oral Rehydration Saline','1 sachet','1+1+1','any',3,9,'প্রতি পায়খানার পর এক গ্লাস'],['Zinc Sulfate','20mg','1+0+0','after',10],['Metronidazole','400mg','1+1+1','after',5]]},
 {t:'a',a:[18,75],cc:'প্রস্রাবে জ্বালাপোড়া ও ঘন ঘন প্রস্রাব',dx:'Urinary Tract Infection',adv:'প্রচুর পানি পান করুন। প্রস্রাব চেপে রাখবেন না।',rx:[['Ciprofloxacin','500mg','1+0+1','after',7],['Paracetamol','500mg','1+0+1','after',3]]},
 {t:'a',a:[40,85],cc:'হাঁটু ও কোমরে ব্যথা',dx:'Osteoarthritis',adv:'ভারী কাজ ও বেশি সিঁড়ি ভাঙা এড়িয়ে চলুন। ব্যথার জায়গায় গরম সেঁক দিন।',rx:[['Etoricoxib','90mg','0+0+1','after',10],['Esomeprazole','20mg','1+0+0','before',10],['Calcium + Vitamin D3','500mg+200IU','1+0+1','after',30]]},
 {t:'a',a:[10,70],cc:'শরীরে চুলকানি ও লালচে দাগ',dx:'Allergic Dermatitis',adv:'সাবান ও ধুলাবালি থেকে সাবধান থাকুন। নখ ছোট রাখুন।',rx:[['Levocetirizine','5mg','0+0+1','after',10],['Calamine Lotion','100ml','দিনে ২-৩ বার লাগান','any',10,1]]},
 {t:'a',a:[20,80],cc:'কাশি, কফ ও শ্বাসকষ্ট',dx:'Lower Respiratory Tract Infection',adv:'ধূমপান ও ধুলাবালি এড়িয়ে চলুন। গরম পানির ভাপ নিন।',rx:[['Azithromycin','500mg','1+0+0','after',5],['Montelukast','10mg','0+0+1','after',14],['Ambroxol','30mg','1+1+1','after',7]]},
 {t:'a',a:[18,60],cc:'একপাশে মাথাব্যথা, বমি বমি ভাব',dx:'Migraine',adv:'পর্যাপ্ত ঘুমান। উজ্জ্বল আলো ও উচ্চ শব্দ এড়িয়ে চলুন।',rx:[['Paracetamol + Caffeine','500mg+65mg','1+0+1','after',5],['Flunarizine','10mg','0+0+1','bed',15],['Ondansetron','4mg','1+0+1','before',3]]},
 {t:'a',a:[14,60],cc:'দুর্বলতা, মাথা ঘোরা, ফ্যাকাশে ভাব',dx:'Iron Deficiency Anaemia',adv:'কলিজা, ডিম, পালংশাক ও ডাল খান। চা-কফি খাবারের সাথে খাবেন না।',rx:[['Ferrous Fumarate + Folic Acid','200mg+0.5mg','1+0+1','after',30],['Vitamin C','500mg','0+1+0','after',30]]},
 {t:'a',a:[20,75],cc:'শরীর ব্যথা ও ক্লান্তি',dx:'Vitamin D Deficiency',adv:'প্রতিদিন সকালে ১৫-২০ মিনিট রোদে থাকুন।',rx:[['Cholecalciferol (Vitamin D3)','20000IU','সপ্তাহে ১টি','after',28,4],['Calcium + Vitamin D3','500mg+200IU','1+0+1','after',30]]},
 {t:'a',a:[25,70],cc:'ওজন বৃদ্ধি, ক্লান্তি, ঠান্ডা সহ্য না হওয়া',dx:'Hypothyroidism',adv:'ঔষধ নিয়মিত খান। ৩ মাস পর থাইরয়েড পরীক্ষা করুন।',rx:[['Levothyroxine','50mcg','1+0+0','before',30,30,'সকালে খালি পেটে, ৩০ মিনিট পর নাস্তা']]},
 {t:'a',a:[40,85],cc:'রুটিন চেকআপ, কোলেস্টেরল বেশি',dx:'Dyslipidaemia',adv:'চর্বিযুক্ত ও ভাজাপোড়া খাবার কম খান। নিয়মিত হাঁটুন।',rx:[['Atorvastatin','20mg','0+0+1','after',30],['Aspirin','75mg','0+1+0','after',30]]},
 {t:'a',a:[10,60],cc:'একটানা জ্বর (৫-৭ দিন), মাথাব্যথা',dx:'Enteric Fever (suspected)',adv:'ফুটানো পানি পান করুন। হালকা ও নরম খাবার খান।',rx:[['Cefixime','200mg','1+0+1','after',14],['Paracetamol','500mg','1+1+1','after',5],['Omeprazole','20mg','1+0+0','before',14]]},
 {t:'a',a:[13,60],cc:'পেট ব্যথা, ক্ষুধামান্দ্য',dx:'Intestinal Helminthiasis',adv:'খাবারের আগে ও টয়লেটের পর সাবান দিয়ে হাত ধুয়ে নিন।',rx:[['Albendazole','400mg','0+0+1','after',1,1,'একটি ডোজ; ১৫ দিন পর আবার']]},
 {t:'a',a:[22,70],cc:'কোমর ব্যথা, মাংসপেশিতে টান',dx:'Lumbar Strain / Muscle Spasm',adv:'ভারী জিনিস তোলা এড়িয়ে চলুন। শক্ত বিছানায় ঘুমান।',rx:[['Thiocolchicoside','4mg','1+0+1','after',7],['Aceclofenac','100mg','1+0+1','after',7],['Esomeprazole','20mg','1+0+0','before',7]]},
 {t:'a',a:[30,75],cc:'মাথা ঘোরা ও ভারসাম্যহীনতা',dx:'Vertigo',adv:'হঠাৎ উঠে দাঁড়াবেন না। পর্যাপ্ত পানি পান করুন।',rx:[['Betahistine','16mg','1+0+1','after',14],['Cinnarizine','25mg','0+0+1','bed',14]]},
 {t:'a',a:[12,60],cc:'গলা ব্যথা, গিলতে কষ্ট, জ্বর',dx:'Acute Tonsillitis',adv:'কুসুম গরম পানিতে লবণ দিয়ে গার্গল করুন। ঠান্ডা খাবার এড়িয়ে চলুন।',rx:[['Cefuroxime','500mg','1+0+1','after',7],['Paracetamol','500mg','1+0+1','after',3]]},
 {t:'a',a:[15,75],cc:'শ্বাসকষ্ট, বুকে সাঁই সাঁই শব্দ',dx:'Bronchial Asthma',adv:'ধুলাবালি, ধোঁয়া ও ঠান্ডা এড়িয়ে চলুন। ইনহেলার সবসময় সাথে রাখুন।',rx:[['Montelukast','10mg','0+0+1','after',30],['Salbutamol','100mcg','প্রয়োজনে ২ পাফ','any',30,1]]},
 {t:'a',a:[15,65],cc:'চুলকানি ও গোলাকার দাগ',dx:'Tinea Corporis (Fungal Infection)',adv:'শরীর শুকনো রাখুন। সুতি কাপড় পরুন, তোয়ালে আলাদা রাখুন।',rx:[['Terbinafine','250mg','0+1+0','after',14],['Clotrimazole','1% 10gm','দিনে ২ বার লাগান','any',21,2]]},
 {t:'k',a:[1,12],cc:'জ্বর ও সর্দি',dx:'Febrile Illness / Common Cold',adv:'বেশি করে তরল খাওয়ান। কুসুম গরম পানিতে গা মুছে দিন।',rx:[['Paracetamol','120mg/5ml','5ml: 1+1+1','after',3,1],['Cetirizine','5mg/5ml 60ml','5ml: 0+0+1','after',5,1]]},
 {t:'k',a:[1,12],cc:'পাতলা পায়খানা',dx:'Acute Diarrhoea',adv:'বুকের দুধ/স্বাভাবিক খাবার চালিয়ে যান। ঘন ঘন স্যালাইন খাওয়ান।',rx:[['Oral Rehydration Saline','1 sachet','প্রতি পায়খানার পর','any',3,6],['Zinc Sulfate','20mg/5ml 100ml','5ml: 1+0+0','after',10,1]]},
 {t:'k',a:[2,12],cc:'কাশি ও শ্বাসকষ্ট',dx:'Acute Bronchitis',adv:'ঠান্ডা ও ধুলাবালি থেকে দূরে রাখুন। গরম পানি খাওয়ান।',rx:[['Salbutamol','2mg/5ml 100ml','5ml: 1+1+1','after',5,1],['Ambroxol','30mg/5ml 100ml','5ml: 1+1+1','after',5,1]]},
 {t:'k',a:[3,12],cc:'পেট ব্যথা ও ক্ষুধামান্দ্য',dx:'Worm Infestation',adv:'নখ ছোট রাখুন, খাবারের আগে হাত ধোয়ান।',rx:[['Albendazole','200mg/5ml 10ml','10ml একবার','after',1,1],['Multivitamin','100ml','5ml: 1+0+1','after',30,1]]},
 {t:'k',a:[3,12],cc:'গলা ব্যথা ও জ্বর',dx:'Acute Pharyngitis',adv:'ঠান্ডা পানি ও আইসক্রিম দেবেন না। পর্যাপ্ত বিশ্রাম দিন।',rx:[['Azithromycin','200mg/5ml 15ml','5ml: 1+0+0','after',5,1],['Paracetamol','120mg/5ml','5ml: 1+1+1','after',3,1]]},
 {t:'k',a:[2,12],cc:'বমি ও পেট ব্যথা',dx:'Gastroenteritis',adv:'অল্প অল্প করে বারবার তরল খাওয়ান।',rx:[['Domperidone','5mg/5ml 60ml','5ml: 1+1+1','before',3,1],['Oral Rehydration Saline','1 sachet','অল্প অল্প করে','any',3,6]]}
];
function addDaysStr(s,n){const d=new Date(s+'T00:00:00');d.setDate(d.getDate()+n);return localDate(d);}
function buildPatients(cat,startSl,usedPhones){
  const r=mkRng(20260101),out=[],names=new Set();
  const findP=(g,s)=>{const m=cat.filter(x=>x.generic===g&&x.strength===s);return m.length?m[Math.floor(r()*m.length)]:null;};
  const BG=['A+','B+','O+','AB+','A-','B-','O-'];
  for(let i=0;i<150;i++){
    let name,gender;
    if(i<PT_HINDU.length*2&&i%19===3){const h=PT_HINDU[(i/19|0)%PT_HINDU.length];name=h[0];gender=h[1];}
    else if(r()<.5){gender='Male';name=PT_MALE[Math.floor(r()*PT_MALE.length)]+' '+PT_MSUR[Math.floor(r()*PT_MSUR.length)];}
    else{gender='Female';name=PT_FEM[Math.floor(r()*PT_FEM.length)]+' '+PT_FSUR[Math.floor(r()*PT_FSUR.length)];}
    let guard=0;while(names.has(name)&&guard++<30){name=gender==='Male'?PT_MALE[Math.floor(r()*PT_MALE.length)]+' '+PT_MSUR[Math.floor(r()*PT_MSUR.length)]:PT_FEM[Math.floor(r()*PT_FEM.length)]+' '+PT_FSUR[Math.floor(r()*PT_FSUR.length)];}
    names.add(name);
    const kid=r()<.16,pool=COND.filter(c=>kid?c.t==='k':c.t==='a');
    let c=pool[Math.floor(r()*pool.length)];
    const age=c.a[0]+Math.floor(r()*(c.a[1]-c.a[0]+1));
    let phone;do{phone='01'+['3','4','5','6','7','8','9'][Math.floor(r()*7)]+String(Math.floor(r()*1e8)).padStart(8,'0');}while(usedPhones.has(phone));
    usedPhones.add(phone);
    const visit=daysAgo(Math.floor(r()*75));
    const items=[];
    c.rx.forEach((x,k)=>{
      const pr=findP(x[0],x[1]);if(!pr)return;
      const perDay=(x[2].match(/^[\d+½.]+$/)?x[2].split('+').reduce((a,b)=>a+(parseFloat(b)||0),0):0);
      let qty=x[5]!=null?x[5]:Math.max(1,Math.ceil(perDay*x[4]));
      items.push({id:'it'+i+'_'+k,name:(pr.form+' '+pr.name+' '+pr.strength).trim(),qty,price:pr.mrp,dose:x[2],meal:x[3],days:x[4],note:x[6]||''});
    });
    const total=items.reduce((s,t)=>s+t.qty*t.price,0),pp=r();
    const docs=SEED_DOCTORS.map(d=>d.name);
    const doctor=kid?docs[1]:(c.dx==='Hypertension'?docs[2]:c.dx.indexOf('Diabetes')>=0?docs[5]:c.dx==='Osteoarthritis'||c.dx.indexOf('Lumbar')>=0?docs[6]:c.dx.indexOf('Dermatitis')>=0||c.dx.indexOf('Tinea')>=0?docs[4]:docs[[0,7,0,7][Math.floor(r()*4)]]);
    const w=kid?Math.round(age*2+8+r()*3):Math.round(gender==='Male'?58+r()*30:46+r()*30);
    const bp=c.hi?(140+Math.floor(r()*30))+'/'+(88+Math.floor(r()*17)):kid?'':(105+Math.floor(r()*25))+'/'+(68+Math.floor(r()*16));
    out.push({id:'pt'+i,sl:startSl+i,name,address:PT_PLACES[Math.floor(r()*PT_PLACES.length)],phone,age,gender,weight:w,bp,bg:BG[Math.floor(r()*BG.length)],doctor,cc:c.cc,dx:c.dx,advice:c.adv,visitDate:visit,nextVisit:addDaysStr(visit,[7,7,14,14,30][Math.floor(r()*5)]),createdAt:visit,
      products:items.slice(0,2).map(t=>({id:'',name:t.name})),items,paid:pp<.6?Math.round(total):pp<.85?Math.round(total/2):0});
  }
  return out;
}
function seedCatalogV4(){
  if(load('mms_cat4',false))return;
  let mx=0;patients.forEach(p=>{if(num(p.sl)>mx)mx=num(p.sl);});
  patients.forEach(p=>{if(!p.sl)p.sl=++mx;});
  const cat=buildCatalog();
  const have=new Set(products.map(p=>(p.name+'|'+p.strength+'|'+p.company).toLowerCase()));
  cat.forEach(c=>{const k=(c.name+'|'+c.strength+'|'+c.company).toLowerCase();if(!have.has(k)){have.add(k);products.push(c);}});
  const used=new Set(patients.map(p=>p.phone));
  buildPatients(cat,mx+1,used).forEach(p=>patients.push(p));
  patients.forEach(p=>{if(p.products)p.products=p.products.filter(x=>x.id);});
  SEED_DOCTORS.forEach((d,i)=>{if(!doctors.some(x=>x.name===d.name))doctors.push(Object.assign({id:'dc'+i,phone:'018'+String(10000000+hashStr(d.name)%89999999),products:[]},d));});
  save('mms_products',products);save('mms_patients',patients);save('mms_doctors',doctors);save('mms_cat4',true);
}


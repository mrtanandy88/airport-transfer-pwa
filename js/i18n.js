(() => {
  const VERSION='1.0.0';
  const KEY='airportTransferUiLanguage';
  const LANGS={en:'English',zh:'中文',ms:'Bahasa Melayu'};
  const D={
    en:{
      'Airport Transfer':'Airport Transfer','Install':'Install','Home':'Home','Book':'Book','Driver':'Driver','Admin':'Admin',
      'AIRPORT TRANSFER • PRE-BOOKING':'AIRPORT TRANSFER • PRE-BOOKING','Book. Match. Drive.':'Book. Match. Drive.',
      'Customers choose their preferred vehicle. Drivers match by vehicle, language and availability.':'Customers choose their preferred vehicle. Drivers match by vehicle, language and availability.',
      'CUSTOMER PRICE QUOTE':'CUSTOMER PRICE QUOTE','Get your airport transfer price':'Get your airport transfer price',
      'Send your trip details to admin on WhatsApp and receive your transparent customer price before booking.':'Send your trip details to admin on WhatsApp and receive your transparent customer price before booking.',
      'Your name':'Your name','WhatsApp number':'WhatsApp number','Pickup location':'Pickup location','Destination':'Destination',
      'Transfer date':'Transfer date','Pickup time':'Pickup time','Vehicle':'Vehicle','Passengers':'Passengers','Luggage':'Luggage',
      'Select vehicle':'Select vehicle','💬 Get price quote on WhatsApp':'💬 Get price quote on WhatsApp',
      "The customer price is separate from the driver's job fee and is never shown to drivers.":"The customer price is separate from the driver's job fee and is never shown to drivers.",
      'Customer':'Customer','Book an airport transfer':'Book an airport transfer','View matched jobs & manage profile':'View matched jobs & manage profile','Monitor bookings & drivers':'Monitor bookings & drivers',
      'Customer booking':'Customer booking','Logout':'Logout','Customer access':'Customer access',
      'Sign in with email and password to create and view bookings.':'Sign in with email and password to create and view bookings.',
      'Email':'Email','Password':'Password','Sign in':'Sign in','Create account':'Create account','Customer name':'Customer name','Phone':'Phone',
      'Airport / destination':'Airport / destination','Transfer date':'Transfer date','Pickup time':'Pickup time',
      '📍 Use my current location':'📍 Use my current location','Enter a hotel, building, landmark or full address, or use your current location.':'Enter a hotel, building, landmark or full address, or use your current location.',
      'You can enter an airport terminal, hotel, building, landmark or full address.':'You can enter an airport terminal, hotel, building, landmark or full address.',
      'Schedule: Please select the transfer date and time.':'Schedule: Please select the transfer date and time.',
      'Passengers':'Passengers','Tell the driver exactly how many adults and children are travelling.':'Tell the driver exactly how many adults and children are travelling.',
      'Adults':'Adults','Children':'Children','Passengers: 1 adult • 0 children • Total 1':'Passengers: 1 adult • 0 children • Total 1',
      'Please include checked luggage by size and any hand-carry bags.':'Please include checked luggage by size and any hand-carry bags.',
      'Large':'Large','Medium':'Medium','Small':'Small','Hand carry bags':'Hand carry bags','Total luggage':'Total luggage',
      'Luggage: 0 checked • 0 hand carry':'Luggage: 0 checked • 0 hand carry','Flight details':'Flight details',
      'Add flight information so the driver can prepare for your airport transfer.':'Add flight information so the driver can prepare for your airport transfer.',
      'Trip type':'Trip type','Not specified':'Not specified','Arrival':'Arrival','Departure':'Departure','Flight number':'Flight number',
      'Flight date':'Flight date','Flight time':'Flight time','Flight schedule: Optional':'Flight schedule: Optional','Terminal':'Terminal',
      'Meet / pickup instructions':'Meet / pickup instructions','Preferred driver language':'Preferred driver language','Preferred vehicle':'Preferred vehicle',
      'Place booking':'Place booking','Driver sign in':'Driver sign in',
      'Sign in with your driver email and password to view matched jobs and manage your profile.':'Sign in with your driver email and password to view matched jobs and manage your profile.',
      'Driver name':'Driver name','Car model':'Car model','Car color':'Car color','Car plate number':'Car plate number',
      'Preferred pickup area':'Preferred pickup area','📍 Set preferred area from my current location':'📍 Set preferred area from my current location',
      'Use an area or landmark, or save GPS from your current location. Please avoid entering your home address.':'Use an area or landmark, or save GPS from your current location. Please avoid entering your home address.',
      'Selfie / driver photo':'Selfie / driver photo','Car photo':'Car photo','Languages you can speak':'Languages you can speak',
      'Tap the language field to choose or change the languages you speak.':'Tap the language field to choose or change the languages you speak.',
      'Photos are compressed in your browser before being saved to the MVP database.':'Photos are compressed in your browser before being saved to the MVP database.',
      'Create driver account':'Create driver account','DRIVER DASHBOARD':'DRIVER DASHBOARD','Welcome back':'Welcome back',
      'Manage your profile and airport transfer jobs.':'Manage your profile and airport transfer jobs.','Online':'Online','My Profile':'My Profile',
      'Vehicle details':'Vehicle details','WhatsApp not provided':'WhatsApp not provided','✏️ Edit':'✏️ Edit','Edit driver profile':'Edit driver profile',
      'Replace selfie / driver photo':'Replace selfie / driver photo','Replace car photo':'Replace car photo','Languages I speak':'Languages I speak',
      'Save driver profile':'Save driver profile','Accepted Jobs':'Accepted Jobs','Available Jobs':'Available Jobs','Completed Jobs':'Completed Jobs',
      'Private unavailable schedule':'Private unavailable schedule','Add times when you are unavailable. Matching automatically hides jobs during these periods.':'Add times when you are unavailable. Matching automatically hides jobs during these periods.',
      'Unavailable date':'Unavailable date','From':'From','To':'To','Unavailable: Select date, From and To times.':'Unavailable: Select date, From and To times.',
      'Add unavailable time':'Add unavailable time','Admin dashboard':'Admin dashboard','Clear demo data':'Clear demo data','Admin access':'Admin access',
      'Admin accounts are assigned through Firebase roles.':'Admin accounts are assigned through Firebase roles.','DRIVER MANAGEMENT':'DRIVER MANAGEMENT',
      '👨‍✈️ Registered drivers':'👨‍✈️ Registered drivers','View every driver, vehicle, contact details, photos, private schedule and job history.':'View every driver, vehicle, contact details, photos, private schedule and job history.',
      'Search':'Search','Clear':'Clear','All':'All','Available':'Available','Accepted':'Accepted','Completed':'Completed',
      '🔔 Enable notifications':'🔔 Enable notifications'
    },
    zh:{
      'Airport Transfer':'机场接送','Install':'安装','Home':'首页','Book':'预订','Driver':'司机','Admin':'管理员',
      'AIRPORT TRANSFER • PRE-BOOKING':'机场接送 • 预订','Book. Match. Drive.':'预订 · 配对 · 接送',
      'Customers choose their preferred vehicle. Drivers match by vehicle, language and availability.':'客户选择所需车型，系统根据车型、语言和可用时间匹配司机。',
      'CUSTOMER PRICE QUOTE':'客户报价','Get your airport transfer price':'获取机场接送报价',
      'Send your trip details to admin on WhatsApp and receive your transparent customer price before booking.':'通过 WhatsApp 将行程资料发送给管理员，并在预订前获取清晰的客户报价。',
      'Your name':'您的姓名','WhatsApp number':'WhatsApp号码','Pickup location':'接载地点','Destination':'目的地',
      'Transfer date':'接送日期','Pickup time':'接送时间','Vehicle':'车型','Passengers':'乘客','Luggage':'行李',
      'Select vehicle':'选择车型','💬 Get price quote on WhatsApp':'💬 通过 WhatsApp 获取报价',
      "The customer price is separate from the driver's job fee and is never shown to drivers.":'客户报价与司机工作费用分开，司机不会看到客户报价。',
      'Customer':'客户','Book an airport transfer':'预订机场接送','View matched jobs & manage profile':'查看匹配订单及管理资料','Monitor bookings & drivers':'管理订单和司机',
      'Customer booking':'客户预订','Logout':'退出','Customer access':'客户登录','Sign in with email and password to create and view bookings.':'使用电子邮件和密码登录，以创建和查看订单。',
      'Email':'电子邮件','Password':'密码','Sign in':'登录','Create account':'创建账户','Customer name':'客户姓名','Phone':'电话',
      'Airport / destination':'机场 / 目的地','📍 Use my current location':'📍 使用我的当前位置','Enter a hotel, building, landmark or full address, or use your current location.':'请输入酒店、建筑物、地标或完整地址，也可以使用当前位置。',
      'You can enter an airport terminal, hotel, building, landmark or full address.':'您可以输入机场航站楼、酒店、建筑物、地标或完整地址。',
      'Schedule: Please select the transfer date and time.':'行程：请选择接送日期和时间。','Passengers':'乘客',
      'Tell the driver exactly how many adults and children are travelling.':'请准确填写成人和儿童人数。',
      'Adults':'成人','Children':'儿童','Passengers: 1 adult • 0 children • Total 1':'乘客：1名成人 • 0名儿童 • 共1人',
      'Please include checked luggage by size and any hand-carry bags.':'请填写托运行李尺寸及手提行李数量。',
      'Large':'大型','Medium':'中型','Small':'小型','Hand carry bags':'手提行李','Total luggage':'行李总数','Luggage: 0 checked • 0 hand carry':'行李：0件托运 • 0件手提',
      'Flight details':'航班资料','Add flight information so the driver can prepare for your airport transfer.':'请填写航班资料，让司机提前准备机场接送。',
      'Trip type':'行程类型','Not specified':'未指定','Arrival':'抵达','Departure':'出发','Flight number':'航班号','Flight date':'航班日期','Flight time':'航班时间',
      'Flight schedule: Optional':'航班时间：可选','Terminal':'航站楼','Meet / pickup instructions':'会面 / 接载说明','Preferred driver language':'首选司机语言','Preferred vehicle':'首选车型','Place booking':'提交预订',
      'Driver sign in':'司机登录','Sign in with your driver email and password to view matched jobs and manage your profile.':'使用司机电子邮件和密码登录，以查看匹配订单和管理资料。',
      'Driver name':'司机姓名','Car model':'车辆型号','Car color':'车辆颜色','Car plate number':'车牌号码','Preferred pickup area':'首选接载区域',
      '📍 Set preferred area from my current location':'📍 使用当前位置设置首选区域','Use an area or landmark, or save GPS from your current location. Please avoid entering your home address.':'请输入区域或地标，或保存当前位置 GPS。请勿填写住家地址。',
      'Selfie / driver photo':'司机自拍 / 照片','Car photo':'车辆照片','Languages you can speak':'您会说的语言','Tap the language field to choose or change the languages you speak.':'点击语言栏选择或修改您会说的语言。',
      'Photos are compressed in your browser before being saved to the MVP database.':'照片会在浏览器中压缩后再保存到 MVP 数据库。','Create driver account':'创建司机账户',
      'DRIVER DASHBOARD':'司机控制面板','Welcome back':'欢迎回来','Manage your profile and airport transfer jobs.':'管理您的资料和机场接送订单。','Online':'在线','My Profile':'我的资料',
      'Vehicle details':'车辆资料','WhatsApp not provided':'未提供 WhatsApp','✏️ Edit':'✏️ 编辑','Edit driver profile':'编辑司机资料','Replace selfie / driver photo':'更换司机照片','Replace car photo':'更换车辆照片','Languages I speak':'我会说的语言','Save driver profile':'保存司机资料',
      'Accepted Jobs':'已接受订单','Available Jobs':'可接订单','Completed Jobs':'已完成订单','Private unavailable schedule':'私人不可用时间',
      'Add times when you are unavailable. Matching automatically hides jobs during these periods.':'添加您无法接单的时间，系统会自动隐藏这些时间内的订单。',
      'Unavailable date':'不可用日期','From':'开始','To':'结束','Unavailable: Select date, From and To times.':'不可用时间：请选择日期、开始和结束时间。','Add unavailable time':'添加不可用时间',
      'Admin dashboard':'管理员控制面板','Clear demo data':'清除演示数据','Admin access':'管理员登录','Admin accounts are assigned through Firebase roles.':'管理员账户通过 Firebase 角色分配。',
      'DRIVER MANAGEMENT':'司机管理','👨‍✈️ Registered drivers':'👨‍✈️ 已注册司机','View every driver, vehicle, contact details, photos, private schedule and job history.':'查看所有司机、车辆、联系方式、照片、私人时间和工作记录。',
      'Search':'搜索','Clear':'清除','All':'全部','Available':'可接','Accepted':'已接受','Completed':'已完成','🔔 Enable notifications':'🔔 开启通知'
    },
    ms:{
      'Airport Transfer':'Pemindahan Lapangan Terbang','Install':'Pasang','Home':'Utama','Book':'Tempah','Driver':'Pemandu','Admin':'Admin',
      'AIRPORT TRANSFER • PRE-BOOKING':'PEMINDAHAN LAPANGAN TERBANG • PRA-TEMPAHAN','Book. Match. Drive.':'Tempah · Padankan · Pandu',
      'Customers choose their preferred vehicle. Drivers match by vehicle, language and availability.':'Pelanggan memilih kenderaan pilihan. Pemandu dipadankan berdasarkan kenderaan, bahasa dan ketersediaan.',
      'CUSTOMER PRICE QUOTE':'SEBUT HARGA PELANGGAN','Get your airport transfer price':'Dapatkan harga pemindahan lapangan terbang',
      'Send your trip details to admin on WhatsApp and receive your transparent customer price before booking.':'Hantar butiran perjalanan kepada admin melalui WhatsApp dan terima harga pelanggan yang jelas sebelum membuat tempahan.',
      'Your name':'Nama anda','WhatsApp number':'Nombor WhatsApp','Pickup location':'Lokasi pengambilan','Destination':'Destinasi',
      'Transfer date':'Tarikh pemindahan','Pickup time':'Masa pengambilan','Vehicle':'Kenderaan','Passengers':'Penumpang','Luggage':'Bagasi',
      'Select vehicle':'Pilih kenderaan','💬 Get price quote on WhatsApp':'💬 Dapatkan sebut harga melalui WhatsApp',
      "The customer price is separate from the driver's job fee and is never shown to drivers.":'Harga pelanggan berasingan daripada bayaran kerja pemandu dan tidak akan dipaparkan kepada pemandu.',
      'Customer':'Pelanggan','Book an airport transfer':'Tempah pemindahan lapangan terbang','View matched jobs & manage profile':'Lihat tugasan dipadankan & urus profil','Monitor bookings & drivers':'Pantau tempahan & pemandu',
      'Customer booking':'Tempahan pelanggan','Logout':'Log keluar','Customer access':'Akses pelanggan','Sign in with email and password to create and view bookings.':'Log masuk dengan e-mel dan kata laluan untuk membuat dan melihat tempahan.',
      'Email':'E-mel','Password':'Kata laluan','Sign in':'Log masuk','Create account':'Cipta akaun','Customer name':'Nama pelanggan','Phone':'Telefon',
      'Airport / destination':'Lapangan terbang / destinasi','📍 Use my current location':'📍 Gunakan lokasi semasa saya','Enter a hotel, building, landmark or full address, or use your current location.':'Masukkan hotel, bangunan, mercu tanda atau alamat penuh, atau gunakan lokasi semasa.',
      'You can enter an airport terminal, hotel, building, landmark or full address.':'Anda boleh memasukkan terminal lapangan terbang, hotel, bangunan, mercu tanda atau alamat penuh.',
      'Schedule: Please select the transfer date and time.':'Jadual: Sila pilih tarikh dan masa pemindahan.','Passengers':'Penumpang','Tell the driver exactly how many adults and children are travelling.':'Nyatakan jumlah dewasa dan kanak-kanak yang akan menaiki kenderaan.',
      'Adults':'Dewasa','Children':'Kanak-kanak','Passengers: 1 adult • 0 children • Total 1':'Penumpang: 1 dewasa • 0 kanak-kanak • Jumlah 1',
      'Please include checked luggage by size and any hand-carry bags.':'Sila nyatakan bagasi daftar masuk mengikut saiz serta beg tangan.',
      'Large':'Besar','Medium':'Sederhana','Small':'Kecil','Hand carry bags':'Beg tangan','Total luggage':'Jumlah bagasi','Luggage: 0 checked • 0 hand carry':'Bagasi: 0 daftar masuk • 0 beg tangan',
      'Flight details':'Butiran penerbangan','Add flight information so the driver can prepare for your airport transfer.':'Tambah maklumat penerbangan supaya pemandu boleh membuat persediaan.',
      'Trip type':'Jenis perjalanan','Not specified':'Tidak dinyatakan','Arrival':'Ketibaan','Departure':'Berlepas','Flight number':'Nombor penerbangan','Flight date':'Tarikh penerbangan','Flight time':'Masa penerbangan',
      'Flight schedule: Optional':'Jadual penerbangan: Pilihan','Terminal':'Terminal','Meet / pickup instructions':'Arahan pertemuan / pengambilan','Preferred driver language':'Bahasa pemandu pilihan','Preferred vehicle':'Kenderaan pilihan','Place booking':'Buat tempahan',
      'Driver sign in':'Log masuk pemandu','Sign in with your driver email and password to view matched jobs and manage your profile.':'Log masuk dengan e-mel dan kata laluan pemandu untuk melihat tugasan yang dipadankan dan mengurus profil.',
      'Driver name':'Nama pemandu','Car model':'Model kereta','Car color':'Warna kereta','Car plate number':'Nombor pendaftaran kereta','Preferred pickup area':'Kawasan pengambilan pilihan',
      '📍 Set preferred area from my current location':'📍 Tetapkan kawasan pilihan dari lokasi semasa','Use an area or landmark, or save GPS from your current location. Please avoid entering your home address.':'Gunakan kawasan atau mercu tanda, atau simpan GPS dari lokasi semasa. Elakkan memasukkan alamat rumah.',
      'Selfie / driver photo':'Selfie / foto pemandu','Car photo':'Foto kereta','Languages you can speak':'Bahasa yang anda boleh tuturkan','Tap the language field to choose or change the languages you speak.':'Tekan medan bahasa untuk memilih atau mengubah bahasa yang anda boleh tuturkan.',
      'Photos are compressed in your browser before being saved to the MVP database.':'Foto dimampatkan dalam pelayar sebelum disimpan ke pangkalan data MVP.','Create driver account':'Cipta akaun pemandu',
      'DRIVER DASHBOARD':'PAPAN PEMUKA PEMANDU','Welcome back':'Selamat kembali','Manage your profile and airport transfer jobs.':'Urus profil dan tugasan pemindahan lapangan terbang anda.','Online':'Dalam talian','My Profile':'Profil Saya',
      'Vehicle details':'Butiran kenderaan','WhatsApp not provided':'WhatsApp tidak diberikan','✏️ Edit':'✏️ Edit','Edit driver profile':'Edit profil pemandu','Replace selfie / driver photo':'Ganti selfie / foto pemandu','Replace car photo':'Ganti foto kereta','Languages I speak':'Bahasa yang saya tuturkan','Save driver profile':'Simpan profil pemandu',
      'Accepted Jobs':'Tugasan Diterima','Available Jobs':'Tugasan Tersedia','Completed Jobs':'Tugasan Selesai','Private unavailable schedule':'Jadual peribadi tidak tersedia',
      'Add times when you are unavailable. Matching automatically hides jobs during these periods.':'Tambah masa anda tidak tersedia. Sistem akan menyembunyikan tugasan secara automatik dalam tempoh tersebut.',
      'Unavailable date':'Tarikh tidak tersedia','From':'Dari','To':'Hingga','Unavailable: Select date, From and To times.':'Tidak tersedia: Pilih tarikh, masa mula dan tamat.','Add unavailable time':'Tambah masa tidak tersedia',
      'Admin dashboard':'Papan pemuka admin','Clear demo data':'Kosongkan data demo','Admin access':'Akses admin','Admin accounts are assigned through Firebase roles.':'Akaun admin ditetapkan melalui peranan Firebase.',
      'DRIVER MANAGEMENT':'PENGURUSAN PEMANDU','👨‍✈️ Registered drivers':'👨‍✈️ Pemandu berdaftar','View every driver, vehicle, contact details, photos, private schedule and job history.':'Lihat semua pemandu, kenderaan, butiran hubungan, foto, jadual peribadi dan sejarah tugasan.',
      'Search':'Cari','Clear':'Kosongkan','All':'Semua','Available':'Tersedia','Accepted':'Diterima','Completed':'Selesai','🔔 Enable notifications':'🔔 Aktifkan notifikasi'
    }
  };

  let lang=localStorage.getItem(KEY)||'en';
  const originals=new WeakMap();
  const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();

  function translateString(input,target=lang){
    let s=String(input??'');
    const map=D[target]||D.en;
    const entries=Object.keys(map).sort((a,b)=>b.length-a.length);
    for(const key of entries){
      if(key && s.includes(key)) s=s.split(key).join(map[key]);
    }
    return s;
  }

  function apply(root=document){
    const map=D[lang]||D.en;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      if(!n.parentElement || ['SCRIPT','STYLE'].includes(n.parentElement.tagName))return;
      if(!originals.has(n)) originals.set(n,n.nodeValue);
      const original=originals.get(n);
      if(normalize(original)) n.nodeValue=translateString(original);
    });
    root.querySelectorAll?.('input[placeholder],textarea[placeholder]').forEach(el=>{
      if(!el.dataset.i18nPlaceholder)el.dataset.i18nPlaceholder=el.placeholder;
      el.placeholder=translateString(el.dataset.i18nPlaceholder);
    });
    document.documentElement.lang=lang;
    const title=document.querySelector('title'); if(title)title.textContent=lang==='zh'?'机场接送':lang==='ms'?'Pemindahan Lapangan Terbang':'Airport Transfer';
    const selector=document.getElementById('uiLanguage');
    if(selector)selector.value=lang;
  }

  function setLanguage(next){
    if(!D[next])return;
    lang=next;localStorage.setItem(KEY,lang);apply(document);
    document.dispatchEvent(new CustomEvent('appLanguageChanged',{detail:{language:lang}}));
  }

  function installSelector(){
    if(document.getElementById('uiLanguage'))return;
    const top=document.querySelector('.topbar');
    if(!top)return;
    const wrap=document.createElement('label');
    wrap.className='ui-language-selector';
    wrap.innerHTML='<span>🌐</span><select id="uiLanguage" aria-label="Language"><option value="en">English</option><option value="zh">中文</option><option value="ms">Bahasa Melayu</option></select>';
    top.appendChild(wrap);
    const select=wrap.querySelector('select');
    select.value=lang;
    select.addEventListener('change',()=>setLanguage(select.value));
  }

  window.getAppLanguage=()=>lang;
  window.appTranslate=(text,target)=>translateString(text,target);
  window.appTranslations=D;
  window.setAppLanguage=setLanguage;

  function start(){
    installSelector();
    apply(document);
    const observer=new MutationObserver(muts=>{
      for(const m of muts) if(m.addedNodes.length){m.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n);});break;}
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
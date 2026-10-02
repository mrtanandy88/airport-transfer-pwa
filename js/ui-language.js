(() => {
  const KEY='airportTransferUiLanguage';
  const LANGS={en:'English',ms:'Bahasa Melayu',zh:'中文'};
  const T={
    en:{
      brand:'Airport Transfer',eyebrow:'AIRPORT TRANSFER • PRE-BOOKING',heroTitle:'Book. Match. Drive.',
      heroText:'Customers choose their preferred vehicle. Drivers match by vehicle, language and availability.',
      quoteEyebrow:'CUSTOMER PRICE QUOTE',quoteTitle:'Get your airport transfer price',
      quoteText:'Send your trip details to admin on WhatsApp and receive your transparent customer price before booking.',
      name:'Your name',phone:'WhatsApp number',pickup:'Pickup location',destination:'Destination',
      date:'Transfer date',time:'Pickup time',vehicle:'Vehicle',passengers:'Passengers',luggage:'Luggage',
      quoteButton:'💬 Get price quote on WhatsApp',quoteNote:"The customer price is separate from the driver's job fee and is never shown to drivers.",
      customer:'Customer',customerSub:'Book an airport transfer',driver:'Driver',driverSub:'View matched jobs & manage profile',
      admin:'Admin',adminSub:'Monitor bookings & drivers',home:'Home',book:'Book',
      back:'← Back',customerBooking:'Customer booking',logout:'Logout',customerAccess:'Customer access',
      signInCustomer:'Sign in with email and password to create and view bookings.',
      email:'Email',password:'Password',signIn:'Sign in',createAccount:'Create account',
      customerName:'Customer name',useLocation:'📍 Use my current location',
      pickupHint:'Enter a hotel, building, landmark or full address, or use your current location.',
      destinationHint:'You can enter an airport terminal, hotel, building, landmark or full address.',
      schedule:'Schedule: Please select the transfer date and time.',
      passengersTitle:'👨‍👩‍👧‍👦 Passengers',passengersHint:'Tell the driver exactly how many adults and children are travelling.',
      adults:'Adults',children:'Children',luggageTitle:'🧳 Luggage',
      luggageHint:'Please include checked luggage by size and any hand-carry bags.',
      large:'Large',medium:'Medium',small:'Small',handCarry:'Hand carry bags',totalLuggage:'Total luggage',
      flightTitle:'✈️ Flight details',flightHint:'Add flight information so the driver can prepare for your airport transfer.',
      tripType:'Trip type',notSpecified:'Not specified',arrival:'Arrival',departure:'Departure',
      flightNumber:'Flight number',flightDate:'Flight date',flightTime:'Flight time',terminal:'Terminal',
      meet:'Meet / pickup instructions',preferredLanguage:'Preferred driver language',
      preferredLanguageHint:'Choose the language you prefer your driver to speak: Mandarin, English or Malay.',
      any:'Any',preferredVehicle:'Preferred vehicle',selectVehicle:'Select vehicle',placeBooking:'Place booking'
    },
    ms:{
      brand:'Pemindahan Lapangan Terbang',eyebrow:'PEMINDAHAN LAPANGAN TERBANG • TEMPAHAN AWAL',heroTitle:'Tempah. Padankan. Pandu.',
      heroText:'Pelanggan memilih jenis kenderaan. Pemandu dipadankan berdasarkan kenderaan, bahasa dan ketersediaan.',
      quoteEyebrow:'SEBUT HARGA PELANGGAN',quoteTitle:'Dapatkan harga pemindahan lapangan terbang',
      quoteText:'Hantar butiran perjalanan kepada admin melalui WhatsApp dan terima harga pelanggan yang telus sebelum membuat tempahan.',
      name:'Nama anda',phone:'Nombor WhatsApp',pickup:'Lokasi pengambilan',destination:'Destinasi',
      date:'Tarikh pemindahan',time:'Masa pengambilan',vehicle:'Kenderaan',passengers:'Penumpang',luggage:'Bagasi',
      quoteButton:'💬 Dapatkan sebut harga melalui WhatsApp',quoteNote:'Harga pelanggan adalah berasingan daripada bayaran kerja pemandu dan tidak akan dipaparkan kepada pemandu.',
      customer:'Pelanggan',customerSub:'Tempah pemindahan lapangan terbang',driver:'Pemandu',driverSub:'Lihat kerja dipadankan & urus profil',
      admin:'Admin',adminSub:'Pantau tempahan & pemandu',home:'Utama',book:'Tempah',
      back:'← Kembali',customerBooking:'Tempahan pelanggan',logout:'Log keluar',customerAccess:'Akses pelanggan',
      signInCustomer:'Log masuk dengan e-mel dan kata laluan untuk membuat dan melihat tempahan.',
      email:'E-mel',password:'Kata laluan',signIn:'Log masuk',createAccount:'Cipta akaun',
      customerName:'Nama pelanggan',useLocation:'📍 Gunakan lokasi semasa saya',
      pickupHint:'Masukkan hotel, bangunan, mercu tanda atau alamat penuh, atau gunakan lokasi semasa anda.',
      destinationHint:'Anda boleh masukkan terminal lapangan terbang, hotel, bangunan, mercu tanda atau alamat penuh.',
      schedule:'Jadual: Sila pilih tarikh dan masa pemindahan.',
      passengersTitle:'👨‍👩‍👧‍👦 Penumpang',passengersHint:'Beritahu pemandu jumlah dewasa dan kanak-kanak yang akan menaiki kenderaan.',
      adults:'Dewasa',children:'Kanak-kanak',luggageTitle:'🧳 Bagasi',
      luggageHint:'Sila masukkan bagasi daftar masuk mengikut saiz dan semua beg tangan.',
      large:'Besar',medium:'Sederhana',small:'Kecil',handCarry:'Beg tangan',totalLuggage:'Jumlah bagasi',
      flightTitle:'✈️ Maklumat penerbangan',flightHint:'Tambah maklumat penerbangan supaya pemandu boleh bersedia untuk pemindahan anda.',
      tripType:'Jenis perjalanan',notSpecified:'Tidak dinyatakan',arrival:'Ketibaan',departure:'Berlepas',
      flightNumber:'Nombor penerbangan',flightDate:'Tarikh penerbangan',flightTime:'Masa penerbangan',terminal:'Terminal',
      meet:'Arahan bertemu / pengambilan',preferredLanguage:'Bahasa pemandu pilihan',
      preferredLanguageHint:'Pilih bahasa yang anda mahu pemandu gunakan: Mandarin, English atau Bahasa Melayu.',
      any:'Mana-mana',preferredVehicle:'Kenderaan pilihan',selectVehicle:'Pilih kenderaan',placeBooking:'Buat tempahan'
    },
    zh:{
      brand:'机场接送',eyebrow:'机场接送 • 提前预订',heroTitle:'预订 · 匹配 · 出发',
      heroText:'客户选择所需车型。系统根据车型、语言和可用时间为您匹配司机。',
      quoteEyebrow:'客户报价',quoteTitle:'获取机场接送价格',
      quoteText:'将行程资料通过 WhatsApp 发送给管理员，并在预订前获取透明的客户价格。',
      name:'您的姓名',phone:'WhatsApp号码',pickup:'上车地点',destination:'目的地',
      date:'接送日期',time:'上车时间',vehicle:'车型',passengers:'乘客人数',luggage:'行李',
      quoteButton:'💬 通过 WhatsApp 获取报价',quoteNote:'客户价格与司机工作费用分开，司机不会看到客户价格。',
      customer:'客户',customerSub:'预订机场接送',driver:'司机',driverSub:'查看匹配工作及管理资料',
      admin:'管理员',adminSub:'管理预订及司机',home:'首页',book:'预订',
      back:'← 返回',customerBooking:'客户预订',logout:'登出',customerAccess:'客户登录',
      signInCustomer:'使用电子邮件和密码登录以创建和查看预订。',
      email:'电子邮件',password:'密码',signIn:'登录',createAccount:'创建账户',
      customerName:'客户姓名',useLocation:'📍 使用我的当前位置',
      pickupHint:'请输入酒店、建筑物、地标或完整地址，也可以使用当前位置。',
      destinationHint:'请输入机场航站楼、酒店、建筑物、地标或完整地址。',
      schedule:'行程：请选择接送日期和时间。',
      passengersTitle:'👨‍👩‍👧‍👦 乘客',passengersHint:'请准确填写成人和儿童人数。',
      adults:'成人',children:'儿童',luggageTitle:'🧳 行李',
      luggageHint:'请按大小填写托运行李，并包括手提行李。',
      large:'大型',medium:'中型',small:'小型',handCarry:'手提行李',totalLuggage:'行李总数',
      flightTitle:'✈️ 航班资料',flightHint:'添加航班资料，让司机提前准备机场接送。',
      tripType:'行程类型',notSpecified:'未指定',arrival:'抵达',departure:'出发',
      flightNumber:'航班号',flightDate:'航班日期',flightTime:'航班时间',terminal:'航站楼',
      meet:'会面 / 接送说明',preferredLanguage:'首选司机语言',
      preferredLanguageHint:'选择您希望司机使用的语言：普通话、英语或马来语。',
      any:'不限',preferredVehicle:'首选车型',selectVehicle:'选择车型',placeBooking:'提交预订'
    }
  };

  function setText(selector,key,lang){const el=document.querySelector(selector);if(el&&T[lang][key]!=null)el.textContent=T[lang][key];}
  function setLabel(selector,key,lang){const el=document.querySelector(selector);if(el&&T[lang][key]!=null){const input=el.querySelector('input,select,textarea');el.childNodes[0].textContent=T[lang][key];}}
  function setPlaceholder(selector,text){const el=document.querySelector(selector);if(el)el.placeholder=text;}

  function apply(lang){
    lang=T[lang]?lang:'en';
    localStorage.setItem(KEY,lang);
    document.documentElement.lang=lang==='zh'?'zh-CN':lang==='ms'?'ms':'en';
    const s=document.querySelector('#uiLanguage');
    if(s)s.value=lang;

    const keys={
      '#home .hero .eyebrow':'eyebrow','#home .hero h1':'heroTitle','#home .hero p:not(.eyebrow)':'heroText',
      '#home .quote-panel .eyebrow':'quoteEyebrow','#home .quote-panel h2':'quoteTitle','#home .quote-panel>p':'quoteText',
      '#homeQuoteWhatsApp':'quoteButton','#home .quote-panel>small':'quoteNote',
      '[data-go="customer"] b':'customer','[data-go="customer"] small':'customerSub',
      '[data-go="driver"] b':'driver','[data-go="driver"] small':'driverSub',
      '[data-go="admin"] b':'admin','[data-go="admin"] small':'adminSub',
      '#customer .back':'back','#customer h2':'customerBooking','#customerLogout':'logout',
      '#customerAuth h3':'customerAccess','#customerAuth>p':'signInCustomer',
      '#customerLogin':'signIn','#customerSignup':'createAccount',
      '#usePickupLocation':'useLocation','#bookingDateTimePreview':'schedule',
      '#bookingForm>h3:nth-of-type(1)':'passengersTitle','#bookingForm>p.muted':'passengersHint',
      '#bookingForm>h3:nth-of-type(2)':'luggageTitle','#bookingForm>h3:nth-of-type(3)':'flightTitle',
      '#bookingForm button[type="submit"]':'placeBooking'
    };
    Object.entries(keys).forEach(([sel,key])=>setText(sel,key,lang));

    const labelKeys=[
      ['#bookingForm label:nth-of-type(1)','customerName'],['#bookingForm label:nth-of-type(2)','phone'],
      ['#bookingForm label:nth-of-type(3)','pickup'],['#bookingForm label:nth-of-type(4)','destination'],
      ['#bookingForm label:nth-of-type(5)','date'],['#bookingForm label:nth-of-type(6)','time']
    ];
    labelKeys.forEach(([sel,key])=>setLabel(sel,key,lang));

    // Use explicit field names for the remainder, avoiding fragile visual ordering.
    const byName=(name,key)=>{const el=document.querySelector('#bookingForm [name="'+name+'"]');const lab=el?.closest('label');if(lab&&T[lang][key])lab.childNodes[0].textContent=T[lang][key];};
    ['name','phone','pickup','destination','date','time','adults','children','largeLuggage','mediumLuggage','smallLuggage','handCarry','luggage','flightType','flightNumber','flightDate','flightTime','terminal','meetInstructions','language','vehicleType'].forEach(n=>{});
    [['name','customerName'],['phone','phone'],['pickup','pickup'],['destination','destination'],['date','date'],['time','time'],['adults','adults'],['children','children'],['largeLuggage','large'],['mediumLuggage','medium'],['smallLuggage','small'],['handCarry','handCarry'],['luggage','totalLuggage'],['flightType','tripType'],['flightNumber','flightNumber'],['flightDate','flightDate'],['flightTime','flightTime'],['terminal','terminal'],['meetInstructions','meet'],['language','preferredLanguage'],['vehicleType','preferredVehicle']].forEach(x=>byName(x[0],x[1]));

    setText('#bookingForm>small.muted','quoteNote',lang);
    setPlaceholder('#homeQuoteName',T[lang].name);
    setPlaceholder('#homeQuotePhone',lang==='zh'?'例如 0123456789':lang==='ms'?'cth. 0123456789':'e.g. 0123456789');
    setPlaceholder('#homeQuotePickup',lang==='zh'?'酒店、地址或地标':'Hotel, address or landmark');
    setPlaceholder('#homeQuoteDestination',lang==='zh'?'机场、酒店或地址':'KLIA, hotel or address');
    setPlaceholder('#bookingForm [name="pickup"]',T[lang].pickupHint);
    setPlaceholder('#bookingForm [name="destination"]',T[lang].destinationHint);
    setPlaceholder('#bookingForm [name="flightNumber"]','e.g. MH123');
    setPlaceholder('#bookingForm [name="terminal"]',lang==='zh'?'例如 KLIA 航站楼 1':'e.g. KLIA Terminal 1');
    setPlaceholder('#bookingForm [name="meetInstructions"]',lang==='zh'?'例如：在抵达大厅3号门会面':'e.g. Meet at Door 3, arrival hall');

    // Translate option labels while preserving stored values used by matching.
    const translateOptions=(sel,map)=>document.querySelectorAll(sel+' option').forEach(o=>{if(map[o.value])o.textContent=map[o.value];});
    translateOptions('#bookingForm [name="language"]',{Any:T[lang].any,Mandarin:lang==='zh'?'普通话':'Mandarin',English:'English',Malay:lang==='ms'?'Bahasa Melayu':lang==='zh'?'马来语':'Malay'});
    translateOptions('#bookingForm [name="vehicleType"]',{Sedan:'Sedan',SUV:'SUV',MPV:'MPV'});
    translateOptions('#bookingForm [name="flightType"]',{'':'Not specified',Arrival:T[lang].arrival,Departure:T[lang].departure});
    translateOptions('#homeQuoteVehicle',{ '':'Select vehicle',Sedan:'Sedan',SUV:'SUV',MPV:'MPV'});

    const status=document.querySelector('#pickupLocationStatus'); if(status)status.textContent=T[lang].pickupHint;
    const langHint=[...document.querySelectorAll('#bookingForm small.muted')].find(x=>x.textContent.includes('language')||x.textContent.includes('language you')||x.textContent.includes('语言')||x.textContent.includes('Bahasa'));
    if(langHint)langHint.textContent=T[lang].preferredLanguageHint;

    document.querySelectorAll('[data-ui-language]').forEach(b=>b.classList.toggle('active',b.dataset.uiLanguage===lang));
  }

  function init(){
    const header=document.querySelector('.topbar');
    if(header&&!document.querySelector('#uiLanguage')){
      const wrap=document.createElement('div');wrap.className='topbar-actions';
      wrap.innerHTML='<label class="ui-language-selector" title="Interface language">🌐 <select id="uiLanguage" aria-label="Interface language"><option value="en">English</option><option value="ms">Bahasa Melayu</option><option value="zh">中文</option></select></label>';
      header.appendChild(wrap);
      document.querySelector('#uiLanguage').addEventListener('change',e=>apply(e.target.value));
    }
    apply(localStorage.getItem(KEY)||'en');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.airportTransferSetLanguage=apply;
})();
/* English edition. Turkish is written in the HTML; English is applied on top.
   Language: ?lang= → presentation link (l) → saved choice → browser language. */
(function () {
  'use strict';
  const KEY = 'zaya-lang';
  const params = new URLSearchParams(location.search);
  let lang = null;
  const fromParam = params.get('lang');
  if (fromParam === 'en' || fromParam === 'tr') lang = fromParam;
  if (!lang && params.get('p')) {
    try {
      const code = params.get('p').replace(/-/g, '+').replace(/_/g, '/');
      const data = JSON.parse(decodeURIComponent(escape(atob(code))));
      if (data.l === 'en' || data.l === 'tr') lang = data.l;
    } catch (e) {}
  }
  if (!lang) { try { lang = localStorage.getItem(KEY); } catch (e) {} }
  if (lang !== 'en' && lang !== 'tr') lang = /^tr\b/i.test(navigator.language || '') ? 'tr' : 'en';
  try { localStorage.setItem(KEY, lang); } catch (e) {}
  window.ZAYA_LANG = lang;
  document.documentElement.lang = lang;

  const EN = {
    // navigation & shell
    'İçeriğe geç': 'Skip to content', 'Şovlar': 'Shows', 'Hizmetler': 'Services', 'Hakkında': 'About', 'İletişim': 'Contact',
    'ZAYA Events ana sayfa': 'ZAYA Events home', 'Ana menü': 'Main menu', 'Menüyü aç': 'Open menu', 'Menüyü kapat': 'Close menu', 'Mobil menü': 'Mobile menu',
    'Şov & Prodüksiyon': 'Shows & Production', 'Başa dön': 'Back to top',
    '© 2026 ZAYA Events · Katalog görselleri tanıtım amaçlıdır.': '© 2026 ZAYA Events · Catalogue images are for presentation purposes.',
    // hero
    'ŞOV & PRODÜKSİYON': 'SHOWS & PRODUCTION', 'Gündüzden': 'From day', 'geceye.': 'to night.',
    'Misafir tatili unutur.': 'Guests forget the holiday.', 'O geceyi unutmaz.': 'Never that night.',
    'THE COLLECTION': 'THE COLLECTION', '33 program · 5 ayrı dünya ↗': '33 shows · 5 worlds ↗', 'Koleksiyonu keşfet ↗': 'Explore the collection ↗', 'Tüm şovları gör': 'See all shows',
    'ZAYA Events — Gündüzden geceye': 'ZAYA Events — From day to night',
    // references
    'BİRLİKTE AYNI ENERJİ': 'THE SAME ENERGY, TOGETHER', 'Referanslarımız': 'Our partners',
    // collection strip
    '2027 KOLEKSİYONU': '2027 COLLECTION', 'Farklı enerjiler.': 'Different energies.', 'Aynı sahne.': 'One stage.',
    'Sahneden havuz başına, çocuk festivallerinden tema gecelerine. Beş dünya, tek prodüksiyon ekibi.': 'From the stage to the pool deck, from kids’ festivals to theme nights. Five worlds, one production team.',
    '33 programın tamamını gör': 'See all 33 shows', 'Kategoriyi incele': 'Explore the category',
    'Sahne Şovları': 'Stage Shows', 'Canlı Müzik': 'Live Music', 'Tema Geceleri': 'Theme Nights', 'Pool Partiler': 'Pool Parties', 'Çocuk Dünyası': 'Kids’ World', 'Tümü': 'All',
    'Dans, akrobasi ve büyük kadrolu prodüksiyonlar.': 'Dance, acrobatics and large-cast productions.',
    'Solistlerden gruplara, akşamın her tonu.': 'From soloists to full bands — every tone of the evening.',
    'Dekoru, dansı ve müziğiyle tema geceleri.': 'Theme nights with their own décor, dance and music.',
    'Havuz başında gün boyu süren enerji.': 'All-day energy on the pool deck.',
    'Küçük misafirler için gösteri ve festival.': 'Shows and festivals for little guests.',
    // day / night
    'TESİSİNİZDE BİR GÜN': 'A DAY AT YOUR RESORT', 'ÖRNEK AKIŞ': 'SAMPLE FLOW', 'Örnek gün akışı': 'Sample day',
    '11:00 / HAVUZ BAŞI': '11:00 / POOLSIDE', '18:30 / GÜN BATIMI': '18:30 / SUNSET', '21:30 / SAHNE': '21:30 / STAGE', '22:30 / FİNAL': '22:30 / FINALE',
    'Güneşle başlar.': 'It starts with the sun.', 'Ritimle devam eder.': 'It carries on with the rhythm.',
    'Günün ışığı azalır.': 'The daylight fades.', 'Müzik yaklaşır.': 'The music draws closer.',
    'Işıklar sahnede.': 'Lights on stage.', 'Enerji herkeste.': 'Energy everywhere.',
    'Gece burada': 'The night', 'devam eder.': 'goes on here.',
    'Pink Pool Party ile havuz başında müzik, dans ve yaz enerjisi.': 'Music, dance and summer energy on the pool deck with Pink Pool Party.',
    'Quovadis ile gün batımından akşama uzanan bir canlı müzik önerisi.': 'Live music from sunset into the evening with Quovadis.',
    'Colombia Rumbera ile akşamın merkezine yerleşen renkli bir dans gösterisi.': 'Colombia Rumbera — a colourful dance show at the heart of the evening.',
    'White Party ile sahneden partiye uzanan bir final önerisi.': 'White Party — a finale that moves from the stage to the dance floor.',
    'Havuz başı': 'Poolside', 'Gün batımı': 'Sunset', 'Sahne': 'Stage', 'Final': 'Finale',
    'Örnek saatler tesisinize göre uyarlanır.': 'Sample times, tailored to your resort.',
    // services
    'HİZMETLERİMİZ': 'OUR SERVICES', 'GECE': 'NIGHT', 'Fikrinize ritim.': 'Rhythm for your idea.', 'Etkinliğinize karakter.': 'Character for your event.',
    'Oteller & Resortlar.': 'Hotels & Resorts.', 'Sezon boyunca.': 'All season long.',
    'Haftalık rotasyonla her akşam farklı bir gösteri. Dans şovları, canlı müzik, kültür geceleri ve tema partilerini tesisinizin misafir profiline ve sezonun temposuna göre bir araya getiriyoruz.': 'A different show every evening on a weekly rotation. We bring together dance shows, live music, culture nights and theme parties to suit your guests and the rhythm of the season.',
    'Dans şovları': 'Dance shows', 'Canlı müzik': 'Live music', 'Tema partileri': 'Theme parties',
    'Pool Partileri.': 'Pool Parties.', 'Gündüz programları.': 'Daytime programmes.',
    'Havuz başına hareket katan pool partileri ve gündüz etkinlikleri. Eğlenceyi tesisinizin atmosferine ve misafirlerinizin gün içindeki ritmine göre şekillendiriyoruz.': 'Pool parties and daytime events that bring the pool deck to life, shaped around your resort’s atmosphere and your guests’ day.',
    'Pool partileri': 'Pool parties', 'Gündüz etkinlikleri': 'Daytime events',
    'Kurumsal Etkinlikler.': 'Corporate Events.', 'Markanıza özel.': 'Made for your brand.',
    'Lansman, kongre ve şirket etkinlikleri için markanıza özel şovlar ve koreografiler. Etkinliğinizin mesajını sahneye taşıyan performanslar hazırlıyoruz.': 'Bespoke shows and choreography for launches, conferences and company events — performances that carry your message to the stage.',
    'Lansman': 'Launches', 'Kongre': 'Conferences', 'Şirket etkinlikleri': 'Company events',
    'Gala & Özel Geceler.': 'Galas & Special Nights.', 'Geceye özel.': 'Made for the night.',
    'Açılış performansından final gösterisine kadar, gecenin akışına göre tasarlanan sahne prodüksiyonları. Özel etkinliğinize karakter kazandıran bir gösteri programı.': 'Stage productions designed around the flow of the night, from the opening act to the finale — a programme that gives your event its character.',
    'Gala geceleri': 'Gala nights', 'Özel etkinlikler': 'Private events',
    'Teknik Prodüksiyon.': 'Technical Production.', 'Sahne arkasında.': 'Behind the scenes.',
    'Işık, ses, kostüm ve teknik ekip. Her gösterinin ihtiyaç duyduğu detayları prodüksiyonun bir parçası olarak, sahnenizin koşullarına göre planlıyoruz.': 'Lighting, sound, costumes and crew. We plan every detail a show needs as part of the production, around the conditions of your stage.',
    'Işık & ses': 'Light & sound', 'Kostüm': 'Costumes', 'Teknik ekip': 'Technical crew',
    // why
    'NEDEN ZAYA': 'WHY ZAYA', 'DÜNYADAN SAHNENİZE': 'FROM THE WORLD TO YOUR STAGE', 'Sahneniz farklı.': 'Your stage is different.', 'Programınız da öyle.': 'So is your programme.',
    'Misafir profiliniz, sahneniz ve sezonunuz. Programı bu üçüne göre kuruyor; gösteri, kostüm ve teknik ihtiyaçları birlikte planlıyoruz.': 'Your guests, your stage and your season. We build the programme around all three and plan the shows, costumes and technical needs together.',
    'Tesisinize göre program': 'A programme for your resort', 'Haftalık rotasyon, sahne ölçüsü ve misafir profiline göre seçim.': 'Selected by weekly rotation, stage size and guest profile.',
    'Tek prodüksiyon planı': 'One production plan', 'Işık, ses, kostüm ve ekip ihtiyaçları aynı akışta ele alınır.': 'Light, sound, costumes and crew handled in a single flow.',
    'katalog programı': 'catalogue shows', 'program kategorisi': 'categories', 'canlı müzik seçeneği': 'live music acts', 'sahne şovu': 'stage shows', '2027 koleksiyonundan': 'from the 2027 collection',
    // about
    'ZAYA bir kulisin içinde doğdu. Kostüm askılarının arasında, perde açılmadan önceki o birkaç saniyede. Otel sahnelerinde çok gece geçirdik ve aynı şovun bir otelde ayakta alkışlandığını, başka bir otelde yarım salona oynandığını defalarca gördük.': 'ZAYA was born backstage. Between costume rails, in the few seconds before the curtain opens. We have spent many nights on hotel stages, and time and again we watched the same show earn a standing ovation in one hotel and play to a half-empty room in another.',
    "Fark çoğu zaman şovda değildi. Doğru gecede, doğru saatte, doğru misafirin karşısına çıkıp çıkmamasındaydı. ZAYA Events'i bu yüzden kurduk. Seçtiğiniz her şovun doğru geceye denk gelmesi için.": "The difference was rarely the show. It was whether it met the right guests, on the right night, at the right hour. That is why we founded ZAYA Events. So that every show you choose lands on the right night.",
    "Sahneye çıkan ekiplerimiz farklı yerlerden geliyor. Kolombiyalı dansçılar, Kenyalı ve Etiyopyalı akrobatlar, Anadolu'nun dört bir yanından halk dansçıları, akşamı taşıyan müzisyenler. Hepsi aynı prova disipliniyle hazırlanıyor.": 'Our casts come from many places. Colombian dancers, Kenyan and Ethiopian acrobats, folk dancers from every corner of Anatolia, musicians who carry the evening. All of them are prepared with the same rehearsal discipline.',
    'Sezon başlamadan sahnenizi görmeye geliyoruz. Ölçüsünü alıyor, ışığına bakıyor, misafirinizi tanıyoruz. Sezon başladığında da ortadan kaybolmuyoruz. Bir gece bir şey aksarsa telefonu açan yine biz oluyoruz.': "Before the season starts, we come to see your stage. We measure it, look at its light and get to know your guests. And once the season begins we don't disappear. If something goes wrong one night, we are still the ones who pick up the phone.",
    'Misafir tatili unutur, o geceyi unutmaz. Biz o gece için çalışıyoruz.': 'Guests forget the holiday. They never forget that night. That night is what we work for.',
    'Sezondan önce sahnenizi yerinde görüyor, programı ölçüsüne ve misafir profilinize göre seçiyoruz.': 'Before the season we visit your stage and choose the programme for its size and your guest profile.',
    'Provadan geçmiş ekipler': 'Rehearsed casts',
    'Her ekip sahneye çıkmadan önce bizim provamızdan geçer. Ağustostaki gösteri, mayıstaki kadar temiz olur.': 'Every cast goes through our rehearsal before it goes on stage. The August show is as clean as the one in May.',
    'Sezon boyunca yanınızda': 'With you all season',
    'Hastalık, gecikme, kötü hava. Bir şey aksarsa çözümü biz buluruz, programınız boş kalmaz.': 'Illness, delays, bad weather. If something goes wrong we find the fix, and your programme never goes dark.',
    'Program kâğıt üstünde güzel görünür. Asıl sınav ağustosun ortasında, salı akşamı dokuzda başlar.': 'Every programme looks good on paper. The real test starts mid-August, on a Tuesday night at nine.',
    'İletişim kişisi': 'Contact person',
    'Türk Gecesi': 'Turkish Night', 'Türk Gecesi katalog görseli': 'Turkish Night catalogue image',
    'Oryantal ve Türk halk oyunları gösterileriyle bir Türk gecesi.': 'A Turkish night of oriental dance and Turkish folk dance shows.',
    'Sezonunuzu konuşalım.': 'Let’s talk about your season.', 'İletişime geç': 'Get in touch',
    'Her sahne başkadır.': 'Every stage is different.',
    'Doğrusunu birlikte seçelim.': 'Let’s choose the right one together.',
    'Bir şov hakkında soru, uygun tarih ya da teknik bir detay. Hangisi olursa olsun, bize yazmanız yeterli.': 'A question about a show, an available date or a technical detail. Whatever it is, just drop us a line.',
    'NASIL İLERLİYORUZ': 'HOW IT WORKS',
    'Tanışalım': 'Let’s meet',
    'Tesisinizi, sahnenizi ve misafir profilinizi dinleriz.': 'We listen to you about your resort, your stage and your guests.',
    'Size özel seçki': 'A selection for you',
    'Tesisinize uygun şovlardan kişisel bir sunum linki hazırlarız.': 'We prepare a personal presentation link with the shows that suit your resort.',
    'Seçtiğiniz şovlar için teklifi PDF olarak iletiriz.': 'We send the offer for the shows you choose as a PDF.',
    'ZAYA HAKKINDA': 'ABOUT ZAYA', 'HİKÂYEMİZ': 'OUR STORY', 'Her sahnenin': 'Every stage', 'kendi hikâyesi var.': 'has its own story.',
    'ZAYA Events bir sahne prodüksiyon şirketidir. Dünyanın dört bir yanından sanatçılarla çalışıyor; otel animasyon programlarına, kurumsal etkinliklere ve gala gecelerine özgün şovlar kazandırıyoruz.': 'ZAYA Events is a stage production company. We work with artists from all over the world to bring original shows to hotel entertainment programmes, corporate events and gala nights.',
    'Her prodüksiyonu sahnenin ölçüsüne, misafir profiline ve sezonun temposuna göre uyarlıyoruz.': 'Every production is tailored to the size of the stage, the guest profile and the pace of the season.',
    // contact
    'İLETİŞİM': 'CONTACT', 'Sahneniz için': 'For your stage,', 'bir sonraki sezon.': 'the next season.', 'Telefon': 'Phone', 'Mesaj gönderin': 'Send a message',
    // catalogue
    '33 PROGRAM / 05 KATEGORİ': '33 SHOWS / 05 CATEGORIES', 'Her sahnede': 'A different energy', 'başka bir enerji.': 'on every stage.',
    'Canlı müzikten akrobasiye, havuz başından çocuk festivallerine. Kendi programınızı keşfedin; tanıtımları burada izleyin.': 'From live music to acrobatics, from the pool deck to kids’ festivals. Discover the collection and watch the trailers here.',
    'Şovları filtrele': 'Filter shows', 'Program veya sanatçı ara': 'Search shows or artists', 'Şov koleksiyonu': 'Show collection',
    'Şovu incele': 'View show', 'Tanıtımı izle': 'Watch trailer', 'Programı incele': 'View programme', 'Konsept & detaylar': 'Concept & details',
    'Bu aramaya uygun program bulunamadı.': 'No shows match this search.', 'Tüm programları göster ↗': 'Show all ↗',
    'Yeni bir enerji keşfet': 'Discover a new energy', 'Önceki kart': 'Previous card', 'Sonraki kart': 'Next card',
    'Katalog görselleri tanıtım amaçlıdır; sahne kurulumu değişebilir.': 'Catalogue images are for presentation; stage set-ups may vary.',
    'Şov seçimi, tarih ve sahne koşullarına göre planlanır.': 'Show selection is planned around dates and stage conditions.',
    'Şovlar — ZAYA Events': 'Shows — ZAYA Events',
    // dialog (planner page)
    '2027 KATALOG GÖRSELİ': '2027 CATALOGUE IMAGE', '← Görsele dön': '← Back to image', 'Drive’da aç ↗': 'Open in Drive ↗',
    'Oynatıcı açılmazsa bağlantıyı kullanabilirsiniz.': 'If the player does not open, use the link.',
    'Program & teknik detaylar': 'Programme & technical details',
    'Tarih, gösteri içeriği ve teknik ihtiyaçlar programınıza göre birlikte netleştirilir.': 'Dates, show content and technical needs are agreed together around your programme.',
    'Şov detayını kapat': 'Close show details', 'Şovlar arasında gezin': 'Browse shows', 'Önceki şov': 'Previous show', 'Sonraki şov': 'Next show',
    // show page
    'Süre': 'Duration', 'Kadro': 'Cast', 'Tür': 'Category', 'HİKÂYE': 'THE STORY', 'En iyi olduğu anlar': 'Best moments', 'Tanıtım': 'Trailer',
    'Tanıtım videosunu oynat': 'Play the trailer', 'Konsepti incele': 'View the concept', 'Konsept dosyasını aç': 'Open the concept file',
    'Aynı sahneden': 'From the same stage,', 'diğer şovlar.': 'more shows.', 'Tüm şovlar': 'All shows', 'Önceki': 'Previous', 'Sonraki': 'Next',
    '← Sunumunuza dön': '← Back to your presentation', 'ŞOV BULUNAMADI': 'SHOW NOT FOUND', 'Bu şov kataloğumuzda yok.': 'This show is not in our catalogue.', 'Tüm şovlara dön': 'Back to all shows',
    // moments (show pages)
    'Latin gecesi': 'Latin night', 'Haftanın açılışı': 'Week opener', 'Ana sahne': 'Main stage', 'Türk gecesi': 'Turkish night', 'Kültür akşamı': 'Culture evening', 'Gala açılışı': 'Gala opening',
    'Parti öncesi': 'Pre-party', 'Genç misafir profili': 'Younger guests', 'Afrika gecesi': 'African night', 'Aile akşamı': 'Family evening', 'Hafta ortası': 'Mid-week',
    'Açık hava amfi': 'Open-air amphitheatre', 'Müzikal gecesi': 'Musical night', 'Çocuklu misafirler': 'Families with children', 'Gala gecesi': 'Gala night', 'Öne çıkan akşam': 'Signature evening',
    'Sezonun partisi': 'Party of the season', 'Havuz başı gece': 'Poolside night', 'Cumartesi': 'Saturday', 'Karma misafir profili': 'Mixed guest profile', 'Dans gecesi': 'Dance night', 'Hafta sonu': 'Weekend',
    'Görsel şölen': 'Visual feast', 'Tema gecesi': 'Theme night', 'Egzotik gece': 'Exotic night', 'Afrika haftası': 'African week', 'Gece partisi': 'Night party',
    'Türk haftası': 'Turkish week', 'Şık gece': 'Elegant night', 'Fotoğraf gecesi': 'Photo night', 'Öğleden sonra': 'Afternoon', 'Genç misafirler': 'Younger guests',
    'Aile havuzu': 'Family pool', 'Gündüz programı': 'Daytime programme', 'Yaz ortası': 'Midsummer', 'Tropikal gün': 'Tropical day', 'Mini kulüp': 'Mini club', 'Aile günü': 'Family day',
    'Çocuk festivali': 'Kids’ festival', 'Mini disko': 'Mini disco', 'Akşam öncesi': 'Early evening', 'Çocuk gösterisi': 'Kids’ show',
    'Akşam yemeği': 'Dinner', 'Canlı müzik gecesi': 'Live music night', 'Teras ve lobi': 'Terrace & lobby',
    // presentation
    'ÖZEL SUNUM': 'PRIVATE PRESENTATION', 'hazırladığımız seçki.': 'a selection made for you.', 'TEKLİF': 'OFFER', 'Talep üzerine': 'On request', 'Toplam': 'Total',
    'Teklifi PDF olarak indir': 'Download offer as PDF', 'ZAYA Events · Şov & Prodüksiyon': 'ZAYA Events · Shows & Production',
    'GÜNDÜZDEN GECEYE · ZAYA': 'FROM DAY TO NIGHT · ZAYA', 'Program taslağımı incele ↗': 'Review my programme ↗', 'Programa ekle': 'Add to programme', 'Program': 'Show', 'Kategori': 'Category', 'Fiyat': 'Price', 'Teklif': 'Offer'
  };

  const RULES = [
    [/^(\d+) program$/, (m, n) => `${n} show${n === '1' ? '' : 's'}`],
    [/^0?(\d+) program$/, (m, n) => `${n} shows`],
    [/^(\d+(?:-\d+)?) kişi$/, (m, n) => `${n} performers`],
    [/^(\d+) dk$/, (m, n) => `${n} min`],
    [/^(\d+) dakika$/, (m, n) => `${n} minutes`],
    [/^(\d\d) · (.+)$/, (m, n, cat) => `${n} · ${EN[cat] || cat}`],
    [/^(.+) — detayları incele$/, (m, t) => `${t} — view details`],
    [/^(.+) — programa ekle$/, (m, t) => `${t} — add to programme`],
    [/^(.+) — (\d+) program$/, (m, t, n) => `${EN[t] || t} — ${n} shows`],
    [/^(.+) katalog görseli$/, (m, t) => `${t} catalogue image`],
    [/^(.+) İÇİN HAZIRLANDI$/, (m, h) => `PREPARED FOR ${h}`],
    [/^(.+) için$/, (m, h) => `For ${h}:`],
    [/^(.+) için — ZAYA Events$/, (m, h) => `For ${h} — ZAYA Events`],
    [/^Hazırlanma: (.+)$/, (m, d) => `Prepared: ${d}`],
    [/^Bu teklif (.+) tarihine kadar geçerlidir\. ?(.*)$/, (m, d, rest) => `This offer is valid until ${d}.${rest ? ' ' + rest : ''}`]
  ];

  function tr2en(text) {
    const t = text.replace(/\s+/g, ' ').trim();
    if (!t) return null;
    if (EN[t]) return EN[t];
    for (const [re, fn] of RULES) { const m = t.match(re); if (m) return fn(...m); }
    return null;
  }

  const ATTRS = ['aria-label', 'placeholder', 'alt', 'title'];
  function translate(root) {
    if (lang !== 'en' || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n; while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(node => {
      if (node.parentElement?.closest('script,style,[data-no-translate]')) return;
      const out = tr2en(node.nodeValue);
      if (out !== null) {
        const lead = node.nodeValue.match(/^\s*/)[0], trail = node.nodeValue.match(/\s*$/)[0];
        node.nodeValue = lead + out + trail;
      }
    });
    const els = root.nodeType === 1 ? [root, ...root.querySelectorAll('*')] : [...root.querySelectorAll('*')];
    els.forEach(el => ATTRS.forEach(a => { const v = el.getAttribute?.(a); if (v) { const out = tr2en(v); if (out !== null) el.setAttribute(a, out); } }));
  }

  window.ZAYA_I18N = {lang, t: s => (lang === 'en' ? (tr2en(s) ?? s) : s), translate,
    date: iso => { const d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR', {day: 'numeric', month: 'long', year: 'numeric'}); }};

  function switcher() {
    const make = cls => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = cls;
      b.innerHTML = `<span${lang === 'tr' ? ' class="on"' : ''}>TR</span><span${lang === 'en' ? ' class="on"' : ''}>EN</span>`;
      b.setAttribute('aria-label', lang === 'en' ? 'Türkçe’ye geç' : 'Switch to English');
      b.addEventListener('click', () => {
        const next = lang === 'en' ? 'tr' : 'en';
        try { localStorage.setItem(KEY, next); } catch (e) {}
        const url = new URL(location.href); url.searchParams.set('lang', next); location.href = url.toString();
      });
      return b;
    };
    document.querySelector('.desktop-nav')?.after(make('lang-switch'));
    document.querySelector('.mobile-nav')?.append(make('lang-switch lang-switch-mobile'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    switcher();
    if (lang !== 'en') return;
    // Run after every other module has rendered, then keep up with later changes.
    setTimeout(() => {
      translate(document.body);
      document.title = tr2en(document.title) ?? document.title;
      new MutationObserver(list => list.forEach(m => {
        if (m.type === 'childList') m.addedNodes.forEach(node => node.nodeType === 1 ? translate(node) : node.nodeType === 3 && node.parentElement && translate(node.parentElement));
        else if (m.type === 'characterData' && m.target.parentElement) translate(m.target.parentElement);
      })).observe(document.body, {childList: true, subtree: true, characterData: true});
    }, 0);
  });
})();

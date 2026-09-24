/* Home showcase: six curated shows as an expanding strip.
   One card stays open; the others collapse to a spine. Click opens the shared dialog. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, $$, brandIcon, escapeHTML, reducedMotion, desktop} = window.ZAYA_UI;
  const strip = $('#showcase-strip');
  if (!strip) return;

  const shows = window.ZAYA_SHOWS || [];
  // The strip shows the five worlds of the collection, not single shows.
  const CATEGORIES = [
    {filter: 'stage-show', title: 'Sahne Şovları', line: 'Dans, akrobasi ve büyük kadrolu prodüksiyonlar.', cover: 'colombia-rumbera'},
    {filter: 'live-music', title: 'Canlı Müzik', line: 'Solistlerden gruplara, akşamın her tonu.', cover: 'heal-me-band'},
    {filter: 'theme-party', title: 'Tema Geceleri', line: 'Dekoru, dansı ve müziğiyle tema geceleri.', cover: 'white-party'},
    {filter: 'pool-party', title: 'Pool Partiler', line: 'Havuz başında gün boyu süren enerji.', cover: 'pink-pool-party'},
    {filter: 'kids', title: 'Çocuk Dünyası', line: 'Küçük misafirler için gösteri ve festival.', cover: 'cany-land-kids-festival'}
  ].map(c => ({...c, count: shows.filter(s => s.filter === c.filter).length, show: shows.find(s => s.id === c.cover) || shows.find(s => s.filter === c.filter)}))
   .filter(c => c.count && c.show);
  if (!CATEGORIES.length) return;

  strip.innerHTML = CATEGORIES.map((cat, index) => `
    <article class="flick-card${index === 0 ? ' is-open' : ''}" data-filter="${cat.filter}">
      <button type="button" class="flick-open" data-index="${index}" aria-expanded="${index === 0}" aria-label="${escapeHTML(cat.title)} — ${cat.count} program">
        <img class="flick-image" src="${cat.show.thumbnail || cat.show.image}" alt="" width="600" height="750" loading="lazy" decoding="async">
        <span class="flick-shade" aria-hidden="true"></span>
        <span class="flick-spine" aria-hidden="true">${escapeHTML(cat.title)}</span>
        <span class="flick-body">
          <span class="flick-category">${cat.count} program</span>
          <span class="flick-title">${escapeHTML(cat.title)}</span>
          <span class="flick-facts"><span>${escapeHTML(cat.line)}</span></span>
          <span class="flick-action">Kategoriyi incele${brandIcon('arrow')}</span>
        </span>
      </button>
    </article>`).join('');

  const cards = $$('.flick-card', strip);
  let openIndex = 0;

  const setOpen = index => {
    if (index === openIndex) return;
    openIndex = index;
    cards.forEach((card, i) => {
      card.classList.toggle('is-open', i === index);
      $('.flick-open', card).setAttribute('aria-expanded', String(i === index));
    });
  };

  cards.forEach((card, index) => {
    const trigger = $('.flick-open', card);
    // Pointer only previews; the click still opens the show.
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      card.addEventListener('pointerenter', () => setOpen(index));
    }
    trigger.addEventListener('focus', () => setOpen(index));
    trigger.addEventListener('click', () => {
      if (!desktop.matches && !card.classList.contains('is-open')) { setOpen(index); return; }
      location.href = 'sovlar.html?kategori=' + encodeURIComponent(card.dataset.filter);
    });
  });

  window.ZAYA_PROGRAM?.refreshButtons();

  // The strip slides in once, as a single group.
  if (window.gsap && window.ScrollTrigger && !reducedMotion.matches) {
    gsap.from(cards, {
      opacity: 0, y: 24, filter: 'blur(10px)', duration: .7, stagger: .05, ease: 'power3.out', clearProps: 'filter',
      scrollTrigger: {trigger: strip, start: 'top 85%', once: true}
    });
  }
});

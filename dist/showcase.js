/* Home showcase: six curated shows as an expanding strip.
   One card stays open; the others collapse to a spine. Click opens the shared dialog. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, $$, brandIcon, escapeHTML, reducedMotion, desktop} = window.ZAYA_UI;
  const strip = $('#showcase-strip');
  if (!strip) return;

  const shows = window.ZAYA_SHOWS || [];
  const PICKS = ['colombia-rumbera', 'kenyan-acrobats', 'heal-me-band', 'white-party', 'pink-pool-party', 'cany-land-kids-festival'];
  const picked = PICKS.map(id => shows.find(show => show.id === id)).filter(Boolean);
  if (!picked.length) return;

  const factsHTML = show => { const parts = [show.duration ? `${show.duration} dk` : '', show.performers ? `${escapeHTML(show.performers)} kişi` : ''].filter(Boolean); return parts.length ? parts.map(p => `<span>${p}</span>`).join('') : '<span>Konsept program</span>'; };

  strip.innerHTML = picked.map((show, index) => `
    <article class="flick-card${index === 0 ? ' is-open' : ''}" data-show="${show.id}" style="--poster-accent:${show.accent}">
      <button type="button" class="flick-open" data-index="${index}" aria-expanded="${index === 0}" aria-label="${escapeHTML(show.title)} — detayları incele">
        <img class="flick-image" src="${show.thumbnail || show.image}" alt="" width="600" height="750" loading="lazy" decoding="async">
        <span class="flick-shade" aria-hidden="true"></span>
        <span class="flick-spine" aria-hidden="true">${escapeHTML(show.title)}</span>
        <span class="flick-body">
          <span class="flick-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="flick-category">${escapeHTML(show.category)}</span>
          <span class="flick-title">${escapeHTML(show.title)}</span>
          <span class="flick-facts">${factsHTML(show)}</span>
          <span class="flick-action">${show.embedUrl ? brandIcon('play') + 'Tanıtımı izle' : 'Programı incele'}${brandIcon('arrow')}</span>
        </span>
      </button>
      <button type="button" class="flick-add" data-program-id="${show.id}" aria-pressed="false" aria-label="${escapeHTML(show.title)} — programa ekle">+</button>
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
      window.ZAYA_SHOWCASE?.open(card.dataset.show, trigger);
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

/* One show, one page: sov.html?id=<show id>. Built from ZAYA_SHOWS and ZAYA_STORIES. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, $$, escapeHTML, canAnimate} = window.ZAYA_UI;
  const root = $('#show-page');
  if (!root) return;
  const shows = window.ZAYA_SHOWS || [];
  const stories = (window.ZAYA_LANG === 'en' && window.ZAYA_STORIES_EN) || window.ZAYA_STORIES || {};
  const id = new URLSearchParams(location.search).get('id');
  const show = shows.find(s => s.id === id);

  if (!show) {
    root.innerHTML = `<section class="sp-missing"><p class="eyebrow">ŞOV BULUNAMADI</p><h1>Bu şov kataloğumuzda yok.</h1><a class="sp-back" href="sovlar.html">Tüm şovlara dön</a></section>`;
    return;
  }

  let returnTo = null;
  try { const p = sessionStorage.getItem('zaya-presentation'); if (p && p.startsWith('/')) returnTo = p; } catch (err) {}
  const story = stories[show.id] || {tagline: show.description, story: [show.description], moments: show.tags || []};
  document.title = `${show.title} — ZAYA Events`;
  const e = escapeHTML;
  const cover = (s, full) => window.ZAYA_PRESENTATION ? window.ZAYA_PRESENTATION.cover(s, full) : (full ? s.image : s.thumbnail) || s.image || '';
  const siblings = shows.filter(s => s.filter === show.filter);
  const index = siblings.indexOf(show);
  const prev = siblings[(index - 1 + siblings.length) % siblings.length];
  const next = siblings[(index + 1) % siblings.length];
  const related = siblings.filter(s => s !== show).slice(0, 3);
  const facts = [
    show.duration ? ['Süre', `${show.duration} dakika`] : null,
    show.performers ? ['Kadro', `${e(show.performers)} kişi`] : null,
    ['Tür', e(show.category)]
  ].filter(Boolean);

  root.innerHTML = `
    <section class="sp-hero">
      <div class="sp-backdrop" aria-hidden="true"><img src="${cover(show, true)}" alt=""></div>
      <div class="sp-hero-inner">
        <div class="sp-hero-copy">
          ${returnTo ? `<a class="sp-return" href="${e(returnTo)}">← Sunumunuza dön</a><br>` : ''}
          <a class="sp-crumb" href="sovlar.html">Şovlar <span aria-hidden="true">/</span> ${e(show.category)}</a>
          <h1>${e(show.title)}</h1>
          <p class="sp-tagline">${e(story.tagline)}</p>
          <dl class="sp-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
          ${show.embedUrl ? `<button type="button" class="sp-play" id="sp-play"><span aria-hidden="true">▶</span>${show.mediaType === 'pdf' ? 'Konsepti incele' : 'Tanıtımı izle'}</button>` : ''}
        </div>
        <figure class="sp-poster">${show.loop ? `<video class="sp-loop" src="${show.loop}" poster="${cover(show, true)}" autoplay muted loop playsinline preload="auto" aria-label="${e(show.title)} sahneden kesit"></video>` : `<img src="${cover(show, true)}" alt="${e(show.imageAlt || show.title)}" width="1024" height="1280">`}</figure>
      </div>
    </section>

    <section class="sp-story">
      <p class="eyebrow">HİKÂYE</p>
      ${story.story.map((p, i) => `<p class="${i === 0 ? 'sp-lead' : ''}">${e(p)}</p>`).join('')}
      <ul class="sp-moments" aria-label="En iyi olduğu anlar">${story.moments.map(m => `<li>${e(m)}</li>`).join('')}</ul>
    </section>

    ${show.rider && show.rider.length ? `<section class="sp-rider" aria-label="Kurulum">
      <p class="eyebrow">KURULUM</p>
      <div class="sp-rider-grid">${show.rider.map(g => `<div><h2>${e(g.heading === 'Kurulum' ? 'Standart kurulum' : g.heading)}</h2><ul>${g.items.map(i => `<li>${e(i)}</li>`).join('')}</ul></div>`).join('')}</div>
      ${show.riderNote ? `<p class="sp-rider-note">${e(show.riderNote)}</p>` : ''}
    </section>` : ''}

    ${show.embedUrl ? `<section class="sp-media" id="sp-media" aria-label="Tanıtım">
      <div class="sp-media-frame" id="sp-media-frame"><button type="button" class="sp-media-start" id="sp-media-start">${show.loopWide ? `<video src="${show.loopWide}" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>` : `<img src="${cover(show, true)}" alt="">`}<span><span aria-hidden="true">▶</span> ${show.mediaType === 'pdf' ? 'Konsept dosyasını aç' : 'Tanıtım videosunu oynat'}</span></button></div>
    </section>` : ''}

    ${related.length ? `<section class="sp-related">
      <div class="sp-related-top"><h2>Aynı sahneden<br><span>diğer şovlar.</span></h2><a class="sp-back" href="sovlar.html">Tüm şovlar</a></div>
      <div class="sp-related-grid">${related.map(s => `<a class="sp-card" href="sov.html?id=${s.id}"><img src="${cover(s)}" alt="" loading="lazy"><span class="sp-card-shade"></span><span class="sp-card-text"><small>${e(s.category)}</small><strong>${e(s.title)}</strong></span></a>`).join('')}</div>
    </section>` : ''}

    <nav class="sp-pager" aria-label="Şovlar arasında gezin">
      <a href="sov.html?id=${prev.id}"><small>Önceki</small>${e(prev.title)}</a>
      <a href="sov.html?id=${next.id}"><small>Sonraki</small>${e(next.title)}</a>
    </nav>`;

  // The film loads only when asked for.
  const startMedia = () => {
    const frame = $('#sp-media-frame');
    if (!frame || frame.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = show.embedUrl; iframe.title = `${show.title} tanıtımı`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture'; iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
  };
  $('#sp-media-start')?.addEventListener('click', startMedia);
  $('#sp-play')?.addEventListener('click', () => {
    startMedia();
    const media = $('#sp-media');
    window.ZAYA_UI.lenis ? window.ZAYA_UI.lenis.scrollTo(media, {offset: -90}) : media.scrollIntoView({behavior: 'smooth', block: 'start'});
  });

  if (canAnimate()) {
    gsap.from('.sp-hero-copy > *', {opacity: 0, y: 18, filter: 'blur(6px)', duration: .8, stagger: .07, ease: 'power3.out', clearProps: 'all'});
    gsap.from('.sp-poster', {opacity: 0, scale: .96, duration: 1.1, ease: 'power3.out', clearProps: 'all'});
    if (window.ScrollTrigger) $$('.sp-story > *, .sp-card').forEach(el => gsap.from(el, {opacity: 0, y: 20, duration: .7, ease: 'power3.out', scrollTrigger: {trigger: el, start: 'top 90%', once: true}}));
  }
});

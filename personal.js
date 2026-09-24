/* Home page, opened from a personal link: greet the hotel, show its selection and the quote. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const P = window.ZAYA_PRESENTATION;
  const {$, escapeHTML: e, canAnimate} = window.ZAYA_UI;
  const code = new URLSearchParams(location.search).get('p');
  if (!P || !code) return;
  const data = P.decode(code);
  if (!data || !data.s.length) return;

  // Show pages offer a way back to this presentation.
  try { sessionStorage.setItem('zaya-presentation', location.pathname + location.search); } catch (err) {}

  const shows = window.ZAYA_SHOWS || [];
  const picked = data.s.map(([id, price]) => ({show: shows.find(s => s.id === id), price})).filter(x => x.show);
  const priced = picked.filter(x => x.price !== null && x.price !== '' && x.price !== undefined);
  const hasQuote = priced.length > 0;
  const sum = priced.reduce((a, x) => a + Number(x.price || 0), 0);
  const total = data.t !== null && data.t !== undefined && data.t !== '' ? Number(data.t) : sum;

  document.title = `${data.h} için — ZAYA Events`;
  const eyebrow = $('.hero-eyebrow');
  if (eyebrow) eyebrow.textContent = window.ZAYA_LANG === 'en' ? `PREPARED FOR ${data.h.toLocaleUpperCase('en-GB')}` : `${data.h.toLocaleUpperCase('tr-TR')} İÇİN HAZIRLANDI`;

  const section = document.createElement('section');
  section.className = 'personal';
  section.id = 'sunum';
  section.setAttribute('aria-labelledby', 'personal-title');
  section.innerHTML = `
    <div class="personal-top">
      <p class="eyebrow">ÖZEL SUNUM</p>
      <h2 id="personal-title">${e(data.h)} için<br><span>hazırladığımız seçki.</span></h2>
      ${data.n ? `<p class="personal-note">${e(data.n)}</p>` : ''}
    </div>
    <div class="personal-grid">
      ${picked.map(({show, price}, i) => `
        <a class="personal-card" href="sov.html?id=${show.id}">
          <img src="${P.cover(show)}" alt="" loading="lazy">
          <span class="personal-shade"></span>
          <span class="personal-text">
            <small>${String(i + 1).padStart(2, '0')} · ${e(show.category)}</small>
            <strong>${e(show.title)}</strong>
            ${price !== null && price !== '' && price !== undefined ? `<em>${P.money(price, data.c)}</em>` : ''}
          </span>
        </a>`).join('')}
    </div>
    ${hasQuote ? `
    <div class="personal-quote">
      <div class="quote-head"><p class="eyebrow">TEKLİF</p>${data.d ? `<span>Hazırlanma: ${P.niceDate(data.d)}</span>` : ''}</div>
      <ul>
        ${picked.map(({show, price}) => `<li><span>${e(show.title)}</span><span>${price !== null && price !== '' && price !== undefined ? P.money(price, data.c) : 'Talep üzerine'}</span></li>`).join('')}
      </ul>
      ${data.g ? `<div class="quote-total"><span>Toplam</span><strong>${P.money(total, data.c)}</strong></div>` : ''}
      <p class="quote-terms">${data.v ? `Bu teklif ${P.niceDate(data.v)} tarihine kadar geçerlidir. ` : ''}${data.k ? e(data.k) : ''}</p>
      <button type="button" class="quote-pdf" id="quote-pdf">Teklifi PDF olarak indir</button>
    </div>` : ''}`;

  const hero = $('.hero');
  hero?.after(section);

  // Printable A4 offer: the browser's "Save as PDF" keeps text sharp and needs no library.
  if (hasQuote) {
    const doc = document.createElement('div');
    doc.className = 'print-quote';
    doc.setAttribute('aria-hidden', 'true');
    doc.innerHTML = `
      <header><div class="pq-mark">ZAYA<span>EVENTS</span></div><div class="pq-meta"><strong>Teklif</strong>${data.d ? `<span>${P.niceDate(data.d)}</span>` : ''}</div></header>
      <h1>${e(data.h)}</h1>
      ${data.n ? `<p class="pq-note">${e(data.n)}</p>` : ''}
      <table>
        <thead><tr><th>Program</th><th>Kategori</th><th>Süre</th><th>Fiyat</th></tr></thead>
        <tbody>${picked.map(({show, price}) => `<tr><td>${e(show.title)}</td><td>${e(show.category)}</td><td>${show.duration ? show.duration + ' dk' : '—'}</td><td>${price !== null && price !== '' && price !== undefined ? P.money(price, data.c) : 'Talep üzerine'}</td></tr>`).join('')}</tbody>
        ${data.g ? `<tfoot><tr><td colspan="3">Toplam</td><td>${P.money(total, data.c)}</td></tr></tfoot>` : ''}
      </table>
      <p class="pq-terms">${data.v ? `Bu teklif ${P.niceDate(data.v)} tarihine kadar geçerlidir. ` : ''}${data.k ? e(data.k) : ''}</p>
      <footer><span>ZAYA Events · Şov &amp; Prodüksiyon</span><span>+90 532 283 40 79</span></footer>`;
    document.body.append(doc);
    $('#quote-pdf')?.addEventListener('click', () => {
      const previous = document.title;
      document.title = `ZAYA Events Teklif — ${data.h}`; // becomes the PDF file name
      window.print();
      setTimeout(() => { document.title = previous; }, 1000);
    });
  }

  if (canAnimate() && window.ScrollTrigger) {
    gsap.from(section.querySelectorAll('.personal-top > *, .personal-card, .personal-quote'), {
      opacity: 0, y: 22, filter: 'blur(6px)', duration: .8, stagger: .06, ease: 'power3.out', clearProps: 'all',
      scrollTrigger: {trigger: section, start: 'top 80%', once: true}
    });
  }
});

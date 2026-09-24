/* Personal presentations live entirely in the link: ?p=<base64url JSON>.
   Shape: {h: hotel, n: note, c: currency, v: valid-until (YYYY-MM-DD), d: prepared (YYYY-MM-DD),
           t: package total or null, k: quote terms, s: [[showId, price|null], ...]} */
(function () {
  'use strict';
  const toBase64Url = text => btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fromBase64Url = code => decodeURIComponent(escape(atob(code.replace(/-/g, '+').replace(/_/g, '/'))));

  // Shows travel by id (never by position: the catalogue changes season to season).
  const ids = () => (window.ZAYA_SHOWS || []).map(s => s.id);
  function encode(data) {
    const compact = Object.assign({}, data, {s: data.s.map(([id, price]) => price === null || price === undefined || price === '' ? id : [id, price])});
    Object.keys(compact).forEach(k => { if (compact[k] === '' || compact[k] === null) delete compact[k]; });
    return toBase64Url(JSON.stringify(compact));
  }

  function decode(code) {
    try {
      const data = JSON.parse(fromBase64Url(code));
      if (!data || typeof data.h !== 'string' || !Array.isArray(data.s)) return null;
      const list = ids();
      data.s = data.s.map(item => {
        const [ref, price] = Array.isArray(item) ? item : [item, null];
        const id = typeof ref === 'number' ? list[ref] : ref;
        return list.includes(id) ? [id, price ?? null] : null;
      }).filter(Boolean);
      data.g = !!data.g;
      ['n', 'c', 'v', 'd', 'k'].forEach(k => { if (data[k] === undefined) data[k] = ''; });
      if (data.t === undefined) data.t = null;
      return data;
    } catch (e) { return null; }
  }

  const CURRENCY = {EUR: '€', TRY: '₺', USD: '$', GBP: '£'};
  function money(value, currency) {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (!isFinite(n)) return '';
    return (CURRENCY[currency] || '') + n.toLocaleString('tr-TR', {maximumFractionDigits: 0});
  }
  function niceDate(iso) {
    if (!iso) return '';
    if (window.ZAYA_I18N) return window.ZAYA_I18N.date(iso);
    const d = new Date(iso + 'T12:00:00');
    return isNaN(d) ? '' : d.toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'});
  }

  function linkFor(data, base) {
    const url = new URL('index.html', base || location.href);
    url.search = '?p=' + encode(data);
    return url.toString();
  }

  // Shows without artwork get a quiet typographic cover instead of a broken image.
  function cover(show, full) {
    const src = full ? (show.image || show.thumbnail) : (show.thumbnail || show.image);
    if (src) return src;
    const words = String(show.title).split(/\s+/);
    const lines = words.map((w, i) => `<text x="40" y="${560 + i * 76 - (words.length - 1) * 76}" font-family="-apple-system,Helvetica,Arial" font-size="68" font-weight="700" letter-spacing="-3" fill="#f5f5f7">${w.replace(/[<&>]/g, '')}</text>`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750"><rect width="600" height="750" fill="#1d1d1f"/><circle cx="470" cy="160" r="220" fill="#E11D2E" opacity=".18"/>${lines}<text x="40" y="690" font-family="-apple-system,Helvetica,Arial" font-size="18" font-weight="600" letter-spacing="3" fill="#86868b">ZAYA EVENTS</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  window.ZAYA_PRESENTATION = {encode, decode, money, niceDate, linkFor, cover, CURRENCY};
})();

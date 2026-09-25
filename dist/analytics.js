/* Visit counter (GoatCounter). Off until STATS_CODE is filled in.
   Presentation links are counted as "sunum/<hotel>", show pages as "sov/<id>". */
(function () {
  'use strict';
  const STATS_CODE = ''; // e.g. 'zayaevents' → https://zayaevents.goatcounter.com
  if (!STATS_CODE || /sunum-hazirla/.test(location.pathname)) return;
  const slug = s => String(s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function pathAndTitle() {
    const q = new URLSearchParams(location.search);
    if (q.get('p') && window.ZAYA_PRESENTATION) {
      try { const d = window.ZAYA_PRESENTATION.decode(q.get('p')); if (d && d.h) return {path: 'sunum/' + slug(d.h), title: 'Sunum: ' + d.h}; } catch (e) {}
    }
    if (/sov\.html$/.test(location.pathname) && q.get('id')) return {path: 'sov/' + q.get('id'), title: document.title};
    return {path: location.pathname.replace(/^.*\//, '/') || '/', title: document.title};
  }
  window.goatcounter = {no_onload: true};
  const s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = 'https://' + STATS_CODE + '.goatcounter.com/count';
  s.onload = () => { const pt = pathAndTitle(); window.goatcounter.count({path: pt.path, title: pt.title}); };
  window.addEventListener('load', () => document.head.append(s));
})();

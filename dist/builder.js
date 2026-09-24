/* Presentation builder (sunum-hazirla.html) — for ZAYA only; not linked from the site.
   Pick a hotel, shows, optional prices → copy a personal link. Saved drafts stay on this computer. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const P = window.ZAYA_PRESENTATION;
  const {$, $$, escapeHTML: e} = window.ZAYA_UI;
  const shows = window.ZAYA_SHOWS || [];
  const KEY = 'zaya-presentations-v1';
  const today = () => new Date().toISOString().slice(0, 10);
  const plusDays = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

  const PRESETS = {
    'Aile oteli': ['kenyan-acrobats', 'alice-wonderland', 'kids-show-madagascar', 'duck-pool-party', 'turkish-folk-dance', 'cany-land-kids-festival'],
    'Yetişkin oteli': ['colombia-rumbera', 'white-party', 'heal-me-band', 'fresno-dance-show', 'retro-party', 'quovadis'],
    'Butik otel': ['quovadis', 'fevzi-burcak', 'asli-kurnaz', 'turkish-folk-dance', 'cappadocia-party'],
    'Büyük resort': ['colombia-rumbera', 'ethiopian-acrobats', 'african-warriors', 'white-party', 'pink-pool-party', 'drifters', 'pia']
  };

  // state: ordered selection with optional prices
  let state = {h: '', l: 'tr', n: '', c: 'EUR', v: plusDays(30), t: '', k: '', g: false, s: []};
  let editingId = null;

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (err) { return []; } };
  const store = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (err) {} };

  // ---------- picker ----------
  const picker = $('#b-picker');
  picker.innerHTML = shows.map(s => `
    <button type="button" class="b-show" data-id="${s.id}" aria-pressed="false">
      <img src="${P.cover(s)}" alt="" loading="lazy">
      <span><small>${e(s.category)}</small>${e(s.title)}</span>
      <i aria-hidden="true"></i>
    </button>`).join('');
  picker.addEventListener('click', ev => {
    const btn = ev.target.closest('.b-show'); if (!btn) return;
    const id = btn.dataset.id;
    const at = state.s.findIndex(x => x[0] === id);
    if (at >= 0) state.s.splice(at, 1); else state.s.push([id, null]);
    render();
  });

  // ---------- selected list with prices and ordering ----------
  const list = $('#b-selected');
  list.addEventListener('input', ev => {
    const input = ev.target.closest('[data-price]'); if (!input) return;
    const item = state.s.find(x => x[0] === input.dataset.price);
    item[1] = input.value === '' ? null : Number(input.value);
    renderTotals(); invalidate();
  });
  list.addEventListener('click', ev => {
    const btn = ev.target.closest('[data-move],[data-remove]'); if (!btn) return;
    const id = btn.dataset.move || btn.dataset.remove;
    const i = state.s.findIndex(x => x[0] === id);
    if (btn.dataset.remove) state.s.splice(i, 1);
    else {
      const j = i + Number(btn.dataset.dir);
      if (j < 0 || j >= state.s.length) return;
      [state.s[i], state.s[j]] = [state.s[j], state.s[i]];
    }
    render();
  });

  // ---------- fields ----------
  const fields = {h: '#b-hotel', l: '#b-lang', n: '#b-note', c: '#b-currency', v: '#b-valid', t: '#b-total', k: '#b-terms'};
  Object.entries(fields).forEach(([key, sel]) => $(sel).addEventListener('input', () => {
    state[key] = key === 't' ? ($(sel).value === '' ? '' : Number($(sel).value)) : $(sel).value;
    if (key === 'c') render(); else { renderTotals(); invalidate(); }
  }));

  $('#b-showtotal').addEventListener('change', ev => { state.g = ev.target.checked; $('#b-total-wrap').hidden = !state.g; invalidate(); });
  $$('[data-preset]').forEach(b => b.addEventListener('click', () => {
    state.s = PRESETS[b.dataset.preset].filter(id => shows.some(s => s.id === id)).map(id => [id, null]);
    render();
  }));
  $('#b-clear').addEventListener('click', () => { state.s = []; render(); });

  function renderTotals() {
    const sum = state.s.reduce((a, x) => a + (x[1] ? Number(x[1]) : 0), 0);
    $('#b-sum').textContent = sum ? P.money(sum, state.c) : '—';
    $('#b-total').placeholder = sum ? String(sum) : 'Toplam (isteğe bağlı)';
  }

  function render() {
    const chosen = new Set(state.s.map(x => x[0]));
    $$('.b-show', picker).forEach(b => {
      const on = chosen.has(b.dataset.id);
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('i').textContent = on ? String(state.s.findIndex(x => x[0] === b.dataset.id) + 1) : '';
    });
    list.innerHTML = state.s.length ? state.s.map(([id, price], i) => {
      const s = shows.find(x => x.id === id);
      return `<li>
        <span class="b-order">${String(i + 1).padStart(2, '0')}</span>
        <img src="${P.cover(s)}" alt="">
        <strong>${e(s.title)}</strong>
        <label class="b-price"><span>${P.CURRENCY[state.c]}</span><input type="number" min="0" step="50" inputmode="numeric" placeholder="Fiyat" value="${price ?? ''}" data-price="${id}" aria-label="${e(s.title)} fiyatı"></label>
        <span class="b-move"><button type="button" data-move="${id}" data-dir="-1" aria-label="Yukarı">↑</button><button type="button" data-move="${id}" data-dir="1" aria-label="Aşağı">↓</button></span>
        <button type="button" class="b-remove" data-remove="${id}" aria-label="${e(s.title)} çıkar">×</button>
      </li>`;
    }).join('') : '<li class="b-empty">Soldan şov seçin ya da hazır bir seçkiyle başlayın.</li>';
    $('#b-count').textContent = state.s.length ? `${state.s.length} şov` : '';
    renderTotals(); invalidate();
  }

  // ---------- output ----------
  const out = $('#b-link'), status = $('#b-status');
  function invalidate() { out.value = ''; status.textContent = ''; $('#b-open').hidden = true; }
  function payload() {
    return {h: state.h.trim(), l: state.l === 'en' ? 'en' : '', n: state.n.trim(), c: state.c, v: state.v || '', d: today(), t: state.g && state.t !== '' ? state.t : null, g: state.g ? 1 : '', k: state.k.trim(), s: state.s};
  }
  $('#b-make').addEventListener('click', async () => {
    if (!state.h.trim()) { status.textContent = 'Önce otel adını yazın.'; $('#b-hotel').focus(); return; }
    if (!state.s.length) { status.textContent = 'En az bir şov seçin.'; return; }
    const data = payload();
    const url = P.linkFor(data);
    out.value = url; $('#b-open').href = url; $('#b-open').hidden = false;
    // save / update draft
    const saved = load();
    const entry = {id: editingId || String(Date.now()), savedAt: new Date().toISOString(), data};
    const at = saved.findIndex(x => x.id === entry.id);
    if (at >= 0) saved[at] = entry; else saved.unshift(entry);
    store(saved); editingId = entry.id; renderSaved();
    try { await navigator.clipboard.writeText(url); status.textContent = 'Link kopyalandı. WhatsApp ya da e-postaya yapıştırabilirsiniz.'; }
    catch (err) { out.select(); status.textContent = 'Link hazır — seçili, kopyalayabilirsiniz.'; }
  });
  $('#b-new').addEventListener('click', () => { editingId = null; state = {h: '', l: state.l, n: '', c: 'EUR', v: plusDays(30), t: '', k: state.k, g: false, s: []}; fill(); render(); $('#b-hotel').focus(); });

  function fill() {
    $('#b-hotel').value = state.h; $('#b-lang').value = state.l || 'tr'; $('#b-note').value = state.n; $('#b-currency').value = state.c;
    $('#b-valid').value = state.v; $('#b-total').value = state.t ?? ''; $('#b-terms').value = state.k || ''; $('#b-showtotal').checked = !!state.g; $('#b-total-wrap').hidden = !state.g;
  }

  // ---------- saved presentations ----------
  const savedEl = $('#b-saved');
  function renderSaved() {
    const saved = load();
    savedEl.innerHTML = saved.length ? saved.map(x => `
      <li>
        <div><strong>${e(x.data.h)}</strong><small>${x.data.l === 'en' ? 'EN · ' : ''}${x.data.s.length} şov · ${new Date(x.savedAt).toLocaleDateString('tr-TR')}</small></div>
        <button type="button" data-edit="${x.id}">Düzenle</button>
        <button type="button" data-copy="${x.id}">Kopya oluştur</button>
        <button type="button" data-link="${x.id}">Linki kopyala</button>
        <button type="button" data-del="${x.id}" aria-label="Sil">×</button>
      </li>`).join('') : '<li class="b-empty">Henüz kayıtlı sunum yok.</li>';
  }
  savedEl.addEventListener('click', async ev => {
    const btn = ev.target.closest('button'); if (!btn) return;
    const saved = load();
    const id = btn.dataset.edit || btn.dataset.copy || btn.dataset.link || btn.dataset.del;
    const entry = saved.find(x => x.id === id); if (!entry) return;
    if (btn.dataset.del) { if (confirm(`${entry.data.h} sunumu silinsin mi?`)) { store(saved.filter(x => x.id !== id)); renderSaved(); } return; }
    if (btn.dataset.link) { try { await navigator.clipboard.writeText(P.linkFor(entry.data)); btn.textContent = 'Kopyalandı ✓'; setTimeout(() => btn.textContent = 'Linki kopyala', 1600); } catch (err) {} return; }
    state = {h: entry.data.h, l: entry.data.l || 'tr', n: entry.data.n || '', c: entry.data.c || 'EUR', v: entry.data.v || plusDays(30), t: entry.data.t ?? '', k: entry.data.k || '', g: !!entry.data.g, s: entry.data.s.map(x => [...x])};
    if (btn.dataset.copy) { editingId = null; state.h = ''; } else editingId = id;
    fill(); render(); window.scrollTo({top: 0, behavior: 'smooth'}); $('#b-hotel').focus();
  });

  fill(); render(); renderSaved();
});

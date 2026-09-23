document.addEventListener('DOMContentLoaded',()=>{
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const model=window.ZAYA_PROGRAM_MODEL, catalogue=window.ZAYA_SHOWS, byId=new Map(catalogue.map(s=>[s.id,s]));
  const key='zaya-program-v1'; let saved=[];
  try{const data=JSON.parse(localStorage.getItem(key)||'null');if(data?.version===1&&Array.isArray(data.items))saved=data.items;}catch{}
  const store=model.create(catalogue,saved);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const form=$('#talep'), result=$('.brief-result'), planner=$('#program-items');
  let saveWorks=true;
  function save(){try{localStorage.setItem(key,JSON.stringify({version:1,items:store.items()}));saveWorks=true;}catch{saveWorks=false;}}
  function invalidate(){if(!result)return;result.hidden=true;$('#brief-whatsapp').removeAttribute('href');$('#brief-output').value='';$('#copy-status').textContent='';}
  function updateButtons(){
    $$('[data-program-id]').forEach(button=>{
      const id=button.dataset.programId, selected=store.has(id), show=byId.get(id);
      button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));
      button.setAttribute('aria-label',`${show?.title||'Program'} — ${selected?'programdan çıkar':'programa ekle'}`);
      if(button.classList.contains('card-add')||button.classList.contains('flick-add'))button.innerHTML=selected?'✓':'+';
      else button.innerHTML=`<span>${selected?'Programdan çıkar':'Programa ekle'}</span><span aria-hidden="true">${selected?'✓':'+'}</span>`;
    });
    $$('[data-add-week]').forEach(b=>{const ready=model.WEEK.every(s=>store.items().some(item=>item.id===s.id&&item.day));b.disabled=ready;b.innerHTML=ready?'Hafta taslağınızda ✓':'Bu haftayı taslağa ekle <span aria-hidden="true">＋</span>';});
    $$('[data-add-package]').forEach(b=>{const bundle=model.PACKAGES.find(p=>p.id===b.dataset.addPackage);const ready=bundle.ids.every(id=>store.items().some(item=>item.id===id&&item.concepts.includes(bundle.id)));b.disabled=ready;b.innerHTML=ready?'Seçki taslağınızda ✓':'Seçkiyi taslağa ekle <span aria-hidden="true">＋</span>';});
    $$('.show-card').forEach(card=>card.classList.toggle('has-selection',store.has(card.dataset.show)));
  }
  function render(){
    const items=store.ordered();
    if(planner) $('#program-items').innerHTML=items.map((item,index)=>{const show=byId.get(item.id);return `<li class="program-item" data-id="${item.id}"><span class="program-index">${String(index+1).padStart(2,'0')}</span>${show.thumbnail?`<img src="${show.thumbnail}" alt="" width="48" height="62" loading="lazy">`:'<span class="program-monogram" aria-hidden="true">Z</span>'}<div class="program-item-name"><strong>${esc(show.title)}</strong><span>${esc(show.category)}${show.duration?' · '+show.duration+' dk':''}${item.concepts.length?' · '+item.concepts.map(id=>model.PACKAGES.find(p=>p.id===id).title).join(', '):''}</span></div><label class="program-day"><span class="sr-only">${esc(show.title)} için gün</span><select data-day-id="${item.id}" aria-label="${esc(show.title)} için gün"><option value="">Gün seçin</option>${model.DAYS.map(day=>`<option${day===item.day?' selected':''}>${day}</option>`).join('')}</select></label><button class="program-remove" data-remove-id="${item.id}" type="button" aria-label="${esc(show.title)} programdan çıkar">×</button></li>`;}).join('');
    if(planner){
      $('#program-empty').hidden=items.length>0;$('#program-clear').hidden=!items.length;
      $('#program-selection-summary').textContent=items.length?`${items.length} program seçildi`:'Henüz seçim yapmadınız';
      $('#program-storage-note').textContent=saveWorks?'Seçimleriniz bu cihazda saklanır.':'Seçimleriniz bu sekme açık kaldığı sürece korunur.';
    }
    $$('[data-program-count]').forEach(el=>el.textContent=String(items.length));
    const dock=$('#program-dock');if(dock)dock.hidden=!items.length;
    document.body.classList.toggle('has-program',items.length>0);
    updateButtons();window.ScrollTrigger?.refresh();
  }
  function changed(message){save();invalidate();render();const status=$('#program-status');if(status)status.textContent=message;const dialogStatus=$('#dialog-program-status');if(dialogStatus)dialogStatus.textContent=message;document.dispatchEvent(new CustomEvent('zaya:program-change'));}
  function toggle(id){if(!byId.has(id))return;const title=byId.get(id).title;if(store.has(id)){store.remove(id);changed(title+' taslaktan çıkarıldı.');}else{store.add([{id}]);changed(title+' program taslağınıza eklendi.');}}
  window.ZAYA_PROGRAM={has:store.has,toggle,refreshButtons:updateButtons};
  document.addEventListener('click',e=>{
    const add=e.target.closest('[data-program-id]');if(add){toggle(add.dataset.programId);return;}
    const week=e.target.closest('[data-add-week]');if(week){const count=store.add(model.WEEK);changed(`${count} yeni program eklendi. Mevcut gün seçimleriniz korundu.`);return;}
    const bundle=e.target.closest('[data-add-package]');if(bundle){const p=model.PACKAGES.find(p=>p.id===bundle.dataset.addPackage);const count=store.add(p.ids.map(id=>({id,concepts:[p.id]})));changed(`${p.title}: ${count} yeni program taslağa eklendi.`);return;}
    const remove=e.target.closest('[data-remove-id]');if(remove){const all=store.ordered(),index=all.findIndex(s=>s.id===remove.dataset.removeId);toggle(remove.dataset.removeId);const buttons=$$('[data-remove-id]');(buttons[Math.min(index,buttons.length-1)]||$('#program-empty a'))?.focus({preventScroll:true});}
  });
  planner?.addEventListener('change',e=>{const id=e.target.dataset.dayId;if(!id)return;const day=e.target.value;store.setDay(id,day);changed(`${byId.get(id).title}: ${day||'gün henüz seçilmedi'}.`);$(`[data-day-id="${id}"]`).focus({preventScroll:true});});
  $('#program-clear')?.addEventListener('click',()=>{store.clear();changed('Program taslağı temizlendi.');$('#program-empty a')?.focus({preventScroll:true});});
  form?.addEventListener('input',e=>{if(!e.target.closest('#program-items'))invalidate();});
  form?.addEventListener('change',e=>{if(!e.target.closest('#program-items'))invalidate();});
  form?.addEventListener('submit',e=>{
    e.preventDefault();const data=new FormData(form);
    const text=model.message({items:store.ordered(),catalogue,venue:data.get('venue'),date:data.get('date'),note:data.get('note'),kind:data.get('program')});
    $('#brief-output').value=text;$('#brief-whatsapp').href='https://wa.me/905322834079?text='+encodeURIComponent(text);
    result.hidden=false;$('#copy-status').textContent='';$('#brief-output').focus({preventScroll:true});result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});window.ScrollTrigger?.refresh();
  });
  if(form) new IntersectionObserver(([entry])=>document.body.classList.toggle('at-planner',entry.isIntersecting),{threshold:0}).observe(form);
  $('.copy-brief')?.addEventListener('click', async () => {
    try {await navigator.clipboard.writeText($('#brief-output').value); $('#copy-status').textContent='Talep metni kopyalandı.';}
    catch {$('#brief-output').focus(); $('#brief-output').select(); $('#copy-status').textContent='Metni seçip cihazınızın kopyala komutunu kullanabilirsiniz.';}
  });
  render();
});

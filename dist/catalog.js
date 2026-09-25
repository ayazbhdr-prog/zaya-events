/* Show catalogue and the shared show dialog. Pages without #show-list only get the dialog. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, $$, brandIcon, escapeHTML, reducedMotion, desktop, canAnimate} = window.ZAYA_UI;
  // Cards keep the same media surface when expanding into show details.
  const shows = window.ZAYA_SHOWS || [], list = $('#show-list'), dialog = $('#show-dialog');
  if(!dialog) return;
  const hasCatalog = !!list;
  let visibleShows = shows, carouselIndex = 0, embla = null, activeFilter = 'stage-show';
  const searchInput = $('#catalog-search');
  const normalize = text => text.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i');
  const placeDialogAction = () => {
    const actions = $('.dialog-actions');
    (desktop.matches ? $('.dialog-copy') : actions).append($('#select-show'));
    actions.hidden = desktop.matches;
  };
  placeDialogAction();
  desktop.addEventListener('change', () => {if(dialogClosing && pendingDialogFinish) pendingDialogFinish(); else resetDialogMotion();placeDialogAction();});
  let dialogShows = [];
  let selectedShow = null, lastTrigger = null, dialogTimeline = null, dialogClosing = false, pendingDialogFinish = null;
  const posterHTML = (show, full = false) => {
    const style = `--poster-accent:${show.accent}`;
    if(show.image) return `<span class="poster-surface art-photo" style="${style}"><img class="poster-photo" src="${full?show.image:show.thumbnail}" alt="" width="600" height="750" loading="${full?'eager':'lazy'}"></span>`;
    return `<span class="poster-surface art-orbit" style="${style}"><span class="poster-lines">${Array.from({length:7},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</span><span class="type-cover">SONAY<br>ÖZDEMİR<span>LIVE PERFORMANCE</span></span><span class="poster-wordmark">ZAYA · 2027 COLLECTION</span></span>`;
  };
  // Rack focus: things arrive out of focus and sharpen. Lighter on small screens.
  const BLUR = () => desktop.matches ? 'blur(10px)' : 'blur(5px)';
  // One pending exit at a time; when it finishes it shows whatever filter is selected *now*.
  let exitTween = null;
  const pressedFilter = () => $('.catalog-filters button[aria-pressed="true"]')?.dataset.filter || 'all';
  const cancelExit = () => { exitTween?.kill(); exitTween = null; };
  const SHARP = 'blur(0px)';
  const factsHTML = show => { const parts = [show.duration ? `${show.duration} dk` : '', show.performers ? `${escapeHTML(show.performers)} kişi` : ''].filter(Boolean); return parts.length ? parts.map(p => `<span>${p}</span>`).join('') : '<span>Konsept program</span>'; };
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      cardObserver.unobserve(entry.target);
      if(canAnimate()) gsap.to(entry.target,{opacity:1,y:0,filter:SHARP,duration:.7,delay:Number(entry.target.dataset.order)%3*.06,ease:'power3.out',clearProps:'opacity,transform,filter'});
      else {entry.target.style.opacity='';entry.target.style.transform='';}
    });
  },{rootMargin:'0px 0px 30px 0px',threshold:.08});

  const renderShows = (filter, filtering = false) => {
    if(!hasCatalog) return;
    embla?.destroy();embla=null;$('.catalog-viewport').classList.remove('is-enhanced');
    cardObserver.disconnect();
    if(window.gsap) gsap.killTweensOf(list.children);
    activeFilter=filter;
    const query=normalize(searchInput.value.trim());
    const visible = shows.filter(show => (filter === 'all' || show.filter === filter) && (!query || normalize(show.title+' '+show.category).includes(query)));
    $('.catalog-empty').hidden=visible.length>0;
    $('.catalog-pager').hidden=visible.length===0;
    visibleShows=visible;carouselIndex=0;
    list.replaceChildren();
    visible.forEach((show,index) => {
      const button=document.createElement('article');button.className='show-card';button.dataset.show=show.id;button.dataset.order=String(index);
      button.style.setProperty('--poster-accent',show.accent);

      button.innerHTML=`<button type="button" class="show-details" aria-haspopup="dialog" aria-label="${escapeHTML(show.title)} — detayları incele"><span class="card-art" aria-hidden="true">${posterHTML(show)}</span><span class="card-shade" aria-hidden="true"></span><span class="card-topline"><span class="card-number">${String(shows.indexOf(show)+1).padStart(2,'0')}</span><span class="card-category">${escapeHTML(show.category)}</span></span><span class="card-caption"><span class="card-title">${escapeHTML(show.title)}</span><span class="card-facts">${factsHTML(show)}</span><span class="card-action"><span>${show.mediaType==='video'?brandIcon('play')+'Şovu incele':show.mediaType==='pdf'?'Konsept & detaylar':'Programı incele'}</span>${brandIcon('arrow')}</span></span></button><button type="button" class="card-add" data-program-id="${show.id}" aria-pressed="false" aria-label="${escapeHTML(show.title)} — programa ekle">+</button>`;
      $('.show-details',button).addEventListener('click',()=>{location.href='sov.html?id='+encodeURIComponent(show.id);});list.append(button);
      if(canAnimate() && desktop.matches) {
        gsap.set(button,{opacity:0,y:filtering?8:28,filter:BLUR()});
        if(filtering) gsap.to(button,{opacity:1,y:0,filter:SHARP,duration:.38,delay:Math.min(index,3)*.045,ease:'power2.out',clearProps:'opacity,transform,filter'});
        else cardObserver.observe(button);
      }
    });
    window.ZAYA_PROGRAM?.refreshButtons();
    $('.catalog-count').textContent=`${String(visible.length).padStart(2,'0')} program`;
    list.scrollLeft=0;setupCarousel();updateCarousel();
    window.ScrollTrigger?.refresh();
  };
  if(hasCatalog) $$('.catalog-filters button').forEach(button=>button.addEventListener('click',()=>{
    if(button.getAttribute('aria-pressed')==='true') return;
    $$('.catalog-filters button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    searchInput.value='';
    cancelExit();
    const outgoing=[...list.children];
    if(canAnimate() && desktop.matches && outgoing.length) {
      gsap.killTweensOf(outgoing);
      exitTween=gsap.to(outgoing,{opacity:0,filter:BLUR(),y:-6,duration:.18,stagger:.015,ease:'power1.in',onComplete:()=>{exitTween=null;renderShows(pressedFilter(),true);}});
    } else renderShows(button.dataset.filter,true);
  }));
  // Segmented control: a white pill slides under the selected filter.
  const filterBar=$('.catalog-filters');
  if(hasCatalog && filterBar) {
    const indicator=document.createElement('span');
    indicator.className='filter-indicator';indicator.setAttribute('aria-hidden','true');
    filterBar.append(indicator);
    const placeIndicator=(animate)=>{
      const active=$('button[aria-pressed="true"]',filterBar);
      if(!active) return;
      const to={x:active.offsetLeft,width:active.offsetWidth};
      if(animate && canAnimate()) gsap.to(indicator,{...to,duration:.55,ease:'expo.out',overwrite:true});
      else if(window.gsap) gsap.set(indicator,to);
      else {indicator.style.transform=`translateX(${to.x}px)`;indicator.style.width=to.width+'px';}
    };
    new MutationObserver(()=>placeIndicator(true)).observe(filterBar,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
    placeIndicator(false);
    document.fonts?.ready.then(()=>placeIndicator(false));
    window.addEventListener('resize',()=>placeIndicator(false),{passive:true});
    // Late font/layout changes resize the buttons: keep the pill glued to the active one.
    if(window.ResizeObserver) new ResizeObserver(()=>placeIndicator(false)).observe(filterBar);
    window.addEventListener('load',()=>placeIndicator(false));
  }
  if(searchInput) searchInput.addEventListener('input',()=>{
    cancelExit();
    if(searchInput.value.trim()) {activeFilter='all';$$('.catalog-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));}
    renderShows(activeFilter,true);
  });
  if(hasCatalog) $('#reset-search').addEventListener('click',()=>{cancelExit();searchInput.value='';activeFilter='all';$$('.catalog-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter==='all')));renderShows('all',true);searchInput.focus();});
  function stopShowMedia() {
    $('#show-media').replaceChildren();$('#show-media').hidden=true;$('#stop-show-media').hidden=true;
    $('.dialog-visual').classList.remove('is-playing-media');
    $('#play-show-media').hidden=!selectedShow?.embedUrl;
  }
  $('#play-show-media').addEventListener('click',()=>{
    if(!selectedShow?.embedUrl) return;
    const frame=document.createElement('iframe');frame.id='show-media-frame';
    frame.src=selectedShow.embedUrl;frame.title=selectedShow.title+(selectedShow.mediaType==='pdf'?' konsept dosyası':' tanıtım videosu');
    frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;
    $('#show-media').replaceChildren(frame);$('#show-media').hidden=false;$('#stop-show-media').hidden=false;
    $('#play-show-media').hidden=true;$('.dialog-visual').classList.add('is-playing-media');
    $('#stop-show-media').focus({preventScroll:true});
  });
  $('#stop-show-media').addEventListener('click',()=>{stopShowMedia();$('#play-show-media').focus({preventScroll:true});});
  function resetDialogMotion() {
    dialogTimeline?.kill();dialogTimeline=null;
    if(window.gsap) gsap.set([$('.dialog-visual'),$('.dialog-copy'),$('.dialog-close'),$('.dialog-actions'),$('.dialog-art'),$('#dialog-title'),$('#dialog-description'),$('.dialog-tags')],{clearProps:'transform,opacity,filter'});
    dialog.classList.remove('dialog-morphing');
  }
  function fillShow(show) {
    stopShowMedia();selectedShow=show;
    $('#dialog-title').textContent=show.title;$('#dialog-category').textContent=show.category.toLocaleUpperCase('tr-TR');
    $('#dialog-description').textContent=show.description;
    const visual=$('.dialog-visual');$('#dialog-art').innerHTML=posterHTML(show,true);
    $('.poster-photo',visual)?.setAttribute('loading','eager');
    $('.poster-photo',visual)?.setAttribute('sizes','(max-width:760px) 92vw, 530px');
    $('.dialog-image-note').textContent=show.image?'2027 KATALOG GÖRSELİ':'ZAYA · LIVE PERFORMANCE';
    $('#dialog-facts').innerHTML=factsHTML(show);
    $('#play-show-media').hidden=!show.embedUrl;
    $('#play-show-media').innerHTML=brandIcon(show.mediaType==='pdf'?'arrow':'play')+'<span>'+(show.mediaType==='pdf'?'Konsept dosyasını aç':'Tanıtımı izle')+'</span>';
    $('#media-links').hidden=!show.driveUrl;
    if(show.driveUrl) $('#drive-link').href=show.driveUrl;else $('#drive-link').removeAttribute('href');
    $('#media-help').textContent=show.id==='pia'?'Katalog bağlantısındaki video: Ninjas Philipines Promo.':show.mediaType==='pdf'?'Konsept dosyasını burada veya Drive’da inceleyin.':'Oynatıcı açılmazsa bağlantıyı kullanabilirsiniz.';
    $('#show-rider').hidden=!show.rider.length;$('#show-rider').open=false;
    $('#rider-content').innerHTML=show.rider.map(group=>'<h3>'+escapeHTML(group.heading)+'</h3><ul>'+group.items.map(item=>'<li>'+escapeHTML(item)+'</li>').join('')+'</ul>').join('');
    $('.dialog-tags').replaceChildren(...show.tags.map(tag=>{const span=document.createElement('span');span.textContent=tag;return span;}));
    $('#select-show').dataset.programId=show.id;$('#dialog-program-status').textContent='';window.ZAYA_PROGRAM?.refreshButtons();
    const index=dialogShows.indexOf(show);
    $('#show-position').textContent=`${String(index+1).padStart(2,'0')} / ${String(dialogShows.length).padStart(2,'0')}`;
    $('#show-prev').disabled=index<=0;$('#show-next').disabled=index>=dialogShows.length-1;
  }
  function stepShow(direction) {
    if(!dialog.open || dialogClosing) return;
    const index=dialogShows.indexOf(selectedShow)+direction;
    if(index<0 || index>=dialogShows.length) return;
    resetDialogMotion();
    const show=dialogShows[index];
    lastTrigger=$(`[data-show="${show.id}"]`)||lastTrigger;
    fillShow(show);$('.dialog-scroll').scrollTop=0;dialog.scrollTop=0;
    if(canAnimate()) {
      dialogTimeline=gsap.timeline()
        .fromTo($('.dialog-art'),{opacity:0,x:direction*26,scale:1.035,filter:'blur(8px)'},{opacity:1,x:0,scale:1,filter:SHARP,duration:.32,ease:'power3.out',clearProps:'opacity,transform,filter'},0)
        .fromTo([$('#dialog-title'),$('#dialog-description'),$('.dialog-tags')],{opacity:0,y:10,filter:'blur(6px)'},{opacity:1,y:0,filter:SHARP,duration:.24,stagger:.03,ease:'power3.out',clearProps:'opacity,transform,filter'},.04);
    }
  }
  $('#show-prev').addEventListener('click',()=>stepShow(-1));
  $('#show-next').addEventListener('click',()=>stepShow(1));
  function updateCarousel() {
    if(!hasCatalog)return;
    const cards=[...list.children];
    if(embla) carouselIndex=embla.selectedScrollSnap();
    else if(cards.length && !desktop.matches) {
      const start=list.getBoundingClientRect().left+parseFloat(getComputedStyle(list).paddingLeft);
      let distance=Infinity;
      cards.forEach((card,i)=>{const d=Math.abs(card.getBoundingClientRect().left-start);if(d<distance){distance=d;carouselIndex=i;}});
    }
    $('#catalog-position').textContent=`${String(cards.length?carouselIndex+1:0).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    $('#catalog-prev').disabled=carouselIndex===0;$('#catalog-next').disabled=carouselIndex>=cards.length-1;
  }
  function setupCarousel() {
    embla?.destroy();embla=null;
    const viewport=$('.catalog-viewport');if(!viewport)return;viewport.classList.remove('is-enhanced');
    if(!desktop.matches && window.EmblaCarousel && list.children.length) {
      viewport.classList.add('is-enhanced');list.scrollLeft=0;
      embla=EmblaCarousel(viewport,{align:'start',containScroll:'keepSnaps',loop:false,duration:reducedMotion.matches?0:28,watchSlides:false});
      embla.on('select',updateCarousel).on('reInit',updateCarousel);
    }
    updateCarousel();
  }
  reducedMotion.addEventListener('change',()=>{embla?.reInit({duration:reducedMotion.matches?0:28});});
  const stepCard=direction=>{
    if(embla){direction>0?embla.scrollNext(reducedMotion.matches):embla.scrollPrev(reducedMotion.matches);return;}

    const target=list.children[Math.max(0,Math.min(list.children.length-1,carouselIndex+direction))];
    if(target) list.scrollTo({left:list.scrollLeft+target.getBoundingClientRect().left-list.getBoundingClientRect().left-parseFloat(getComputedStyle(list).paddingLeft),behavior:reducedMotion.matches?'instant':'smooth'});
  };
  if(hasCatalog) $('#catalog-prev').addEventListener('click',()=>stepCard(-1));
  if(hasCatalog) $('#catalog-next').addEventListener('click',()=>stepCard(1));
  let carouselFrame=false;
  if(hasCatalog) list.addEventListener('scroll',()=>{if(!carouselFrame){carouselFrame=true;requestAnimationFrame(()=>{updateCarousel();carouselFrame=false;});}},{passive:true});
  desktop.addEventListener('change',()=>{if(!hasCatalog)return;setupCarousel();if(!desktop.matches){cardObserver.disconnect();window.gsap?.killTweensOf(list.children);window.gsap?.set(list.children,{clearProps:'opacity,transform'});}});
  function openShow(show,trigger,context=visibleShows) {
    if(dialog.open) return;
    resetDialogMotion();dialogClosing=false;selectedShow=show;lastTrigger=trigger;dialogShows=context;
    const sourceRect=($('.card-art',trigger)||trigger).getBoundingClientRect();
    fillShow(show);
    const visual=$('.dialog-visual');
    window.ZAYA_UI.closeMenu?.();dialog.showModal();dialog.scrollTop=0;$('.dialog-scroll').scrollTop=0;document.body.classList.add('dialog-open');
    if(canAnimate() && !desktop.matches) {
      dialogTimeline=gsap.timeline({onComplete:()=>{dialogTimeline=null;}})
        .fromTo([visual,$('.dialog-copy')],{opacity:0,y:10},{opacity:1,y:0,duration:.35,ease:'power3.out',clearProps:'opacity,transform'});
    } else if(canAnimate()) {
      const target=visual.getBoundingClientRect();
      dialog.classList.add('dialog-morphing');
      dialogTimeline=gsap.timeline({onComplete:()=>{dialog.classList.remove('dialog-morphing');dialogTimeline=null;}});
      dialogTimeline.fromTo(visual,{x:sourceRect.left-target.left,y:sourceRect.top-target.top,scaleX:sourceRect.width/target.width,scaleY:sourceRect.height/target.height},{x:0,y:0,scaleX:1,scaleY:1,duration:.52,ease:'power3.inOut',clearProps:'transform'},0)
        .fromTo($('.dialog-copy'),{opacity:0,y:12},{opacity:1,y:0,duration:.2,ease:'power2.out',clearProps:'opacity,transform'},.32)
        .fromTo($('.dialog-close'),{opacity:0},{opacity:1,duration:.16,clearProps:'opacity'},.32);
    }
  }
  function closeShow({toForm=false}={}) {
    if(!dialog.open||dialogClosing) return;
    stopShowMedia();dialogClosing=true;dialogTimeline?.kill();dialogTimeline=null;
    const finish=()=>{
      pendingDialogFinish=null;resetDialogMotion();if(toForm) lastTrigger=null;
      dialog.close();
      if(toForm) {
        const form=$('#talep');
        if(form) {form.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});$('input[name="venue"]')?.focus({preventScroll:true});}
        else location.href='program.html#talep';
      }
    };
    pendingDialogFinish=finish;
    if(!canAnimate()) {finish();return;}
    const visual=$('.dialog-visual'),target=lastTrigger?.getBoundingClientRect(),origin=visual.getBoundingClientRect();
    const layoutLeft=origin.left-Number(gsap.getProperty(visual,'x')),layoutTop=origin.top-Number(gsap.getProperty(visual,'y'));
    const returnToCard=desktop.matches&&!toForm&&target&&target.top<innerHeight&&target.bottom>0&&origin.top>=0;
    dialog.classList.add('dialog-morphing','is-closing');
    dialogTimeline=gsap.timeline({onComplete:finish});
    dialogTimeline.to([$('.dialog-copy'),$('.dialog-close')],{opacity:0,duration:.14},0);
    if(returnToCard) dialogTimeline.to(visual,{x:target.left-layoutLeft,y:target.top-layoutTop,scaleX:target.width/visual.offsetWidth,scaleY:target.height/visual.offsetHeight,duration:.32,ease:'power3.inOut'},0);
    else dialogTimeline.to(visual,{opacity:0,y:10,duration:.2,ease:'power2.in'},0);
  }
  $('.dialog-close').addEventListener('click',()=>closeShow());
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeShow();}else if(!e.target.closest('input,select,textarea,iframe')&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){e.preventDefault();stepShow(e.key==='ArrowRight'?1:-1);}});
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeShow();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeShow();}});
  dialog.addEventListener('close',()=>{dialog.classList.remove('is-closing');stopShowMedia();pendingDialogFinish=null;resetDialogMotion();document.body.classList.remove('dialog-open');dialogClosing=false;(lastTrigger?.querySelector?.('.show-details, .flick-open')||lastTrigger)?.focus?.({preventScroll:true});});
  $('#review-program')?.addEventListener('click',()=>closeShow({toForm:true}));
  document.addEventListener('click',e=>{const trigger=e.target.closest('[data-open-show]');if(!trigger)return;const show=shows.find(s=>s.id===trigger.dataset.openShow);if(!show)return;openShow(show,trigger,shows);});
  reducedMotion.addEventListener('change',e=>{
    if(e.matches){cardObserver.disconnect();if(hasCatalog)window.gsap?.killTweensOf(list.children);if(window.gsap&&hasCatalog)gsap.set(list.children,{clearProps:'opacity,transform'});if(dialogClosing&&pendingDialogFinish)pendingDialogFinish();else resetDialogMotion();}
  });
  // sovlar.html?kategori=<filter> opens on that category.
  const wanted=new URLSearchParams(location.search).get('kategori');
  const startFilter=hasCatalog&&wanted&&$(`.catalog-filters button[data-filter="${CSS.escape(wanted)}"]`)?wanted:'stage-show';
  if(hasCatalog) $$('.catalog-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===startFilter)));
  if(hasCatalog) renderShows(startFilter); else visibleShows = shows;
  window.ZAYA_SHOWCASE = {open: (id, trigger) => {const show=shows.find(s=>s.id===id);if(show)openShow(show,trigger||$(`[data-show="${id}"]`)||document.body,shows);}};
});

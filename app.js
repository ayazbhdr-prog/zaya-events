document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = name => window.ZAYA_ICONS[name] || '';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 761px)');
  const header = $('.header'), menu = $('.menu-toggle'), mobileNav = $('.mobile-nav');
  const closeMenu = (focus = false) => {
    menu.innerHTML = icon('menu');
    mobileNav.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Menüyü aç');
    if (focus) menu.focus();
  };
  menu.addEventListener('click', () => {
    const opening = mobileNav.hidden; mobileNav.hidden = !opening;
    menu.innerHTML = icon(opening ? 'x' : 'menu');
    menu.setAttribute('aria-expanded', String(opening)); menu.setAttribute('aria-label', opening ? 'Menüyü kapat' : 'Menüyü aç');
  });
  $$('a', mobileNav).forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });
  document.addEventListener('click', e => { if(!e.composedPath().includes(header) && !mobileNav.hidden) closeMenu(); });
  desktop.addEventListener('change', e => { if(e.matches) closeMenu(); });
  let scrollQueued = false;
  const updateHeader = () => { header.classList.toggle('is-scrolled', window.scrollY > 100); scrollQueued = false; };
  window.addEventListener('scroll', () => { if(!scrollQueued) {scrollQueued = true; requestAnimationFrame(updateHeader);} }, {passive:true});
  updateHeader();

  // Cards keep the same media surface when expanding into show details.
  const shows = window.ZAYA_SHOWS || [], list = $('#show-list'), dialog = $('#show-dialog');
  const programSelect = $('#selected-program');
  let visibleShows = shows, carouselIndex = 0, embla = null;
  const placeDialogAction = () => {
    const actions = $('.dialog-actions');
    (desktop.matches ? $('.dialog-copy') : actions).append($('#select-show'));
    actions.hidden = desktop.matches;
  };
  placeDialogAction();
  desktop.addEventListener('change', () => {if(dialogClosing && pendingDialogFinish) pendingDialogFinish(); else resetDialogMotion();placeDialogAction();});
  let selectedShow = null, lastTrigger = null, dialogTimeline = null, dialogClosing = false, pendingDialogFinish = null;
  const canAnimate = () => !!window.gsap && !reducedMotion.matches;
  const smallAssets = new Set(['pool-party.webp','theme-party.webp','live-music.webp']);
  const posterHTML = show => {
    const style = `--photo-position:${show.position || 'center'};--poster-accent:${show.accent}`;
    if(show.image) {
      const responsive = smallAssets.has(show.image) ? `srcset="assets/${show.image.replace('.webp','-small.webp')} 800w, assets/${show.image} 1600w" sizes="(max-width:760px) 88vw, (max-width:950px) 44vw, 29vw"` : '';
      return `<span class="poster-surface art-photo" style="${style}"><img class="poster-photo" src="assets/${show.image}" ${responsive} alt="" width="1600" height="1200" loading="lazy"><span class="photo-motif motif-${show.id}" aria-hidden="true"></span></span>`;
    }
    const initials = {african:'AA',drifters:'D',etiyopya:'E',prestij:'P'};
    return `<span class="poster-surface art-${show.art}" style="${style}"><span class="poster-lines">${Array.from({length:7},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</span><span class="poster-label">${initials[show.id]}</span><span class="poster-rule"></span><span class="poster-wordmark">ZAYA · ŞOV KOLEKSİYONU</span></span>`;
  };
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      cardObserver.unobserve(entry.target);
      if(canAnimate()) gsap.to(entry.target,{opacity:1,y:0,duration:.65,delay:Number(entry.target.dataset.order)%3*.06,ease:'power3.out',clearProps:'opacity,transform'});
      else {entry.target.style.opacity='';entry.target.style.transform='';}
    });
  },{rootMargin:'0px 0px 30px 0px',threshold:.08});
  shows.forEach(show => {const option=document.createElement('option');option.value=show.title;option.textContent=show.title;programSelect.append(option);});
  const renderShows = (filter, filtering = false) => {
    embla?.destroy();embla=null;$('.catalog-viewport').classList.remove('is-enhanced');
    cardObserver.disconnect();
    if(window.gsap) gsap.killTweensOf(list.children);
    const visible = shows.filter(show => filter === 'all' || show.filter === filter);
    visibleShows=visible;carouselIndex=0;
    list.replaceChildren();
    visible.forEach((show,index) => {
      const button=document.createElement('button');button.type='button';button.className='show-card';button.dataset.show=show.id;button.dataset.order=String(index);
      button.style.setProperty('--poster-accent',show.accent);
      button.setAttribute('aria-label',`${show.title} — detayları incele`);button.setAttribute('aria-haspopup','dialog');
      button.innerHTML=`<span class="card-art" aria-hidden="true">${posterHTML(show)}</span><span class="card-shade" aria-hidden="true"></span><span class="card-topline"><span class="card-number">${String(shows.indexOf(show)+1).padStart(2,'0')}</span><span class="card-category">${({sahne:'Şov',muzik:'Canlı müzik',parti:'Parti'})[show.filter]}</span></span><span class="card-caption"><span class="card-title">${show.title}</span><span class="card-action">Şovu incele ${icon('arrow-up-right')}</span></span>`;
      button.addEventListener('click',()=>openShow(show,button));list.append(button);
      if(canAnimate() && desktop.matches) {
        gsap.set(button,{opacity:0,y:filtering?10:28});
        if(filtering) gsap.to(button,{opacity:1,y:0,duration:.24,delay:Math.min(index,2)*.04,ease:'power2.out',clearProps:'opacity,transform'});
        else cardObserver.observe(button);
      }
    });
    $('.catalog-count').textContent=`${String(visible.length).padStart(2,'0')} program`;
    list.scrollLeft=0;setupCarousel();updateCarousel();
    window.ScrollTrigger?.refresh();
  };
  $$('.catalog-filters button').forEach(button=>button.addEventListener('click',()=>{
    if(button.getAttribute('aria-pressed')==='true') return;
    $$('.catalog-filters button').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    renderShows(button.dataset.filter,true);
  }));
  function resetDialogMotion() {
    dialogTimeline?.kill();dialogTimeline=null;
    if(window.gsap) gsap.set([$('.dialog-visual'),$('.dialog-copy'),$('.dialog-close'),$('.dialog-actions'),$('.dialog-art'),$('#dialog-title'),$('#dialog-description'),$('.dialog-tags')],{clearProps:'transform,opacity'});
    dialog.classList.remove('dialog-morphing');
  }
  function fillShow(show) {
    selectedShow=show;
    $('#dialog-title').textContent=show.title;$('#dialog-category').textContent=show.category.toLocaleUpperCase('tr-TR');
    $('#dialog-description').textContent=show.description;
    const visual=$('.dialog-visual');$('#dialog-art').innerHTML=posterHTML(show);
    $('.poster-photo',visual)?.setAttribute('loading','eager');
    $('.poster-photo',visual)?.setAttribute('sizes','(max-width:760px) 92vw, 530px');
    $('.dialog-image-note').textContent=show.image?'GÖRSEL TEMSİLİDİR · GERÇEK EKİP FOTOĞRAFI DEĞİLDİR':'GRAFİK TASARIM ÖNİZLEMESİ · ZAYA EVENTS';
    $('.dialog-tags').replaceChildren(...show.tags.map(tag=>{const span=document.createElement('span');span.textContent=tag;return span;}));
    const index=visibleShows.indexOf(show);
    $('#show-position').textContent=`${String(index+1).padStart(2,'0')} / ${String(visibleShows.length).padStart(2,'0')}`;
    $('#show-prev').disabled=index<=0;$('#show-next').disabled=index>=visibleShows.length-1;
  }
  function stepShow(direction) {
    if(!dialog.open || dialogClosing) return;
    const index=visibleShows.indexOf(selectedShow)+direction;
    if(index<0 || index>=visibleShows.length) return;
    resetDialogMotion();
    const show=visibleShows[index];
    lastTrigger=$(`[data-show="${show.id}"]`,list);
    fillShow(show);$('.dialog-scroll').scrollTop=0;dialog.scrollTop=0;
    if(canAnimate()) {
      dialogTimeline=gsap.timeline()
        .fromTo($('.dialog-art'),{opacity:0,x:direction*26,scale:1.035},{opacity:1,x:0,scale:1,duration:.45,ease:'power3.out',clearProps:'opacity,transform'},0)
        .fromTo([$('#dialog-title'),$('#dialog-description'),$('.dialog-tags')],{opacity:0,y:10},{opacity:1,y:0,duration:.3,stagger:.04,ease:'power3.out',clearProps:'opacity,transform'},.08);
    }
  }
  $('#show-prev').addEventListener('click',()=>stepShow(-1));
  $('#show-next').addEventListener('click',()=>stepShow(1));
  function updateCarousel() {
    const cards=[...list.children];
    if(embla) carouselIndex=embla.selectedScrollSnap();
    else if(cards.length && !desktop.matches) {
      const start=list.getBoundingClientRect().left+parseFloat(getComputedStyle(list).paddingLeft);
      let distance=Infinity;
      cards.forEach((card,i)=>{const d=Math.abs(card.getBoundingClientRect().left-start);if(d<distance){distance=d;carouselIndex=i;}});
    }
    $('#catalog-position').textContent=`${String(carouselIndex+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
    $('#catalog-prev').disabled=carouselIndex===0;$('#catalog-next').disabled=carouselIndex>=cards.length-1;
  }
  function setupCarousel() {
    embla?.destroy();embla=null;
    const viewport=$('.catalog-viewport');viewport.classList.remove('is-enhanced');
    if(!desktop.matches && window.EmblaCarousel) {
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
  $('#catalog-prev').addEventListener('click',()=>stepCard(-1));
  $('#catalog-next').addEventListener('click',()=>stepCard(1));
  let carouselFrame=false;
  list.addEventListener('scroll',()=>{if(!carouselFrame){carouselFrame=true;requestAnimationFrame(()=>{updateCarousel();carouselFrame=false;});}},{passive:true});
  desktop.addEventListener('change',()=>{setupCarousel();if(!desktop.matches){cardObserver.disconnect();window.gsap?.killTweensOf(list.children);window.gsap?.set(list.children,{clearProps:'opacity,transform'});}});
  function openShow(show,trigger) {
    if(dialog.open) return;
    resetDialogMotion();dialogClosing=false;selectedShow=show;lastTrigger=trigger;
    const sourceRect=$('.card-art',trigger).getBoundingClientRect();
    fillShow(show);
    const visual=$('.dialog-visual');
    closeMenu();dialog.showModal();dialog.scrollTop=0;$('.dialog-scroll').scrollTop=0;document.body.classList.add('dialog-open');
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
    dialogClosing=true;dialogTimeline?.kill();dialogTimeline=null;
    const finish=()=>{
      pendingDialogFinish=null;resetDialogMotion();if(toForm) lastTrigger=null;
      dialog.close();
      if(toForm) {
        $('#talep').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
        $('input[name="venue"]').focus({preventScroll:true});
      }
    };
    pendingDialogFinish=finish;
    if(!canAnimate()) {finish();return;}
    const visual=$('.dialog-visual'),target=lastTrigger?.getBoundingClientRect(),origin=visual.getBoundingClientRect();
    const layoutLeft=origin.left-Number(gsap.getProperty(visual,'x')),layoutTop=origin.top-Number(gsap.getProperty(visual,'y'));
    const returnToCard=desktop.matches&&!toForm&&target&&target.top<innerHeight&&target.bottom>0&&origin.top>=0;
    dialog.classList.add('dialog-morphing');
    dialogTimeline=gsap.timeline({onComplete:finish});
    dialogTimeline.to([$('.dialog-copy'),$('.dialog-close')],{opacity:0,duration:.14},0);
    if(returnToCard) dialogTimeline.to(visual,{x:target.left-layoutLeft,y:target.top-layoutTop,scaleX:target.width/visual.offsetWidth,scaleY:target.height/visual.offsetHeight,duration:.32,ease:'power3.inOut'},0);
    else dialogTimeline.to(visual,{opacity:0,y:10,duration:.2,ease:'power2.in'},0);
  }
  $('.dialog-close').addEventListener('click',()=>closeShow());
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeShow();}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();stepShow(e.key==='ArrowRight'?1:-1);}});
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeShow();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeShow();}});
  dialog.addEventListener('close',()=>{pendingDialogFinish=null;resetDialogMotion();document.body.classList.remove('dialog-open');dialogClosing=false;lastTrigger?.focus({preventScroll:true});});
  $('#select-show').addEventListener('click',()=>{if(!selectedShow)return;programSelect.value=selectedShow.title;closeShow({toForm:true});});
  reducedMotion.addEventListener('change',e=>{
    if(e.matches){sceneTextTween?.progress(1);cardObserver.disconnect();window.gsap?.killTweensOf(list.children);if(window.gsap)gsap.set(list.children,{clearProps:'opacity,transform'});if(dialogClosing&&pendingDialogFinish)pendingDialogFinish();else resetDialogMotion();}
  });
  renderShows('all');

  // The brief is local only: never imply that a request has been delivered.
  $('#talep').addEventListener('submit', e => {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    $('#brief-output').value = `Merhaba ZAYA Events,\n\nTesis / etkinlik: ${String(data.get('venue')).trim()}\nTarih / sezon: ${String(data.get('date')).trim()}\nİlgilendiğim program: ${data.get('program')}${String(data.get('note')).trim() ? '\nNot: '+String(data.get('note')).trim() : ''}\n\nProgram ve uygunluk bilgisi almak istiyorum.`;
    $('.brief-result').hidden = false; $('#copy-status').textContent = ''; $('#brief-output').focus();
    window.ScrollTrigger?.refresh();
  });
  $('.copy-brief').addEventListener('click', async () => {
    try {await navigator.clipboard.writeText($('#brief-output').value); $('#copy-status').textContent='Talep metni kopyalandı.';}
    catch {$('#brief-output').focus(); $('#brief-output').select(); $('#copy-status').textContent='Metni seçip cihazınızın kopyala komutunu kullanabilirsiniz.';}
  });

  // Background video is optional, silent and pausable. Loading is avoided for reduced motion/data saving.
  const video = $('#hero-video'), videoButton = $('.video-toggle');
  let videoWanted = !reducedMotion.matches && !navigator.connection?.saveData;
  let heroVisible = true, introReady = !canAnimate();
  const syncVideoButton = () => {
    const playing = !video.paused;
    videoButton.innerHTML = `${icon(playing?'pause':'play')}<span>${playing?'FİLMİ DURAKLAT':'FİLMİ OYNAT'}</span>`;
    videoButton.setAttribute('aria-label', playing?'Tanıtım videosunu duraklat':'Tanıtım videosunu oynat');
  };
  const playVideo = async () => {
    if(!introReady) return;
    if(!video.src) video.src = (!desktop.matches && video.dataset.mobileSrc) || video.dataset.src;
    try {await video.play();} catch {videoWanted=false; syncVideoButton();}
  };
  videoButton.hidden = false;
  videoButton.addEventListener('click', () => {videoWanted = video.paused; if(videoWanted) playVideo(); else video.pause();});
  video.addEventListener('playing', () => {$('.hero-visual').classList.add('is-playing'); syncVideoButton();});
  video.addEventListener('pause', syncVideoButton);
  video.addEventListener('error', () => {videoWanted=false;videoButton.hidden=true;$('.hero-visual').classList.remove('is-playing');});
  new IntersectionObserver(entries => {heroVisible=entries[0].isIntersecting; if(!heroVisible) video.pause(); else if(videoWanted && !document.hidden) playVideo();},{threshold:.08}).observe($('.hero'));
  document.addEventListener('visibilitychange', () => {if(document.hidden) video.pause(); else if(videoWanted && heroVisible) playVideo();});
  reducedMotion.addEventListener('change', e => { if(e.matches){videoWanted=false;video.pause();} });

  // One scroll-linked day/night transition; manual selection takes priority afterward.
  const scene = $('.daynight'); let sceneTrigger = null, manualScene = false, sceneMode = 'day', sceneTextTween = null;
  const updateSceneText = mode => {
    if(sceneMode === mode && scene.dataset.ready) return;
    sceneMode=mode; scene.dataset.time=mode; scene.dataset.ready='true';
    $$('.scene-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.time===mode)));
    const applyText = () => {
      $('#scene-description').innerHTML = mode==='day' ? 'Havuz başında müzik, dans ve yaz enerjisi.<br>Pool partileriyle günün temposunu değiştirin.' : 'Işıklar değişir. Enerji devam eder.<br>Tema partileriyle geceye kendi karakterini verin.';
      $('#scene-cta').textContent = mode==='day'?'Pool partilerini keşfet':'Otel gece programlarını keşfet';
    };
    sceneTextTween?.kill();
    if(canAnimate()) {
      sceneTextTween=gsap.timeline().to($('#scene-description'),{opacity:0,duration:.12,onComplete:applyText})
        .to($('#scene-description'),{opacity:1,duration:.2,clearProps:'opacity'});
    } else applyText();
  };
  $$('.scene-switch button').forEach(button => button.addEventListener('click', () => {
    manualScene=true; sceneTrigger?.kill(); const mode=button.dataset.time; updateSceneText(mode);
    if(window.gsap && !reducedMotion.matches) gsap.to(scene,{'--night-mix':mode==='night'?1:0,duration:.9,ease:'power2.inOut',overwrite:true});
    else scene.style.setProperty('--night-mix',mode==='night'?'1':'0');
  }));
  $('.scene-link').addEventListener('click', () => {const rows=$$('.service-row');rows[sceneMode==='day'?1:0].open=true;});
  $$('.service-row').forEach(row => row.addEventListener('toggle', () => window.ScrollTrigger?.refresh()));


  if(!window.gsap || !window.ScrollTrigger) {introReady=true;return;}
  gsap.registerPlugin(ScrollTrigger);
  const motion=gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const finishIntro=()=>{introReady=true;if(videoWanted && heroVisible && !document.hidden)playVideo();};
    const intro=gsap.timeline({defaults:{ease:'power3.out'},onComplete:finishIntro});
    intro.fromTo('.hero-dawn',{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(0% 0% 100% 0%)',duration:1.1,ease:'power2.inOut'},.28)
      .from('.hero-eyebrow',{opacity:0,y:10,duration:.45},.05)
      .from('.hero h1 .line:first-child > span',{yPercent:112,duration:.75},.12)
      .from('.hero h1 .line:last-child > span',{yPercent:112,duration:.75},.55)
      .from('.hero-description',{opacity:0,y:12,duration:.45},.85)
      .from('.hero-actions',{opacity:0,y:10,duration:.45},1.0)
      .from('.hero-bottom',{opacity:0,duration:.35},1.1);
    gsap.to('.hero-visual',{yPercent:9,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    $$('h2.reveal').forEach(el => gsap.from(el,{y:12,opacity:0,duration:.5,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
    if(!manualScene) sceneTrigger=ScrollTrigger.create({trigger:scene,start:'top 45%',end:'bottom 85%',onUpdate:self=>{if(manualScene)return;const mix=Math.max(0,Math.min(1,(self.progress-.38)/.24));scene.style.setProperty('--night-mix',String(mix));updateSceneText(self.progress>.5?'night':'day');}});
    return () => {sceneTrigger?.kill();introReady=true;};
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
});

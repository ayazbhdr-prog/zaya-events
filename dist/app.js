document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const refreshIcons = () => window.lucide?.createIcons({attrs:{'stroke-width':1.5}});
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 761px)');
  const header = $('.header'), menu = $('.menu-toggle'), mobileNav = $('.mobile-nav');
  const closeMenu = (focus = false) => {
    mobileNav.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Menüyü aç');
    if (focus) menu.focus();
  };
  menu.addEventListener('click', () => {
    const opening = mobileNav.hidden; mobileNav.hidden = !opening;
    menu.setAttribute('aria-expanded', String(opening)); menu.setAttribute('aria-label', opening ? 'Menüyü kapat' : 'Menüyü aç');
  });
  $$('a', mobileNav).forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });
  document.addEventListener('click', e => { if(!header.contains(e.target) && !mobileNav.hidden) closeMenu(); });
  desktop.addEventListener('change', e => { if(e.matches) closeMenu(); });
  let scrollQueued = false;
  const updateHeader = () => { header.classList.toggle('is-scrolled', window.scrollY > 100); scrollQueued = false; };
  window.addEventListener('scroll', () => { if(!scrollQueued) {scrollQueued = true; requestAnimationFrame(updateHeader);} }, {passive:true});
  updateHeader();

  // Catalog: all names remain available with native, keyboard-operable buttons.
  const shows = window.ZAYA_SHOWS || [], list = $('#show-list'), dialog = $('#show-dialog');
  const programSelect = $('#selected-program'); let selectedShow = null, lastTrigger = null;
  shows.forEach(show => { const option = document.createElement('option'); option.value = show.title; option.textContent = show.title; programSelect.append(option); });
  const renderShows = filter => {
    const visible = shows.filter(show => filter === 'all' || show.filter === filter);
    list.replaceChildren();
    visible.forEach(show => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'show-row'; button.dataset.show = show.id;
      button.setAttribute('aria-label', `${show.title} — detayları incele`); button.setAttribute('aria-haspopup','dialog');
      button.innerHTML = `<span class="show-number">${String(shows.indexOf(show)+1).padStart(2,'0')}</span><span><span class="show-name">${show.title}</span><span class="show-category">${show.category}</span></span><span class="show-arrow">${icon('arrow-up-right')}</span>`;
      button.addEventListener('click', () => openShow(show, button));
      list.append(button);
    });
    $('.catalog-count').textContent = `${visible.length} program`;
    refreshIcons(); window.ScrollTrigger?.refresh();
    if(window.gsap && !reducedMotion.matches) gsap.fromTo(list.children,{opacity:0,y:9},{opacity:1,y:0,duration:.4,stagger:.035,clearProps:'opacity,transform'});
  };
  $$('.catalog-filters button').forEach(button => button.addEventListener('click', () => {
    $$('.catalog-filters button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderShows(button.dataset.filter);
    const photo = $('#catalog-photo');
    const src = button.dataset.filter === 'muzik' ? 'live-music.webp' : button.dataset.filter === 'parti' ? 'theme-party.webp' : 'night.webp';
    photo.src = `assets/${src}`;
    photo.srcset = src === 'night.webp' ? '' : `assets/${src.replace('.webp','-small.webp')} 800w, assets/${src} 1600w`;
    photo.sizes = '(max-width: 760px) 88vw, 42vw';
    photo.alt = button.dataset.filter === 'muzik' ? 'Canlı müzik atmosferini gösteren temsili görsel' : 'Etkinlik atmosferini gösteren temsili görsel';
  }));
  function openShow(show, trigger) {
    selectedShow = show; lastTrigger = trigger;
    $('#dialog-title').textContent = show.title; $('#dialog-category').textContent = show.category.toLocaleUpperCase('tr-TR');
    $('#dialog-description').textContent = show.description;
    const photo = $('#dialog-photo'), visual = $('.dialog-visual');
    photo.hidden = !show.image; visual.classList.toggle('no-photo', !show.image);
    if(show.image) {
      photo.src = `assets/${show.image}`;
      photo.srcset = show.image === 'night.webp' ? '' : `assets/${show.image.replace('.webp','-small.webp')} 800w, assets/${show.image} 1600w`;
      photo.sizes = '(max-width: 760px) 92vw, 480px';
    }
    $('span',visual).textContent = show.image ? 'GÖRSEL TEMSİLİDİR · GERÇEK EKİP FOTOĞRAFI DEĞİLDİR' : 'ZAYA EVENTS · ŞOV KATALOĞU';
    $('.dialog-tags').replaceChildren(...show.tags.map(tag => {const span = document.createElement('span'); span.textContent = tag; return span;}));
    closeMenu(); dialog.showModal(); document.body.classList.add('dialog-open');
    if(window.gsap && !reducedMotion.matches) gsap.fromTo(dialog,{opacity:0,y:18},{opacity:1,y:0,duration:.35,clearProps:'opacity,transform'});
  }
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if(e.target === dialog){const r=dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close();} });
  dialog.addEventListener('close', () => {document.body.classList.remove('dialog-open'); lastTrigger?.focus({preventScroll:true});});
  $('#select-show').addEventListener('click', () => {
    if(!selectedShow) return; programSelect.value = selectedShow.title; lastTrigger = null; dialog.close();
    $('#talep').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
    $('input[name="venue"]').focus({preventScroll:true});
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
  let heroVisible = true;
  const syncVideoButton = () => {
    const playing = !video.paused;
    videoButton.innerHTML = `${icon(playing?'pause':'play')}<span>${playing?'FİLMİ DURAKLAT':'FİLMİ OYNAT'}</span>`;
    videoButton.setAttribute('aria-label', playing?'Tanıtım videosunu duraklat':'Tanıtım videosunu oynat'); refreshIcons();
  };
  const playVideo = async () => {
    if(!video.src) video.src = video.dataset.src;
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
  const scene = $('.daynight'); let sceneTrigger = null, manualScene = false, sceneMode = 'day';
  const updateSceneText = mode => {
    if(sceneMode === mode && scene.dataset.ready) return;
    sceneMode=mode; scene.dataset.time=mode; scene.dataset.ready='true';
    $$('.scene-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.time===mode)));
    $('#scene-description').innerHTML = mode==='day' ? 'Havuz başında müzik, dans ve yaz enerjisi.<br>Pool partileriyle günün temposunu değiştirin.' : 'Işıklar değişir. Enerji devam eder.<br>Tema partileriyle geceye kendi karakterini verin.';
    $('#scene-cta').textContent = mode==='day'?'Gündüz programlarını keşfet':'Gece programlarını keşfet';
  };
  $$('.scene-switch button').forEach(button => button.addEventListener('click', () => {
    manualScene=true; sceneTrigger?.kill(); const mode=button.dataset.time; updateSceneText(mode);
    if(window.gsap && !reducedMotion.matches) gsap.to(scene,{'--night-mix':mode==='night'?1:0,duration:.9,ease:'power2.inOut',overwrite:true});
    else scene.style.setProperty('--night-mix',mode==='night'?'1':'0');
  }));
  $('.scene-link').addEventListener('click', () => {const rows=$$('.service-row');rows[sceneMode==='day'?1:0].open=true;});
  $$('.service-row').forEach(row => row.addEventListener('toggle', () => window.ScrollTrigger?.refresh()));
  refreshIcons();

  if(!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const motion=gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const intro=gsap.timeline({defaults:{ease:'power3.out'}});
    intro.from('.hero-eyebrow',{opacity:0,y:12,duration:.65},.1)
      .from('.hero h1 .line > span',{yPercent:112,rotate:1.5,duration:1.15,stagger:.12},.12)
      .from('.hero-description',{opacity:0,y:18,duration:.75},.5)
      .from('.hero-actions',{opacity:0,y:15,duration:.7},.7)
      .from('.hero-bottom',{opacity:0,duration:.7},.85);
    gsap.to('.hero-visual',{yPercent:9,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    $$('.reveal').forEach(el => gsap.from(el,{y:25,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
    gsap.from('.catalog-art',{clipPath:'inset(8% 2% 0 2%)',duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'.catalog-art',start:'top 90%',once:true}});
    const ribbon=$('.ribbon-track');
    gsap.fromTo(ribbon,{x:10},{x:()=>-Math.max(45,ribbon.scrollWidth-window.innerWidth+20),ease:'none',scrollTrigger:{trigger:'.service-ribbon',start:'top bottom',end:'bottom top',scrub:1,invalidateOnRefresh:true}});
    if(!manualScene) sceneTrigger=ScrollTrigger.create({trigger:scene,start:'top 45%',end:'bottom 85%',onUpdate:self=>{if(manualScene)return;scene.style.setProperty('--night-mix',String(self.progress));updateSceneText(self.progress>.5?'night':'day');}});
    return () => {sceneTrigger?.kill();};
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
});

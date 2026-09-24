/* Home page only: hero film and the illustrative day-to-night story. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, $$, reducedMotion, desktop, canAnimate} = window.ZAYA_UI;
  let sceneTextTween=null;
  // Background video is optional, silent and pausable. Loading is avoided for reduced motion/data saving.
  // The hero film plays once on load and rests on its last frame.
  const video = $('#hero-video');
  let introReady = true;
  if(video && !reducedMotion.matches && !navigator.connection?.saveData) {
    video.src = (!desktop.matches && video.dataset.mobileSrc) || video.dataset.src;
    video.play().catch(()=>{});
  }
  const playVideo = () => {};
  let videoWanted = false, heroVisible = true;

  // An illustrative day; manual selection takes priority over scroll choreography.
  const scene=$('.daynight');
  if(!scene) return;let sceneTrigger=null,manualScene=false,sceneMode='day';
  const moments=[
    {id:'pink-pool-party',time:'11:00 / HAVUZ BAŞI',heading:'Güneşle başlar.<br><span>Ritimle devam eder.</span>',description:'Pink Pool Party ile havuz başında müzik, dans ve yaz enerjisi.',image:'assets/pool-party.webp'},
    {id:'quovadis',time:'18:30 / GÜN BATIMI',heading:'Günün ışığı azalır.<br><span>Müzik yaklaşır.</span>',description:'Quovadis ile gün batımından akşama uzanan bir canlı müzik önerisi.',image:'assets/live-music.webp'},
    {id:'colombia-rumbera',time:'21:30 / SAHNE',heading:'Işıklar sahnede.<br><span>Enerji herkeste.</span>',description:'Colombia Rumbera ile akşamın merkezine yerleşen renkli bir dans gösterisi.',image:'assets/hero-poster.webp'},
    {id:'white-party',time:'22:30 / FİNAL',heading:'Gece burada<br><span>devam eder.</span>',description:'White Party ile sahneden partiye uzanan bir final önerisi.',image:'assets/theme-party.webp'}
  ];
  let currentMoment=0;
  function setMoment(index,animate=true){
    const moment=moments[index];if(!moment)return;
    currentMoment=index;sceneMode=index<2?'day':'night';scene.dataset.time=sceneMode;scene.dataset.moment=String(index);
    $$('.scene-timeline button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.moment)===index)));
    const apply=()=>{
      $('#scene-kicker').textContent=moment.time;$('#daynight-title').innerHTML=moment.heading;$('#scene-description').textContent=moment.description;
      
    };
    sceneTextTween?.kill();
    if(animate&&canAnimate())sceneTextTween=gsap.timeline().to($('.scene-content'),{opacity:.25,y:6,duration:.16,onComplete:apply}).to($('.scene-content'),{opacity:1,y:0,duration:.3,clearProps:'opacity,transform'});
    else{apply();window.gsap?.set($('.scene-content'),{clearProps:'opacity,transform'});}
    $$('.story-backdrop').forEach((img,i)=>img.classList.toggle('is-active',i===index));
  }
  const sceneImages=$('.daynight-images');sceneImages.replaceChildren();
  moments.forEach((moment,index)=>{const img=document.createElement('img');img.className='story-backdrop'+(index===0?' is-active':'');img.src=moment.image;img.alt='';img.width=1600;img.height=1100;img.loading='lazy';sceneImages.append(img);});
  // The day advances by itself every 6 seconds while the section is on screen; a tap jumps and restarts the clock.
  let sceneTimer=null, sceneOnScreen=false;
  const startScene=()=>{clearInterval(sceneTimer);if(reducedMotion.matches||!sceneOnScreen)return;sceneTimer=setInterval(()=>setMoment((currentMoment+1)%moments.length),6000);};
  new IntersectionObserver(([e])=>{sceneOnScreen=e.isIntersecting;startScene();},{threshold:.35}).observe(scene);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(sceneTimer);else startScene();});
  $$('.scene-timeline button').forEach(button=>button.addEventListener('click',()=>{setMoment(Number(button.dataset.moment));startScene();}));
  // Services accordion: one open at a time, bodies slide open and closed.
  const serviceRows=$$('.service-row');
  const bodyOf=row=>row.querySelector('.service-body');
  const closeRow=row=>{
    if(!row.open) return;
    if(!canAnimate()) {row.open=false;return;}
    const body=bodyOf(row);
    gsap.fromTo(body,{height:body.offsetHeight,opacity:1},{height:0,opacity:0,duration:.45,ease:'power3.inOut',onComplete:()=>{row.open=false;gsap.set(body,{clearProps:'height,opacity'});window.ScrollTrigger?.refresh();}});
  };
  const openRow=row=>{
    serviceRows.forEach(other=>{if(other!==row) closeRow(other);});
    row.open=true;
    if(canAnimate()) gsap.fromTo(bodyOf(row),{height:0,opacity:0},{height:'auto',opacity:1,duration:.55,ease:'power3.out',onComplete:()=>window.ScrollTrigger?.refresh()});
  };
  serviceRows.forEach(row=>row.querySelector('summary').addEventListener('click',e=>{
    e.preventDefault();
    row.open?closeRow(row):openRow(row);
  }));
  if(!window.gsap || !window.ScrollTrigger) {introReady=true;return;}
  const motion=gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const finishIntro=()=>{introReady=true;if(videoWanted && heroVisible && !document.hidden)playVideo();};
    const intro=gsap.timeline({defaults:{ease:'power3.out'},onComplete:finishIntro});
    intro.from('.hero-eyebrow',{opacity:0,y:10,duration:.45},.05)
      .from('.hero h1 .line:first-child > span',{yPercent:112,duration:.75},.12)
      .from('.hero h1 .line:last-child > span',{yPercent:112,duration:.75},.55)
      .from('.hero-description',{opacity:0,y:12,duration:.45},.85)
      .from('.hero-bottom',{opacity:0,duration:.35},1.1);
    gsap.to('.hero-visual',{yPercent:9,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    
    return () => {sceneTrigger?.kill();introReady=true;};
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
  reducedMotion.addEventListener('change', e => { if(e.matches) sceneTextTween?.progress(1); });
});

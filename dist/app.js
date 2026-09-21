document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  window.lucide?.createIcons({attrs:{'stroke-width':1.5}});
  const header = document.querySelector('.header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 761px)');
  const closeMenu = (restoreFocus = false) => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Menüyü aç');
    if (restoreFocus) menuButton.focus();
  };
  menuButton.addEventListener('click', () => {
    const opening = mobileNav.hidden;
    mobileNav.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Menüyü kapat' : 'Menüyü aç');
    if (opening && window.gsap && !reducedMotion.matches) {
      gsap.fromTo(mobileNav.querySelectorAll('a'),{opacity:0,y:12},{opacity:1,y:0,duration:.4,stagger:.055,ease:'power2.out'});
    }
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });
  document.addEventListener('click', event => { if (!header.contains(event.target) && !mobileNav.hidden) closeMenu(); });
  desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
  let scrollQueued = false;
  const updateHeader = () => {header.classList.toggle('is-scrolled', window.scrollY > 100);scrollQueued=false;};
  window.addEventListener('scroll', () => {if (!scrollQueued) {scrollQueued=true;requestAnimationFrame(updateHeader);}}, {passive:true});
  updateHeader();
  const details = document.querySelectorAll('.service-row');
  details.forEach(row => row.addEventListener('toggle', () => {
    if (row.open && window.gsap && !reducedMotion.matches) {
      gsap.fromTo(row.querySelector('.service-body'),{opacity:0,y:8},{opacity:1,y:0,duration:.4,ease:'power2.out',overwrite:true,onComplete:() => window.ScrollTrigger?.refresh()});
    } else window.ScrollTrigger?.refresh();
  }));
  document.querySelector('.day-card').addEventListener('click', () => {details[1].open=true;});
  document.querySelector('.night-card').addEventListener('click', () => {details[0].open=true;});
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const intro = gsap.timeline({defaults:{ease:'power3.out'}});
    intro.from('.hero-visual img',{scale:1.08,duration:1.65,ease:'power2.out'},0)
      .from('.hero-eyebrow',{opacity:0,y:12,duration:.7},.1)
      .from('.hero h1 .line > span',{yPercent:115,rotate:2,duration:1.15,stagger:.13},.14)
      .from('.hero-description',{opacity:0,y:18,duration:.7},.55)
      .from('.hero-actions',{opacity:0,y:16,duration:.7},.75)
      .from('.hero-bottom',{opacity:0,duration:.7},1);
    gsap.to('.hero-visual',{yPercent:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.utils.toArray('.reveal').forEach(element => {
      gsap.from(element,{y:30,opacity:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 90%',once:true}});
    });
    gsap.utils.toArray('.experience-card').forEach(card => {
      gsap.from(card,{clipPath:'inset(12% 3% 0 3% round 22px)',y:35,duration:1.25,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 88%',once:true}});
      gsap.from(card.querySelector('.card-bottom'),{y:20,opacity:0,duration:.75,delay:.15,scrollTrigger:{trigger:card,start:'top 68%',once:true}});
    });
    gsap.from('.service-row',{y:15,opacity:0,duration:.6,stagger:.075,scrollTrigger:{trigger:'.service-list',start:'top 88%',once:true}});
    const ribbon = document.querySelector('.ribbon-track');
    gsap.fromTo(ribbon,{x:15},{x:() => -Math.max(50, ribbon.scrollWidth-window.innerWidth+20),ease:'none',scrollTrigger:{trigger:'.service-ribbon',start:'top bottom',end:'bottom top',scrub:1,invalidateOnRefresh:true}});
    gsap.from('.about-signature svg',{scaleY:.25,opacity:0,duration:.7,ease:'power2.out',scrollTrigger:{trigger:'.about-signature',start:'top 90%',once:true}});
    return () => { intro.kill(); };
  });
  motion.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.to('.night-card',{y:-45,ease:'none',scrollTrigger:{trigger:'.experience-grid',start:'top 80%',end:'bottom 15%',scrub:1}});
    const cleanups = [];
    document.querySelectorAll('.button-coral').forEach(button => {
      const move = event => {const rect=button.getBoundingClientRect();gsap.to(button,{x:(event.clientX-rect.left-rect.width/2)*.08,y:(event.clientY-rect.top-rect.height/2)*.13,duration:.4,ease:'power2.out',overwrite:true});};
      const reset = () => gsap.to(button,{x:0,y:0,duration:.55,ease:'elastic.out(1,.4)',overwrite:true});
      button.addEventListener('pointermove',move);button.addEventListener('pointerleave',reset);
      cleanups.push(() => {button.removeEventListener('pointermove',move);button.removeEventListener('pointerleave',reset);gsap.set(button,{clearProps:'transform'});});
    });
    return () => cleanups.forEach(cleanup => cleanup());
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), {once:true});
});

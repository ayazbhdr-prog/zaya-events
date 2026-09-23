/* Shared shell: icons, header, menu, smooth scroll and the two reveal motions.
   Every page loads this first; feature modules read window.ZAYA_UI. */
(function () {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = name => (window.ZAYA_ICONS || {})[name] || '';
  const brandIcon = name => (window.ZAYA_BRAND_ICONS || {})[name] || '';
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 761px)');
  const canAnimate = () => !!window.gsap && !reducedMotion.matches;

  window.ZAYA_UI = {$, $$, icon, brandIcon, escapeHTML, reducedMotion, desktop, canAnimate};

  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-brand-icon]').forEach(el => el.innerHTML = brandIcon(el.dataset.brandIcon));

    // Reference marquee can be paused; it is decorative motion.
    const references = $('.references'), referenceButton = $('#references-toggle');
    if (references && referenceButton) referenceButton.addEventListener('click', () => {
      const paused = references.classList.toggle('is-paused');
      referenceButton.setAttribute('aria-pressed', String(paused));
      referenceButton.setAttribute('aria-label', paused ? 'Logo şeridini oynat' : 'Logo şeridini duraklat');
      referenceButton.innerHTML = icon(paused ? 'play' : 'pause');
    });

    const header = $('.header'), menu = $('.menu-toggle'), mobileNav = $('.mobile-nav');
    if (header && menu && mobileNav) {
      const closeMenu = (focus = false) => {
        menu.innerHTML = icon('menu');
        mobileNav.hidden = true;
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Menüyü aç');
        if (focus) menu.focus();
      };
      window.ZAYA_UI.closeMenu = closeMenu;
      menu.addEventListener('click', () => {
        const opening = mobileNav.hidden;
        mobileNav.hidden = !opening;
        menu.innerHTML = icon(opening ? 'x' : 'menu');
        menu.setAttribute('aria-expanded', String(opening));
        menu.setAttribute('aria-label', opening ? 'Menüyü kapat' : 'Menüyü aç');
      });
      $$('a', mobileNav).forEach(link => link.addEventListener('click', () => closeMenu()));
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });
      document.addEventListener('click', e => { if (!e.composedPath().includes(header) && !mobileNav.hidden) closeMenu(); });
      desktop.addEventListener('change', e => { if (e.matches) closeMenu(); });

      let scrollQueued = false;
      const updateHeader = () => { header.classList.toggle('is-scrolled', window.scrollY > 100); scrollQueued = false; };
      window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateHeader); } }, {passive: true});
      updateHeader();
    }

    // Mark the current page in both menus.
    const page = document.body.dataset.page;
    if (page) $$('a[data-nav]').forEach(link => {
      const current = link.dataset.nav === page;
      link.classList.toggle('is-current', current);
      if (current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });

    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Smooth scrolling drives ScrollTrigger; reduced motion keeps the native behaviour.
    if (window.Lenis && !reducedMotion.matches && desktop.matches) {
      const lenis = new Lenis({duration: 1.05, smoothWheel: true, syncTouch: false});
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      window.ZAYA_UI.lenis = lenis;
      // Lenis owns the scroll position, so ScrollTrigger has to read and set it
      // through Lenis — otherwise every trigger measures from the wrong origin.
      ScrollTrigger.scrollerProxy(document.documentElement, {
        scrollTop(value) {
          return arguments.length ? lenis.scrollTo(value, {immediate: true, force: true}) : lenis.scroll;
        },
        getBoundingClientRect() {
          return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
        }
      });
      document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link || link.getAttribute('href') === '#') return;
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, {offset: -90});
      });
    }

    // Only two reveal motions on the whole site: heading lines and a soft fade.
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      $$('h2.reveal, .reveal-line').forEach(el => gsap.from(el, {
        yPercent: 18, opacity: 0, duration: .7, ease: 'power3.out',
        scrollTrigger: {trigger: el, start: 'top 90%', once: true}
      }));
      $$('.reveal-fade').forEach(el => gsap.from(el, {
        opacity: 0, y: 8, duration: .5, ease: 'power2.out',
        scrollTrigger: {trigger: el, start: 'top 92%', once: true}
      }));
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh(), {once: true});
  });
})();

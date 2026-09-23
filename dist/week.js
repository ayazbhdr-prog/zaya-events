/* The sample week reads left to right: the section holds still while the nights pass by.
   Enhancement only — without JS or on phones the week stays a plain scrollable row. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const {$, reducedMotion} = window.ZAYA_UI;
  const section = $('.week-section'), grid = $('.week-grid');
  if (!section || !grid || !window.gsap || !window.ScrollTrigger) return;

  const viewport = document.createElement('div');
  viewport.className = 'week-viewport';
  grid.parentNode.insertBefore(viewport, grid);
  viewport.append(grid);

  const progress = document.createElement('div');
  progress.className = 'week-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  viewport.after(progress);

  gsap.matchMedia().add('(min-width: 1100px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-horizontal');
    const bar = progress.firstElementChild;
    const distance = () => Math.max(0, grid.scrollWidth - viewport.clientWidth);

    const tween = gsap.to(grid, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + (distance() + window.innerHeight * .5),
        pin: true,
        scrub: .8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: self => gsap.set(bar, {scaleX: .06 + self.progress * .94})
      }
    });

    // Keyboard users tab through the nights: keep the focused card in view.
    const onFocus = e => {
      const card = e.target.closest('.week-day');
      if (!card) return;
      const trigger = tween.scrollTrigger;
      const index = [...grid.children].indexOf(card);
      const ratio = index / Math.max(1, grid.children.length - 1);
      window.ZAYA_UI.lenis
        ? window.ZAYA_UI.lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * ratio, {immediate: true, force: true})
        : window.scrollTo(0, trigger.start + (trigger.end - trigger.start) * ratio);
    };
    grid.addEventListener('focusin', onFocus);

    return () => {
      grid.removeEventListener('focusin', onFocus);
      section.classList.remove('is-horizontal');
      gsap.set(grid, {clearProps: 'transform'});
    };
  });
});

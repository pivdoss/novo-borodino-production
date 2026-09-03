import './styles/main.css';
import './styles/lot-landing.css';
import './styles/lot-link-overrides.css';
import { initAnalyticsConsent, reachMetrikaGoal } from './analytics.js';
import { landingMarkup } from './lot-landing.js';

const app = document.querySelector('#app');

if (app && !app.innerHTML.trim()) app.innerHTML = landingMarkup();

const header = document.querySelector('[data-lot-header]');
const hero = document.querySelector('.lot-hero');
const stickyCta = document.querySelector('[data-sticky-cta]');
const updateHeader = () => header?.classList.toggle('is-solid', window.scrollY > 32);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
if (hero && stickyCta && 'IntersectionObserver' in window) {
  const stickyObserver = new IntersectionObserver(([entry]) => stickyCta.classList.toggle('is-visible', !entry.isIntersecting), { threshold: 0.02 });
  stickyObserver.observe(hero);
}

const menuButton = document.querySelector('[data-lot-menu]');
const mobileMenu = document.querySelector('[data-lot-mobile-menu]');
let menuRestoreFocus;
const setMobileMenu = (opened) => {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', String(opened));
  mobileMenu.hidden = !opened;
  document.body.classList.toggle('is-menu-open', opened);
  if (opened) { menuRestoreFocus = document.activeElement; mobileMenu.querySelector('a,button')?.focus(); }
  else if (menuRestoreFocus instanceof HTMLElement) menuRestoreFocus.focus();
};
menuButton?.addEventListener('click', () => setMobileMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu?.querySelector('[data-lot-menu-close]')?.addEventListener('click', () => setMobileMenu(false));
mobileMenu?.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  setMobileMenu(false);
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMobileMenu(false); });

const spatial = document.querySelector('[data-spatial]');
const spatialTabs = [...(spatial?.querySelectorAll('[data-spatial-tab]') || [])];
const spatialLayers = [...(spatial?.querySelectorAll('[data-spatial-layer]') || [])];
let activeSpatialLayer = spatialLayers.find((layer) => layer.classList.contains('is-active')) || spatialLayers[0];
const setSpatialLayer = (name) => {
  const next = spatialLayers.find((layer) => layer.dataset.spatialLayer === name);
  if (!next || next === activeSpatialLayer) return;
  spatialTabs.forEach((tab) => {
    const active = tab.dataset.spatialTab === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  spatialLayers.forEach((layer) => {
    const active = layer === next;
    layer.classList.toggle('is-active', active);
    layer.hidden = !active;
  });
  activeSpatialLayer = next;
  reachMetrikaGoal('map_layer_change', { layer: name });
};
spatialTabs.forEach((tab) => tab.addEventListener('click', () => setSpatialLayer(tab.dataset.spatialTab)));

// Territory panorama: a seamless, always-moving conveyor that users can drag or swipe.
const territorySlider = document.querySelector('[data-territory-slider]');
const territoryTrack = territorySlider?.querySelector('[data-territory-track]');
const territorySlides = [...(territoryTrack?.querySelectorAll('img') || [])];
let territoryOffset = 0;
let territoryLoopWidth = 0;
let territoryFrame;
let territoryLastTime = 0;
let territoryStartX = 0;
let territoryStartOffset = 0;
let territoryDragging = false;
const normalizeTerritory = () => { if (!territoryLoopWidth) return; territoryOffset %= territoryLoopWidth; if (territoryOffset > 0) territoryOffset -= territoryLoopWidth; };
const paintTerritory = () => { if (territoryTrack) territoryTrack.style.transform = `translate3d(${territoryOffset}px,0,0)`; };
const stopTerritory = () => { if (territoryFrame) { cancelAnimationFrame(territoryFrame); territoryFrame = undefined; } territoryLastTime = 0; };
const startTerritory = () => {
  if (territoryFrame || territorySlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  territoryLoopWidth = territoryTrack.scrollWidth / 2;
  const tick = (time) => { if (!territoryLastTime) territoryLastTime = time; const dt = Math.min(time - territoryLastTime, 50); territoryLastTime = time; if (!territoryDragging) { territoryOffset -= dt * .105; normalizeTerritory(); paintTerritory(); } territoryFrame = requestAnimationFrame(tick); };
  territoryFrame = requestAnimationFrame(tick);
};
territorySlider?.addEventListener('pointerdown', (event) => {
  territoryDragging = true; territoryStartX = event.clientX; territoryStartOffset = territoryOffset; territorySlider.classList.add('is-dragging'); territorySlider.setPointerCapture?.(event.pointerId);
});
territorySlider?.addEventListener('pointermove', (event) => { if (!territoryDragging) return; territoryOffset = territoryStartOffset + event.clientX - territoryStartX; normalizeTerritory(); paintTerritory(); });
territorySlider?.addEventListener('pointerup', (event) => {
  if (!territoryDragging) return;
  territoryDragging = false; territorySlider.classList.remove('is-dragging'); startTerritory();
});
territorySlider?.addEventListener('pointercancel', () => { territoryDragging = false; territorySlider.classList.remove('is-dragging'); startTerritory(); });
if (territorySlider && 'IntersectionObserver' in window) {
  const territoryObserver = new IntersectionObserver(([entry]) => entry.isIntersecting ? startTerritory() : stopTerritory(), { threshold: .25 });
  territoryObserver.observe(territorySlider);
}
window.addEventListener('resize', () => { territoryLoopWidth = territoryTrack?.scrollWidth / 2 || 0; normalizeTerritory(); paintTerritory(); }, { passive: true });
paintTerritory();
// Render conveyor: seamless autoplay with pointer drag/swipe support.
const renderSlider = document.querySelector('[data-render-conveyor]');
const renderTrack = renderSlider?.querySelector('[data-render-track]');
const renderOriginal = [...(renderTrack?.querySelectorAll('figure') || [])];
let renderOffset = 0; let renderLoopWidth = 0; let renderFrame; let renderLast = 0; let renderDrag;
const normalizeRender = () => { if (renderLoopWidth) { renderOffset %= renderLoopWidth; if (renderOffset > 0) renderOffset -= renderLoopWidth; } };
const paintRender = () => { if (renderTrack) renderTrack.style.transform = `translate3d(${renderOffset}px,0,0)`; };
const startRender = () => { if (renderFrame || renderOriginal.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; renderLoopWidth = renderTrack.scrollWidth / 2; const tick = (time) => { if (!renderLast) renderLast = time; const dt = Math.min(time - renderLast, 50); renderLast = time; if (!renderDrag) { renderOffset -= dt * .06; normalizeRender(); paintRender(); } renderFrame = requestAnimationFrame(tick); }; renderFrame = requestAnimationFrame(tick); };
const stopRender = () => { if (renderFrame) cancelAnimationFrame(renderFrame); renderFrame = undefined; renderLast = 0; };
if (renderTrack && renderOriginal.length > 1) renderTrack.append(...renderOriginal.map((slide) => { const clone = slide.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); return clone; }));
renderSlider?.addEventListener('pointerdown', (event) => { if (!event.isPrimary) return; renderDrag = { id:event.pointerId, x:event.clientX, start:renderOffset, horizontal:false }; renderSlider.setPointerCapture?.(event.pointerId); renderSlider.classList.add('is-dragging'); stopRender(); });
renderSlider?.addEventListener('pointermove', (event) => { if (!renderDrag || event.pointerId !== renderDrag.id) return; const dx = event.clientX - renderDrag.x; if (!renderDrag.horizontal && Math.abs(dx) > 8) renderDrag.horizontal = true; if (renderDrag.horizontal) { event.preventDefault(); renderOffset = renderDrag.start + dx; normalizeRender(); paintRender(); } });
const finishRender = (event) => { if (!renderDrag || event.pointerId !== renderDrag.id) return; renderDrag = undefined; renderSlider.classList.remove('is-dragging'); startRender(); };
renderSlider?.addEventListener('pointerup', finishRender); renderSlider?.addEventListener('pointercancel', finishRender);
if (renderSlider && 'IntersectionObserver' in window) new IntersectionObserver(([entry]) => entry.isIntersecting ? startRender() : stopRender(), { threshold:.2 }).observe(renderSlider);
window.addEventListener('resize', () => { renderLoopWidth = renderTrack?.scrollWidth / 2 || 0; normalizeRender(); paintRender(); }, { passive:true }); paintRender();
spatial?.querySelector('[data-spatial-lightbox]')?.addEventListener('click', () => {
  const image = activeSpatialLayer?.dataset.spatialLayer === 'aerial' ? (territorySlides[territoryIndex] || activeSpatialLayer.querySelector('img')) : activeSpatialLayer?.querySelector('img');
  if (!image || !dialog || !dialogImage) return;
  dialogImage.src = image.currentSrc || image.src;
  dialogImage.alt = image.alt;
  if (dialogCaption) dialogCaption.textContent = activeSpatialLayer.querySelector('figcaption b')?.textContent || '';
  dialog.showModal();
  reachMetrikaGoal('map_open');
});

const revealElements = [...document.querySelectorAll('.lot-section .lot-heading, .lot-spatial, .lot-stats, .lot-facts-grid article, .lot-chapters__list li, .lot-concept__feature, .lot-real-grid button, .lot-location__grid, .lot-contact__inner')];
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealElements.forEach((element) => element.classList.add('lot-reveal'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealElements.forEach((element) => revealObserver.observe(element));
}

// The location atlas is deliberately revealed in calm editorial layers.
const locationSection = document.querySelector('.lot-location');
const locationAtlas = document.querySelector('[data-location-atlas]');
if (locationSection && 'IntersectionObserver' in window) {
  const atlasObserver = new IntersectionObserver(([entry]) => {
    const nearLocation = entry.isIntersecting;
    if (nearLocation) locationAtlas?.classList.add('is-atlas-visible');
    stickyCta?.classList.toggle('is-over-location', nearLocation);
    if (stickyCta) {
      const label = stickyCta.querySelector('[data-sticky-label]');
      label.textContent = nearLocation ? stickyCta.dataset.locationLabel : stickyCta.dataset.beforeLabel;
      stickyCta.href = nearLocation ? stickyCta.dataset.locationHref : stickyCta.dataset.beforeHref;
      stickyCta.dataset.event = nearLocation ? 'viewing_request' : 'materials_request';
    }
  }, { threshold: 0.1, rootMargin: '-12% 0px -12% 0px' });
  atlasObserver.observe(locationSection);
} else {
  locationAtlas?.classList.add('is-atlas-visible');
}

const contactSection = document.querySelector('#contacts');
if (contactSection && stickyCta && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => stickyCta.classList.toggle('is-near-contact', entry.isIntersecting), { threshold: .2 }).observe(contactSection);
}

const lotMap = document.querySelector('[data-lot-map]');
const lotMapFrame = lotMap?.querySelector('iframe');
let lotMapReady = false;
lotMapFrame?.addEventListener('load', () => { lotMapReady = true; lotMap?.classList.add('is-map-ready'); }, { once: true });
window.setTimeout(() => { if (!lotMapReady) lotMap?.classList.add('is-map-fallback'); }, 2800);

const dialog = document.querySelector('[data-lightbox-dialog]');
const dialogImage = dialog?.querySelector('[data-lightbox-image]');
const dialogCaption = dialog?.querySelector('[data-lightbox-caption]');
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-lightbox]');
  if (!trigger || !dialog || !dialogImage) return;
  dialogImage.src = trigger.dataset.image || trigger.getAttribute('src') || '';
  dialogImage.alt = trigger.querySelector('img')?.alt || '';
  if (dialogCaption) dialogCaption.textContent = trigger.dataset.caption || '';
  dialog.showModal();
});

dialog?.addEventListener('click', (event) => {
  if (event.target === dialog || event.target.closest('[data-lightbox-close]')) dialog.close();
});
document.querySelector('[data-concept-open]')?.addEventListener('click', () => {
  if (!dialog || !dialogImage || !conceptImage) return;
  dialogImage.src = conceptImage.currentSrc || conceptImage.src;
  dialogImage.alt = conceptImage.alt;
  if (dialogCaption) dialogCaption.textContent = 'Схема единого земельного актива 6,2 га';
  dialog.showModal();
  reachMetrikaGoal('map_open');
});

// Actual territory gallery: three visible slides, an emphasized center, and a seamless loop.
const actualSlider = document.querySelector('[data-actual-slider]');
const actualTrack = actualSlider?.querySelector('[data-actual-track]');
const actualOriginalSlides = [...(actualTrack?.querySelectorAll('figure') || [])];
const actualCount = actualSlider?.querySelector('[data-actual-count]');
const actualSlides = [...actualOriginalSlides];
let actualIndex = 1;
let actualTimer;
if (actualTrack && actualOriginalSlides.length > 1) {
  const prepend = actualOriginalSlides.at(-1).cloneNode(true); prepend.setAttribute('aria-hidden', 'true');
  const append = actualOriginalSlides.slice(0, 2).map((slide) => { const clone = slide.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); return clone; });
  actualTrack.prepend(prepend); actualTrack.append(...append); actualSlides.unshift(prepend); actualSlides.push(...append);
}
actualSlides.forEach((slide) => {
  const image = slide.querySelector('img');
  const caption = slide.querySelector('figcaption')?.textContent || '';
  if (!image) return;
  slide.dataset.lightbox = '';
  slide.dataset.image = image.currentSrc || image.src;
  slide.dataset.caption = caption;
  slide.tabIndex = 0;
  slide.setAttribute('role', 'button');
  slide.setAttribute('aria-label', `Открыть фотографию: ${caption}`);
});
actualTrack?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const slide = event.target.closest('[data-lightbox]');
  if (!slide) return;
  event.preventDefault();
  slide.click();
});
const paintActual = (animate = true) => {
  if (!actualTrack || !actualSlider) return;
  actualSlides.forEach((slide, index) => slide.classList.toggle('is-active', index === actualIndex));
  // offsetWidth stays tied to the real flex width and is unaffected by the
  // scale applied to the smaller side cards.
  const itemWidth = actualSlides[0]?.offsetWidth || (actualSlider.clientWidth / 2);
  actualTrack.style.transition = animate ? '' : 'none';
  actualTrack.style.transform = `translate3d(${actualSlider.clientWidth / 2 - (actualIndex + .5) * itemWidth}px,0,0)`;
  if (actualCount) actualCount.textContent = `${String(((actualIndex - 1 + actualOriginalSlides.length) % actualOriginalSlides.length) + 1).padStart(2, '0')} / ${String(actualOriginalSlides.length).padStart(2, '0')}`;
};
const startActual = () => { if (actualTimer || actualOriginalSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; actualTimer = window.setInterval(() => { actualIndex += 1; paintActual(); }, 4000); };
const stopActual = () => { if (actualTimer) { clearInterval(actualTimer); actualTimer = undefined; } };
const stepActual = (step) => { actualIndex += step; paintActual(); stopActual(); };
actualTrack?.addEventListener('transitionend', () => { if (actualIndex >= actualOriginalSlides.length + 1) { actualIndex = 1; paintActual(false); } if (actualIndex <= 0) { actualIndex = actualOriginalSlides.length; paintActual(false); } });
actualSlider?.querySelector('[data-actual-prev]')?.addEventListener('click', () => stepActual(-1));
actualSlider?.querySelector('[data-actual-next]')?.addEventListener('click', () => stepActual(1));
// A direct horizontal swipe follows the same seamless loop as the controls.
// Vertical movement is left untouched, so page scrolling stays natural on phones.
let actualSwipe;
actualSlider?.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.target.closest('button')) return;
  actualSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  stopActual();
});
actualSlider?.addEventListener('pointermove', (event) => {
  if (!actualSwipe || event.pointerId !== actualSwipe.id) return;
  const deltaX = event.clientX - actualSwipe.x;
  const deltaY = event.clientY - actualSwipe.y;
  if (!actualSwipe.horizontal && Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) actualSwipe.horizontal = true;
  if (actualSwipe.horizontal) event.preventDefault();
});
const finishActualSwipe = (event) => {
  if (!actualSwipe || event.pointerId !== actualSwipe.id) return;
  const distance = event.clientX - actualSwipe.x;
  if (actualSwipe.horizontal && Math.abs(distance) > 34) stepActual(distance < 0 ? 1 : -1);
  else startActual();
  actualSwipe = undefined;
};
actualSlider?.addEventListener('pointerup', finishActualSwipe);
actualSlider?.addEventListener('pointercancel', () => { actualSwipe = undefined; startActual(); });
if (actualSlider && 'IntersectionObserver' in window) { new IntersectionObserver(([entry]) => entry.isIntersecting ? startActual() : stopActual(), { threshold: .2 }).observe(actualSlider); }
paintActual();
window.addEventListener('resize', () => paintActual(false), { passive: true });

// The landscape plan opens on its meaningful middle area on a phone, not on an edge.
const conceptCanvas = document.querySelector('[data-concept-canvas]');
const conceptImage = conceptCanvas?.querySelector('img');
const centerConceptCanvas = () => {
  if (!conceptCanvas || !window.matchMedia('(max-width: 760px)').matches) return;
  conceptCanvas.scrollLeft = Math.max(0, (conceptCanvas.scrollWidth - conceptCanvas.clientWidth) / 2);
};
if (conceptImage?.complete) requestAnimationFrame(centerConceptCanvas);
else conceptImage?.addEventListener('load', () => requestAnimationFrame(centerConceptCanvas), { once: true });

// Documentary gallery: a restrained crossfade cue, paused for interaction and reduced motion.
const gallery = document.querySelector('[data-gallery]');
const galleryItems = [...(gallery?.querySelectorAll('[data-lightbox]') || [])];
const galleryPause = gallery?.querySelector('[data-gallery-pause]');
const galleryProgress = gallery?.querySelector('[data-gallery-progress]');
const galleryPrev = gallery?.querySelector('[data-gallery-prev]');
const galleryNext = gallery?.querySelector('[data-gallery-next]');
let galleryIndex = 0;
let galleryTimer;
let galleryPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const paintGallery = () => {
  galleryItems.forEach((item, index) => item.classList.toggle('is-gallery-muted', index !== galleryIndex));
  if (galleryProgress) { galleryProgress.classList.remove('is-running'); void galleryProgress.offsetWidth; galleryProgress.classList.toggle('is-running', !galleryPaused); }
};
const stopGallery = () => { if (galleryTimer) { window.clearInterval(galleryTimer); galleryTimer = undefined; reachMetrikaGoal('gallery_pause'); } };
const startGallery = () => {
  if (galleryPaused || galleryItems.length < 2) return;
  stopGallery();
  galleryTimer = window.setInterval(() => { galleryIndex = (galleryIndex + 1) % galleryItems.length; paintGallery(); reachMetrikaGoal('gallery_start', { index: galleryIndex + 1 }); }, 6000);
};
const setGalleryPaused = (paused) => {
  galleryPaused = paused;
  galleryPause?.setAttribute('aria-pressed', String(paused));
  if (galleryPause) galleryPause.textContent = paused ? 'Продолжить' : 'Пауза';
  paused ? stopGallery() : startGallery();
};
const selectGalleryItem = (step) => {
  if (!galleryItems.length) return;
  galleryIndex = (galleryIndex + step + galleryItems.length) % galleryItems.length;
  paintGallery();
  setGalleryPaused(true);
  reachMetrikaGoal('gallery_start', { index: galleryIndex + 1, manual: true });
};
paintGallery();
gallery?.addEventListener('mouseenter', () => stopGallery());
gallery?.addEventListener('mouseleave', () => startGallery());
gallery?.addEventListener('focusin', () => stopGallery());
gallery?.addEventListener('focusout', () => startGallery());
galleryPause?.addEventListener('click', () => setGalleryPaused(!galleryPaused));
galleryPrev?.addEventListener('click', () => selectGalleryItem(-1));
galleryNext?.addEventListener('click', () => selectGalleryItem(1));
if (gallery && 'IntersectionObserver' in window) {
  const galleryObserver = new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    startGallery();
    observer.disconnect();
  }, { threshold: 0.25 });
  galleryObserver.observe(gallery);
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-contact-channel]');
  if (action) reachMetrikaGoal('contact_click', { channel: action.dataset.contactChannel });
  const tracked = event.target.closest('[data-event]');
  if (tracked) reachMetrikaGoal(tracked.dataset.event);
});

initAnalyticsConsent();

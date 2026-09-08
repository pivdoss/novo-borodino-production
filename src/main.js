import './styles/main.css';
import './styles/lot-landing.css';
import './styles/investment.css';
import { initAnalyticsConsent, reachMetrikaGoal } from './analytics.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const dialog = document.querySelector('[data-lightbox-dialog]');
let restoreFocus;
const openImage = (image, caption, trigger) => {
  if (!dialog || !image) return;
  restoreFocus = trigger;
  const output = dialog.querySelector('[data-lightbox-image]');
  output.src = image.src;
  output.alt = image.alt;
  dialog.querySelector('[data-lightbox-caption]').textContent = caption || image.alt;
  dialog.showModal();
  document.body.style.overflow = 'hidden';
};
dialog?.querySelector('[data-lightbox-close]').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog?.addEventListener('close', () => { document.body.style.overflow = ''; restoreFocus?.focus({ preventScroll: true }); });
document.querySelector('[data-concept-open]')?.addEventListener('click', event => openImage(document.querySelector('[data-concept-canvas] img'), 'Схема состава: 71 участок и 1 га внутренних дорог. Исходные подписи сверяйте с актуальными документами.', event.currentTarget));

const menuButton = document.querySelector('[data-lot-menu]');
const menu = document.querySelector('#lot-mobile-menu');
const setMenu = open => {
  if (!menu) return;
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('is-menu-open', open);
  document.querySelector('main').inert = open;
  document.querySelector('footer').inert = open;
  if (open) menu.querySelector('a')?.focus();
  else menuButton.focus({ preventScroll: true });
};
menuButton?.addEventListener('click', () => setMenu(menu.hidden));
menu?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (!menu || menu.hidden) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key === 'Tab') {
    const items = [menuButton, ...menu.querySelectorAll('a')];
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
  }
});
window.matchMedia('(min-width:901px)').addEventListener('change', event => { if (event.matches && menu && !menu.hidden) setMenu(false); });

// Shared panorama controller. Measure the first clone's actual offset so the gap
// is included in the loop length; no assumed slide widths or half-scrollWidth.
document.querySelectorAll('[data-conveyor]').forEach(root => {
  const viewport = root.querySelector('[data-conveyor-window]');
  const track = root.querySelector('[data-conveyor-track]');
  const originals = [...track.children];
  if (originals.length < 2) return;
  const clones = originals.map(slide => { const clone = slide.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); clone.inert = true; clone.querySelectorAll('img').forEach(img => img.alt = ''); return clone; });
  track.append(...clones);
  let offset = 0, loop = 0, frame = 0, last = 0, visible = false, drag, paused = reducedMotion.matches;
  let hovering = false;
  const pauseButton = root.querySelector('[data-conveyor-pause]');
  const measure = () => { loop = clones[0].getBoundingClientRect().left - originals[0].getBoundingClientRect().left; paint(); };
  const paint = () => { if (loop) offset = ((offset % loop) + loop) % loop; track.style.transform = `translate3d(${-offset}px,0,0)`; };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
  const tick = time => { if (last) offset += Math.min(time-last, 50) * .026; last = time; paint(); frame = requestAnimationFrame(tick); };
  const sync = () => {
    pauseButton.textContent = paused ? 'Продолжить' : 'Пауза'; pauseButton.setAttribute('aria-pressed', String(paused));
    stop();
    if (visible && !paused && !hovering && !drag && !document.hidden && !dialog?.open && !reducedMotion.matches) frame = requestAnimationFrame(tick);
  };
  const step = direction => { offset += direction * loop / originals.length; paused = true; paint(); sync(); };
  root.querySelector('[data-conveyor-prev]').addEventListener('click', () => step(-1));
  root.querySelector('[data-conveyor-next]').addEventListener('click', () => step(1));
  pauseButton.addEventListener('click', () => { paused = !paused; sync(); });
  viewport.addEventListener('keydown', event => { if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); } });
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('pointerdown', event => { if (!event.isPrimary || event.button !== 0) return; drag = { id:event.pointerId, x:event.clientX, y:event.clientY, start:offset }; stop(); });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX-drag.x, dy = event.clientY-drag.y;
    if (!drag.horizontal && Math.abs(dx)>8 && Math.abs(dx)>Math.abs(dy)) { drag.horizontal = true; viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging'); }
    if (drag.horizontal) { event.preventDefault(); offset = drag.start-dx; paint(); }
  });
  const finish = () => { drag = undefined; viewport.classList.remove('is-dragging'); sync(); };
  viewport.addEventListener('pointerup', finish); viewport.addEventListener('pointercancel', finish); viewport.addEventListener('lostpointercapture', finish);
  viewport.addEventListener('mouseenter', () => { hovering = true; sync(); }); viewport.addEventListener('mouseleave', () => { hovering = false; sync(); });
  viewport.addEventListener('focusin', () => { hovering = true; sync(); }); viewport.addEventListener('focusout', () => { hovering = false; sync(); });
  new ResizeObserver(measure).observe(viewport);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold:.1}).observe(viewport);
  document.addEventListener('visibilitychange', sync); reducedMotion.addEventListener('change', sync); dialog?.addEventListener('close', sync);
  new MutationObserver(sync).observe(dialog, {attributes:true,attributeFilter:['open']});
  measure(); sync();
});

const slider = document.querySelector('[data-actual-slider]');
if (slider) {
  const viewport = slider.querySelector('.actual-slider__viewport');
  const track = slider.querySelector('[data-actual-track]');
  const originals = [...track.children];
  const clone = slide => { const el = slide.cloneNode(true); el.setAttribute('aria-hidden','true'); el.inert = true; return el; };
  track.prepend(clone(originals.at(-1))); track.append(clone(originals[0]),clone(originals[1]));
  const slides = [...track.children];
  let index=1, timer, wrapping, locked=false, visible=false, paused=reducedMotion.matches, interaction=false, drag, suppressClickUntil=0;
  const count = slider.querySelector('[data-actual-count]');
  const pauseButton = slider.querySelector('[data-actual-pause]');
  const paint = animate => {
    slides.forEach((slide,i) => {
      slide.classList.toggle('is-active', i===index);
      slide.querySelector('button').tabIndex = i===index && !slide.inert ? 0 : -1;
      if (Math.abs(i-index)<=1) slide.querySelector('img').loading='eager';
    });
    track.style.transition = animate && !reducedMotion.matches ? '' : 'none';
    track.style.transform = `translate3d(${viewport.clientWidth/2-(index+.5)*parseFloat(getComputedStyle(slides[0]).width)}px,0,0)`;
    count.textContent = `${String((index-1+originals.length)%originals.length+1).padStart(2,'0')} / ${originals.length}`;
  };
  const normalize = () => { clearTimeout(wrapping); if (index>originals.length) index=1; if (index<1) index=originals.length; paint(false); locked=false; track.setAttribute('aria-busy','false'); };
  const step = direction => { if (locked) return; locked=true; track.setAttribute('aria-busy','true'); index+=direction; paint(true); if (reducedMotion.matches) normalize(); else wrapping=setTimeout(normalize,720); };
  const sync = () => {
    clearInterval(timer); pauseButton.textContent=paused?'Продолжить':'Пауза'; pauseButton.setAttribute('aria-pressed',String(paused));
    if (visible && !paused && !interaction && !drag && !document.hidden && !dialog.open && !reducedMotion.matches) timer=setInterval(()=>step(1),4000);
  };
  track.addEventListener('transitionend',event=>{ if(event.target===track && event.propertyName==='transform') normalize(); });
  slider.querySelector('[data-actual-prev]').addEventListener('click',()=>{step(-1);sync();});
  slider.querySelector('[data-actual-next]').addEventListener('click',()=>{step(1);sync();});
  pauseButton.addEventListener('click',()=>{paused=!paused;sync();});
  slider.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(event.key==='ArrowRight'?1:-1);sync();}});
  viewport.addEventListener('dragstart',event=>event.preventDefault());
  viewport.addEventListener('pointerdown',event=>{if(!event.isPrimary || event.button!==0 || locked)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};sync();});
  viewport.addEventListener('pointermove',event=>{
    if(!drag || drag.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.horizontal && Math.abs(dx)>10 && Math.abs(dx)>Math.abs(dy)){drag.horizontal=true;viewport.setPointerCapture(event.pointerId);}
    if(drag.horizontal){event.preventDefault();track.style.transition='none';track.style.transform=`translate3d(${viewport.clientWidth/2-(index+.5)*parseFloat(getComputedStyle(slides[0]).width)+dx}px,0,0)`;}
  });
  viewport.addEventListener('pointerup',event=>{if(!drag || drag.id!==event.pointerId)return;const dx=event.clientX-drag.x;if(drag.horizontal){suppressClickUntil=Date.now()+400;if(Math.abs(dx)>35)step(dx<0?1:-1);else paint(true);}drag=undefined;sync();});
  viewport.addEventListener('pointercancel',()=>{drag=undefined;paint(false);sync();});
  viewport.addEventListener('click',event=>{if(Date.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();return;}const button=event.target.closest('[data-photo-open]');if(button){openImage(button.querySelector('img'),button.querySelector('.photo-caption').textContent,button);reachMetrikaGoal('gallery_open');}},true);
  viewport.addEventListener('mouseenter',()=>{interaction=true;sync();});viewport.addEventListener('mouseleave',()=>{interaction=false;sync();});
  slider.addEventListener('focusin',()=>{interaction=true;sync();});slider.addEventListener('focusout',event=>{if(!slider.contains(event.relatedTarget)){interaction=false;sync();}});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.1}).observe(viewport);
  new ResizeObserver(()=>{normalize();}).observe(viewport);
  document.addEventListener('visibilitychange',sync);reducedMotion.addEventListener('change',sync);dialog.addEventListener('close',sync);
  new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});paint(false);sync();
}

const mapButton=document.querySelector('[data-map-activate]');
mapButton?.addEventListener('click',()=>{
  const frame=document.querySelector('[data-lot-map] iframe'),status=document.querySelector('[data-map-status]');
  frame.src=frame.dataset.src;frame.hidden=false;mapButton.hidden=true;status.hidden=false;
  frame.addEventListener('load',()=>{status.hidden=true;},{once:true});reachMetrikaGoal('map_open');
});

const sticky=document.querySelector('[data-sticky-cta]');
const mobileBar=document.querySelector('[data-mobile-contact-bar]');
let scrollScheduled=false;
const updateSticky=()=>{
  scrollScheduled=false;if(!sticky)return;
  const progress=window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const competing=[...document.querySelectorAll('.lot-button--accent,#contacts,.cookie-banner:not([hidden])')].some(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight && r.bottom>88;});
  const hidden=progress<.28 || competing || dialog?.open || document.querySelector('[data-contact-choice]')?.open || !!menu && !menu.hidden;
  sticky.hidden=hidden;
  if(mobileBar)mobileBar.hidden=hidden;
};
window.addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateSticky);}},{passive:true});
window.addEventListener('resize',updateSticky,{passive:true});
if(dialog)new MutationObserver(updateSticky).observe(dialog,{attributes:true,attributeFilter:['open']});
if(menu)new MutationObserver(updateSticky).observe(menu,{attributes:true,attributeFilter:['hidden']});
document.addEventListener('analytics-consent-change',updateSticky);
document.addEventListener('click',event=>{
  const el=event.target.closest('a,button');if(!el)return;
  const section=el.closest('section')?.id || (el.closest('header')?'header':'footer');
  if(el.dataset.contactChannel){reachMetrikaGoal('contact_click',{channel:el.dataset.contactChannel,section});const name={phone:'click_phone_call',telegram:'lead_telegram_click',whatsapp:'lead_whatsapp_click'}[el.dataset.contactChannel];if(name)reachMetrikaGoal(name,{section});}
  if(el.dataset.event && !(el.dataset.event==='phone_click' && el.dataset.contactChannel==='phone'))reachMetrikaGoal(el.dataset.event,{section});
});
initAnalyticsConsent();updateSticky();

const contactChoice=document.querySelector('[data-contact-choice]');
let choiceTrigger;
document.querySelector('[data-contact-choice-open]')?.addEventListener('click',event=>{choiceTrigger=event.currentTarget;contactChoice.showModal();document.body.style.overflow='hidden';updateSticky();});
contactChoice?.querySelector('button').addEventListener('click',()=>contactChoice.close());
contactChoice?.addEventListener('close',()=>{document.body.style.overflow='';updateSticky();choiceTrigger?.focus();});

// Campaign codes are visible in the draft; users decide whether to send them.
const campaignQuery=new URLSearchParams(location.search);
const campaignParts=['utm_source','utm_campaign','utm_content','utm_term'].flatMap(key=>{
  const value=campaignQuery.get(key);return value && /^(?:[a-z][a-z0-9_-]{0,79}|[0-9]{1,9})$/i.test(value)?[`${key.replace('utm_','')}: ${value}`]:[];
});
if(campaignParts.length)document.querySelectorAll('a[data-contact-channel="whatsapp"],a[data-contact-channel="telegram"]').forEach(link=>{
  const url=new URL(link.href);if(!['wa.me','t.me'].includes(url.hostname))return;
  url.searchParams.set('text',`${url.searchParams.get('text')||'Здравствуйте! Интересует массив 6,2 га в Новом Бородино.'}\n[${campaignParts.join(' | ')}]`);link.href=url.href;
});

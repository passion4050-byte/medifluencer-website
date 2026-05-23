/* Medifluencer - main.js (safe mode v4 + Google Translate) */
(function () {
  'use strict';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COARSE = window.matchMedia('(pointer: coarse)').matches;
  let gtReady = false;

  // ---- Language ----
  const SUPPORTED = ['ko','en'];
  function setLang(lang){
    if (!SUPPORTED.includes(lang)) lang='ko';
    document.documentElement.setAttribute('lang',lang);
    try{localStorage.setItem('mf_lang',lang);}catch(e){}
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    const t = document.querySelector('title');
    if (t && t.dataset.ko && t.dataset.en) t.textContent = lang==='ko'? t.dataset.ko : t.dataset.en;
    // Apply Google Translate as fallback for any KR text outside our [data-lang] system
    triggerGoogleTranslate(lang);
  }
  function initLang(){
    let s=null; try{s=localStorage.getItem('mf_lang');}catch(e){}
    const init = s || (navigator.language && navigator.language.startsWith('en') ? 'en':'ko');
    setLang(init);
    document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  }

  // ---- Google Translate integration ----
  function initGoogleTranslate(){
    // Mark our hand-crafted EN content so GT doesn't re-translate it
    document.querySelectorAll('[data-lang="en"], code, .mono, .brand-name, .brand-sub').forEach(el=>{
      el.setAttribute('translate','no');
      el.classList.add('notranslate');
    });
    // Create hidden container
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.cssText = 'position:absolute;top:-2000px;left:-2000px;visibility:hidden;pointer-events:none';
      document.body.appendChild(div);
    }
    window.googleTranslateElementInit = function(){
      try {
        new google.translate.TranslateElement({
          pageLanguage: 'ko',
          includedLanguages: 'en',
          autoDisplay: false,
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
        gtReady = true;
        // Apply stored language if EN
        const stored = (function(){try{return localStorage.getItem('mf_lang');}catch(e){return null;}})();
        if (stored === 'en') triggerGoogleTranslate('en');
      } catch(e) { console.warn('GT init failed', e); }
    };
    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }

  function triggerGoogleTranslate(lang){
    const tryFire = (attempts=0) => {
      const sel = document.querySelector('.goog-te-combo');
      if (sel) {
        const target = lang === 'en' ? 'en' : '';
        if (sel.value !== target) {
          sel.value = target;
          sel.dispatchEvent(new Event('change'));
        }
      } else if (attempts < 25) {
        setTimeout(()=>tryFire(attempts+1), 200);
      }
    };
    tryFire();
  }

  // ---- Sticky header scrolled state ----
  function initHeader(){
    const h = document.querySelector('.site-header'); if(!h) return;
    const up=()=>h.classList.toggle('scrolled', window.scrollY>8);
    window.addEventListener('scroll',up,{passive:true}); up();
  }

  // ---- Mobile menu ----
  function initMenu(){
    const t = document.querySelector('.menu-toggle');
    const n = document.querySelector('.nav-main');
    if(!t||!n) return;
    t.addEventListener('click',()=>{t.classList.toggle('open');n.classList.toggle('open');});
    n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{t.classList.remove('open');n.classList.remove('open');}));
  }

  // ---- Auto-stagger ----
  function initAutoStagger(){
    const sel = '.stages, .pillars, .value-grid, .ctype-grid, .bmodel-grid, .tier-grid, .cases, .diag-grid, .kpi-roadmap, .trust-grid, .track-row, .process';
    document.querySelectorAll(sel).forEach(g=>{
      if (!g.hasAttribute('data-reveal')) g.setAttribute('data-reveal','');
      g.classList.add('stagger');
    });
  }

  // ---- Reveal (SAFE) ----
  function initReveal(){
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)){
      els.forEach(e=>e.classList.add('in'));
      return;
    }
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    },{threshold:0.04, rootMargin:'0px 0px -30px 0px'});
    els.forEach(e=>obs.observe(e));
    document.querySelectorAll('.hero [data-reveal], .page-hero [data-reveal], .product-hero [data-reveal]').forEach(el=>el.classList.add('in'));
    setTimeout(()=>{
      document.querySelectorAll('[data-reveal]:not(.in)').forEach(el=>el.classList.add('in'));
    }, 800);
  }

  // ---- Counter ----
  function animateNum(el){
    const tg = parseFloat(el.dataset.count); if (isNaN(tg)) return;
    const dur=1400, start=performance.now(), fmt=el.dataset.fmt||'int';
    const step=(now)=>{
      const t = Math.min(1,(now-start)/dur);
      const e = 1 - Math.pow(1-t,3);
      const v = tg*e;
      el.textContent = fmt==='int' ? Math.round(v).toLocaleString() : v.toFixed(1);
      if (t<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initCounters(){
    const ns = document.querySelectorAll('[data-count]');
    if (!ns.length) return;
    if (!('IntersectionObserver' in window)){ ns.forEach(animateNum); return; }
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ animateNum(e.target); obs.unobserve(e.target); }});
    },{threshold:0.3});
    ns.forEach(n=>obs.observe(n));
    document.querySelectorAll('.hero [data-count], .product-hero [data-count]').forEach(n=>{ animateNum(n); obs.unobserve(n); });
  }

  // ---- Contact form ----
  function initForm(){
    const form = document.querySelector('form[data-contact]'); if(!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = '<span data-lang="ko">전송 중…</span><span data-lang="en">Sending…</span>'; }
      const d = Object.fromEntries(new FormData(form).entries());
      const lang = document.documentElement.lang || 'ko';
      try {
        if (typeof SB === 'undefined') throw new Error('Supabase client missing');
        await SB.sbInsert('inquiries', {
          name: d.name || '',
          org: d.org || null,
          email: d.email || '',
          topic: d.topic || null,
          message: d.message || '',
          source: 'website',
          user_agent: navigator.userAgent.slice(0, 240),
        });
        form.innerHTML = '<div style="text-align:center;padding:40px 20px"><div style="font-family:Instrument Serif,serif;font-style:italic;font-size:32px;color:var(--navy);letter-spacing:-0.02em;margin-bottom:14px">' + (lang==='ko'?'고맙습니다.':'Thank you.') + '</div><p style="color:var(--ink-3);font-size:15px;line-height:1.7;max-width:42ch;margin:0 auto">' + (lang==='ko'?'요청이 정상적으로 접수되었습니다.<br>24시간 안에 1:1로 회신드리겠습니다.':'Your inquiry has been received.<br>We will reply within 24 hours.') + '</p><a href="index.html" style="display:inline-block;margin-top:32px;font-size:13px;color:var(--ink-3);border-bottom:1px solid var(--gold);padding-bottom:2px">← ' + (lang==='ko'?'메인으로':'Back home') + '</a></div>';
      } catch (err) {
        console.error(err);
        alert((lang==='ko'?'전송 중 오류가 발생했습니다.':'Submission failed.') + '\n' + err.message);
        if (btn) { btn.disabled = false; btn.innerHTML = orig; }
      }
    });
  }

  // ---- Scroll drift ----
  function initScrollDrift(){
    if (REDUCED) return;
    let ticking=false;
    const up=()=>{ document.documentElement.style.setProperty('--sy', window.scrollY); ticking=false; };
    window.addEventListener('scroll',()=>{ if(!ticking){ requestAnimationFrame(up); ticking=true; } },{passive:true});
    up();
  }

  // ---- Mouse-move aurora ----
  function initMouseMove(){
    if (REDUCED || COARSE) return;
    const heroes = document.querySelectorAll('.hero, .product-hero, .page-hero');
    heroes.forEach(hero=>{
      let raf;
      hero.addEventListener('mousemove',(e)=>{
        if (raf) return;
        raf = requestAnimationFrame(()=>{
          const r = hero.getBoundingClientRect();
          const mx = ((e.clientX-r.left)/r.width - 0.5);
          const my = ((e.clientY-r.top)/r.height - 0.5);
          const aurora = hero.querySelector('.aurora');
          if (aurora){
            aurora.style.setProperty('--mx', mx.toFixed(3));
            aurora.style.setProperty('--my', my.toFixed(3));
          }
          raf=null;
        });
      });
      hero.addEventListener('mouseleave',()=>{
        const a = hero.querySelector('.aurora');
        if (a){ a.style.setProperty('--mx',0); a.style.setProperty('--my',0); }
      });
    });
  }

  // ---- Cursor follow ----
  function initCursorFollow(){
    if (REDUCED || COARSE) return;
    if (window.innerWidth < 980) return;
    const el = document.createElement('div');
    el.className='cursor-follow';
    document.body.appendChild(el);
    document.body.classList.add('has-cursor');
    let tx=innerWidth/2, ty=innerHeight/2, cx=tx, cy=ty;
    document.addEventListener('mousemove',(e)=>{ tx=e.clientX; ty=e.clientY; },{passive:true});
    const loop=()=>{
      cx += (tx-cx)*0.12;
      cy += (ty-cy)*0.12;
      el.style.transform = 'translate(' + cx + 'px, ' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    };
    loop();
  }

  // ---- Scroll progress bar ----
  function initScrollProgress(){
    if (REDUCED) return;
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    let raf;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
      raf = null;
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  // ---- Scroll-to-top ----
  function initScrollTop(){
    const btn = document.createElement('button');
    btn.className = 'scroll-top';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
    const update = () => btn.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---- Heading underline reveal ----
  function initHeadingUnderline(){
    if (!('IntersectionObserver' in window)) return;
    const heads = document.querySelectorAll('.section-head');
    if (!heads.length) return;
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }});
    }, { threshold:0.3 });
    heads.forEach(h=>obs.observe(h));
  }

  function start(){
    initGoogleTranslate();
    initLang();
    initHeader();
    initMenu();
    initAutoStagger();
    initReveal();
    initCounters();
    initForm();
    initScrollDrift();
    initMouseMove();
    initCursorFollow();
    initScrollProgress();
    initScrollTop();
    initHeadingUnderline();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

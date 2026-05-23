/* Medifluencer - main.js (safe mode v2) */
(function () {
  'use strict';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COARSE = window.matchMedia('(pointer: coarse)').matches;

  // ---- Language ----
  const SUPPORTED = ['ko','en'];
  function setLang(lang){
    if (!SUPPORTED.includes(lang)) lang='ko';
    document.documentElement.setAttribute('lang',lang);
    try{localStorage.setItem('mf_lang',lang);}catch(e){}
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    const t = document.querySelector('title');
    if (t && t.dataset.ko && t.dataset.en) t.textContent = lang==='ko'? t.dataset.ko : t.dataset.en;
  }
  function initLang(){
    let s=null; try{s=localStorage.getItem('mf_lang');}catch(e){}
    const init = s || (navigator.language && navigator.language.startsWith('en') ? 'en':'ko');
    setLang(init);
    document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang)));
  }

  // ---- Header ----
  function initHeader(){
    const h = document.querySelector('.site-header'); if(!h) return;
    const up=()=>h.classList.toggle('scrolled', window.scrollY>8);
    window.addEventListener('scroll',up,{passive:true}); up();
  }

  // ---- Menu ----
  function initMenu(){
    const t = document.querySelector('.menu-toggle');
    const n = document.querySelector('.nav-main');
    if(!t||!n) return;
    t.addEventListener('click',()=>{t.classList.toggle('open');n.classList.toggle('open');});
    n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{t.classList.remove('open');n.classList.remove('open');}));
  }

  // ---- Auto stagger ----
  function initAutoStagger(){
    const sel = '.stages, .pillars, .value-grid, .ctype-grid, .bmodel-grid, .tier-grid, .cases, .diag-grid, .kpi-roadmap, .trust-grid, .track-row, .process';
    document.querySelectorAll(sel).forEach(g=>{
      if (!g.hasAttribute('data-reveal')) g.setAttribute('data-reveal','');
      g.classList.add('stagger');
    });
  }

  // ---- Reveal (safe: content visible by default, animation on enter) ----
  function initReveal(){
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    // If IO unavailable: just mark all as visible (animation skipped)
    if (!('IntersectionObserver' in window)){
      els.forEach(e=>e.classList.add('in'));
      return;
    }
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    },{threshold:0.04, rootMargin:'0px 0px -30px 0px'});
    els.forEach(e=>obs.observe(e));

    // Hero & page-hero & product-hero items - mark as visible immediately on load
    document.querySelectorAll('.hero [data-reveal], .page-hero [data-reveal], .product-hero [data-reveal]').forEach(el=>{
      el.classList.add('in');
    });

    // Safety net: after 800ms, any [data-reveal] that hasn\'t been activated yet is shown
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
    // Hero counters - run immediately
    document.querySelectorAll('.hero [data-count], .product-hero [data-count]').forEach(n=>{ animateNum(n); obs.unobserve(n); });
  }

  // ---- Form (Supabase insert) ----
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
          phone: d.phone || null,
          email: d.email || '',
          topic: d.topic || null,
          message: d.message || '',
          source: 'website',
          user_agent: navigator.userAgent.slice(0, 240),
        });
        form.innerHTML = `<div style="text-align:center;padding:40px 20px">
          <div style="font-family:'Instrument Serif',serif;font-style:italic;font-size:32px;color:var(--navy);letter-spacing:-0.02em;margin-bottom:14px">${lang==='ko'?'고맙습니다.':'Thank you.'}</div>
          <p style="color:var(--ink-3);font-size:15px;line-height:1.7;max-width:42ch;margin:0 auto">${lang==='ko'?'요청이 정상적으로 접수되었습니다.<br>24시간 안에 1:1로 회신드리겠습니다.':'Your inquiry has been received.<br>We will reply within 24 hours.'}</p>
          <a href="index.html" style="display:inline-block;margin-top:32px;font-size:13px;color:var(--ink-3);border-bottom:1px solid var(--gold);padding-bottom:2px">← ${lang==='ko'?'메인으로':'Back home'}</a>
        </div>`;
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

  // ---- Mouse move ----
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
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  function start(){
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
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

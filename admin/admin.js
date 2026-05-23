/* Medifluencer Admin · shared utilities · v2
   - Mobile hamburger drawer
   - Autosave helper (localStorage)
   - Search/filter helpers
   - Storage upload helper
*/
(function (global) {
  // ------- Auth guard -------
  function guard() {
    if (!SB.sbAuth.isAuthenticated()) {
      // Avoid redirect loops if we're already on login
      if (!/login(\.html)?$/.test(location.pathname)) {
        location.replace('login.html');
      }
      throw new Error('redirecting');
    }
    // Best-effort token refresh in the background (non-blocking)
    const s = SB.sbAuth.getSession();
    if (s && s.expires_at) {
      const ttl = (s.expires_at * 1000) - Date.now();
      if (ttl < 5 * 60 * 1000) { // <5min left
        SB.sbAuth.refresh().catch(() => {});
      }
    }
  }
  function userEmail() {
    const s = SB.sbAuth.getSession();
    return (s && s.user && s.user.email) || '—';
  }

  // ------- Toast -------
  function toast(msg, opts = {}) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.classList.toggle('toast-err', !!opts.error);
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), opts.ms || 2400);
  }

  // ------- Date formatters -------
  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', { year:'2-digit', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  }
  function fmtDateShort(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR', { year:'numeric', month:'short', day:'numeric' });
  }
  function fmtRelative(iso) {
    if (!iso) return '—';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
    if (diff < 86400*7) return `${Math.floor(diff/86400)}일 전`;
    return fmtDateShort(iso);
  }

  // ------- HTML escape -------
  function escape(s) {
    return (s ?? '').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  // ------- Shell (sidebar + mobile topbar) -------
  function buildSidebar(active) {
    const nav = [
      { key:'inbox',    href:'inbox.html',    label:'Inbox',    svg:'<path d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"/>' },
      { key:'posts',    href:'posts.html',    label:'Posts',    svg:'<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/>' },
      { key:'settings', href:'settings.html', label:'Settings', svg:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005.6 15a1.65 1.65 0 00-1.51-1H4a2 2 0 110-4h.09A1.65 1.65 0 005.6 9 1.65 1.65 0 005.27 7.18l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.13.31.33.6.58.85a1.65 1.65 0 001.42.51H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
    ];
    const items = nav.map(n => `
      <a href="${n.href}" class="${active === n.key ? 'active':''}" data-nav="${n.key}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${n.svg}</svg>
        <span>${n.label}</span>
        ${n.key === 'inbox' ? '<span class="badge" id="inboxBadge" style="display:none">0</span>' : ''}
      </a>`).join('');

    return `
<aside class="admin-side" id="adminSide">
  <a class="brand" href="inbox.html">
    <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none"><path d="M5 5h2.6l3.4 8 3.4-8H17v14h-2.1V9.3L11.6 19h-1.2L7.1 9.3V19H5z" fill="#B89567"/></svg></span>
    <span class="brand-text"><strong>Medifluencer</strong><small>Admin</small></span>
  </a>
  <a class="quick-site" href="../index.html" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
    <span>메인 사이트 보기</span>
  </a>
  <h6>Workspace</h6>
  <nav class="admin-nav">${items}</nav>
  <div class="side-footer">
    <div class="side-footer-label">Signed in as</div>
    <div class="side-footer-email" id="adminEmail">${escape(userEmail())}</div>
    <button class="signout-btn" id="signoutBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
      Sign out
    </button>
  </div>
</aside>`;
  }

  function buildTopbar() {
    return `
<div class="mobile-topbar">
  <a class="brand" href="inbox.html">
    <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none"><path d="M5 5h2.6l3.4 8 3.4-8H17v14h-2.1V9.3L11.6 19h-1.2L7.1 9.3V19H5z" fill="#B89567"/></svg></span>
    <span class="brand-text">Medifluencer<small>Admin</small></span>
  </a>
  <button class="hamburger" id="adminHamburger" aria-label="메뉴 열기" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
</div>
<div class="side-backdrop" id="sideBackdrop"></div>`;
  }

  function attachShell(activeKey) {
    guard();
    const shell = document.querySelector('.admin-shell');

    // mobile topbar + backdrop at very top of body (outside the grid)
    const topbarWrap = document.createElement('div');
    topbarWrap.innerHTML = buildTopbar();
    while (topbarWrap.firstChild) document.body.insertBefore(topbarWrap.firstChild, document.body.firstElementChild);

    // sidebar MUST be inside .admin-shell (grid container) as the first child
    // so the grid layout (260px sidebar + 1fr main) actually works.
    const sideWrap = document.createElement('div');
    sideWrap.innerHTML = buildSidebar(activeKey);
    shell.insertBefore(sideWrap.firstElementChild, shell.firstElementChild);

    // Sign out
    document.getElementById('signoutBtn').addEventListener('click', async () => {
      try { await SB.sbAuth.signOut(); } catch(e) {}
      location.href = 'login.html';
    });

    // Hamburger toggle
    const ham = document.getElementById('adminHamburger');
    const backdrop = document.getElementById('sideBackdrop');
    const closeSide = () => {
      document.body.classList.remove('side-open');
      ham.setAttribute('aria-expanded', 'false');
    };
    const openSide = () => {
      document.body.classList.add('side-open');
      ham.setAttribute('aria-expanded', 'true');
    };
    ham.addEventListener('click', () => {
      document.body.classList.contains('side-open') ? closeSide() : openSide();
    });
    backdrop.addEventListener('click', closeSide);
    // Close on nav click (mobile)
    document.querySelectorAll('.admin-nav a').forEach(a => {
      a.addEventListener('click', () => { if (window.innerWidth <= 860) closeSide(); });
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSide(); });
  }

  // ------- Skeleton row generator -------
  function skeletonRows(cols, rows = 6) {
    const cellSk = '<td><span class="sk sk-line w-80"></span><span class="sk sk-line w-40"></span></td>';
    const body = Array.from({ length: rows }).map(() =>
      '<tr class="sk-row">' + Array.from({ length: cols }).map(() => cellSk).join('') + '</tr>'
    ).join('');
    return body;
  }

  // ------- Autosave (localStorage) -------
  function autosave(key, getValues, opts = {}) {
    const interval = opts.interval || 2000;
    const indicator = opts.indicator; // optional DOM element
    let timer = null;
    let dirty = false;

    function setState(state) {
      if (!indicator) return;
      indicator.classList.remove('saving','saved');
      if (state) indicator.classList.add(state);
      if (state === 'saving') indicator.querySelector('.label').textContent = '저장 중…';
      if (state === 'saved')  indicator.querySelector('.label').textContent = '자동 저장됨 · ' + new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
    }

    function save() {
      try {
        const v = getValues();
        localStorage.setItem(key, JSON.stringify({ v, at: Date.now() }));
        setState('saved');
      } catch(e) { /* quota etc */ }
      dirty = false;
    }

    function schedule() {
      dirty = true;
      setState('saving');
      clearTimeout(timer);
      timer = setTimeout(save, interval);
    }

    function load() {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch(e) { return null; }
    }

    function clear() {
      localStorage.removeItem(key);
      setState(null);
    }

    return { schedule, save, load, clear, isDirty: () => dirty };
  }

  // ------- Filter helper (in-memory) -------
  function filterRows(rows, { search, fields = [], status }) {
    const q = (search || '').trim().toLowerCase();
    return rows.filter(r => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return fields.some(f => ((r[f] || '') + '').toLowerCase().includes(q));
    });
  }

  // ------- Storage upload (Supabase) -------
  async function uploadImage(file, opts = {}) {
    const bucket = opts.bucket || 'public-media';
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const safe = (opts.prefix || 'img') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.' + ext;
    const s = SB.sbAuth.getSession();
    if (!s || !s.access_token) throw new Error('Not signed in');
    const url = `${SB.SUPABASE_URL}/storage/v1/object/${bucket}/${safe}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${s.access_token}`,
        'apikey': SB.ANON_KEY,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'false'
      },
      body: file
    });
    if (!res.ok) throw new Error('Upload failed: ' + res.status + ' ' + await res.text());
    const publicUrl = `${SB.SUPABASE_URL}/storage/v1/object/public/${bucket}/${safe}`;
    return { path: safe, publicUrl };
  }

  global.MFAdmin = {
    attachShell, guard, userEmail,
    toast, fmtDate, fmtDateShort, fmtRelative, escape,
    skeletonRows, autosave, filterRows, uploadImage,
    _anon: null, // set by host page if needed
  };
})(window);

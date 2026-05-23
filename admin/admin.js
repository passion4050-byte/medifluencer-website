/* Medifluencer Admin · shared utilities */
(function (global) {
  // Redirect to login if not authenticated
  function guard() {
    if (!SB.sbAuth.isAuthenticated()) {
      location.href = 'login.html';
      throw new Error('redirecting');
    }
  }
  function userEmail() {
    const s = SB.sbAuth.getSession();
    return (s && s.user && s.user.email) || '—';
  }

  function toast(msg, ms = 2400) {
    let t = document.querySelector('.toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), ms);
  }

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

  function escape(s) {
    return (s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  function buildShell(active) {
    const nav = [
      { key:'inbox',     href:'inbox.html',     label:'Inbox',     svg:'<path d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"/>' },
      { key:'posts',     href:'posts.html',     label:'Posts',     svg:'<path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/>' },
      { key:'settings',  href:'settings.html',  label:'Settings',  svg:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 005.6 15a1.65 1.65 0 00-1.51-1H4a2 2 0 110-4h.09A1.65 1.65 0 005.6 9 1.65 1.65 0 005.27 7.18l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.13.31.33.6.58.85a1.65 1.65 0 001.42.51H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
    ];
    const items = nav.map(n => `
      <a href="${n.href}" class="${active === n.key ? 'active':''}" data-nav="${n.key}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${n.svg}</svg>
        <span>${n.label}</span>
        ${n.key === 'inbox' ? '<span class="badge" id="inboxBadge" style="display:none">0</span>' : ''}
      </a>`).join('');

    return `
<aside class="admin-side">
  <a class="brand" href="inbox.html">
    <span class="brand-mark"><svg viewBox="0 0 24 24" fill="none"><path d="M5 5h2.6l3.4 8 3.4-8H17v14h-2.1V9.3L11.6 19h-1.2L7.1 9.3V19H5z" fill="#B89567"/></svg></span>
    <span class="brand-text"><strong>Medifluencer</strong><small>Admin</small></span>
  </a>
  <h6>Workspace</h6>
  <nav class="admin-nav">${items}</nav>
  <div class="footer">
    <div>Signed in as</div>
    <div style="color:#fff;font-size:13px;margin-top:2px" id="adminEmail">${escape(userEmail())}</div>
    <button id="signoutBtn">Sign out</button>
    <div style="margin-top:14px"><a href="../index.html" style="color:#B89567;font-size:11.5px;letter-spacing:.04em">↗ 메인 사이트</a></div>
  </div>
</aside>`;
  }

  function attachShell(activeKey) {
    guard();
    const shellHtml = buildShell(activeKey);
    const container = document.createElement('div');
    container.innerHTML = shellHtml;
    const aside = container.firstElementChild;
    document.body.insertBefore(aside, document.body.firstElementChild);

    document.getElementById('signoutBtn').addEventListener('click', async () => {
      await SB.sbAuth.signOut();
      location.href = 'login.html';
    });
  }

  global.MFAdmin = { attachShell, guard, userEmail, toast, fmtDate, fmtDateShort, escape };
})(window);

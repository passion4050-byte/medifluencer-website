/* Medifluencer · Supabase client (lightweight, no SDK)
 * Direct REST calls with anon publishable key.
 * Provides:
 *   sbInsert(table, row)
 *   sbSelect(table, query)
 *   sbUpdate(table, id, patch)
 *   sbDelete(table, id)
 *   sbAuth.signInWithPassword({email,password})
 *   sbAuth.signOut()
 *   sbAuth.getSession()
 *   sbAuth.updateUser({password})
 */
(function (global) {
  const SUPABASE_URL  = 'https://ayozomzmoctmlwrlfbkx.supabase.co';
  const ANON_KEY      = 'sb_publishable_9NO6wu98kFx2OpM33gsq2g_96D6OLMv';
  const STORAGE_KEY   = 'mf_session';

  function getSession() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { return null; }
  }
  function setSession(s) {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  }

  function headers(authed) {
    const h = {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    };
    if (authed) {
      const s = getSession();
      if (s && s.access_token) h['Authorization'] = `Bearer ${s.access_token}`;
    } else {
      h['Authorization'] = `Bearer ${ANON_KEY}`;
    }
    return h;
  }

  async function sbInsert(table, row) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers(true), 'Prefer': 'return=representation' },
      body: JSON.stringify(row),
    });
    if (!res.ok) throw new Error(`Insert failed: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async function sbSelect(table, queryString = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}${queryString}`;
    const res = await fetch(url, { headers: headers(true) });
    if (!res.ok) throw new Error(`Select failed: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async function sbUpdate(table, idColAndValue, patch) {
    // idColAndValue example: 'id=eq.UUID'
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idColAndValue}`, {
      method: 'PATCH',
      headers: { ...headers(true), 'Prefer': 'return=representation' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async function sbDelete(table, idColAndValue) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idColAndValue}`, {
      method: 'DELETE',
      headers: headers(true),
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status} ${await res.text()}`);
    return true;
  }

  const sbAuth = {
    getSession,
    async signInWithPassword({ email, password }) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Sign-in failed: ${res.status} ${t}`);
      }
      const data = await res.json();
      setSession(data);
      return data;
    },
    async signOut() {
      const s = getSession();
      if (s && s.access_token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${s.access_token}` },
        }).catch(()=>{});
      }
      setSession(null);
    },
    async refresh() {
      const s = getSession();
      if (!s || !s.refresh_token) return null;
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      });
      if (!res.ok) { setSession(null); return null; }
      const data = await res.json();
      setSession(data);
      return data;
    },
    async updateUser(patch) {
      const s = getSession();
      if (!s || !s.access_token) throw new Error('Not signed in');
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`Update user failed: ${res.status} ${await res.text()}`);
      return res.json();
    },
    isAuthenticated() {
      const s = getSession();
      return !!(s && s.access_token);
    }
  };

  global.SB = { sbInsert, sbSelect, sbUpdate, sbDelete, sbAuth, SUPABASE_URL, ANON_KEY };
})(window);

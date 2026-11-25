(function (W) {
  'use strict';

  const API_BASE = 'https://bareturn-licensing-portal.nykko-lin.workers.dev';
  const TOKEN_KEY = 'bareturn.portal.token';
  const USER_KEY = 'bareturn.portal.user';

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (_) { return ''; }
  }
  function setSession(token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (_) {}
  }
  function clearSession() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (_) {}
  }
  function getCachedUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  async function api(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    let data = {};
    const text = await res.text();
    try { data = text ? JSON.parse(text) : {}; } catch (_) { data = { error: text }; }
    if (res.status === 401 && !options.skipClearOn401) clearSession();
    if (!res.ok) throw new Error(data.error || `请求失败（HTTP ${res.status}）`);
    return data;
  }

  async function refreshUser() {
    if (!getToken()) return null;
    try {
      const data = await api('/api/v1/auth/me');
      setSession(getToken(), data.user);
      return data.user;
    } catch (_) {
      clearSession();
      return null;
    }
  }

  async function logout(redirect = 'login.html') {
    try { if (getToken()) await api('/api/v1/auth/logout', { method: 'POST' }); } catch (_) {}
    clearSession();
    if (redirect) location.href = redirect;
  }

  function initTheme(toggleBtnId = 'theme-toggle') {
    const apply = (t) => {
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem('bareturn.site.theme', t); } catch (_) {}
    };
    const saved = (() => { try { return localStorage.getItem('bareturn.site.theme'); } catch (_) { return null; } })();
    apply(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
    const btn = document.getElementById(toggleBtnId);
    if (btn) btn.addEventListener('click', () => apply(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  }

  function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fmtDate(ms) {
    if (!ms) return '—';
    const d = new Date(Number(ms));
    return isNaN(d.getTime()) ? '—' : d.toLocaleString('zh-CN', { hour12: false });
  }

  function fmtUsdCents(cents) {
    const v = Number(cents || 0) / 100;
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function downloadJson(obj, fileName) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('已复制到剪贴板'); }
    catch (_) { toast('复制失败，请手动选中复制', 'err'); }
  }

  let toastTimer = null;
  function toast(msg, kind = 'ok') {
    let el = document.getElementById('portal-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'portal-toast';
      el.className = 'portal-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'portal-toast show ' + kind;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
  }

  function openModal({ title, bodyHtml, footHtml }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${esc(title)}</h3><button type="button" class="modal-close" aria-label="关闭">×</button></div>
      <div class="modal-body">${bodyHtml}</div>
      ${footHtml ? `<div class="modal-foot">${footHtml}</div>` : ''}
    </div>`;
    const close = () => backdrop.remove();
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.closest('.modal-close') || e.target.closest('[data-close]')) close();
    });
    document.body.appendChild(backdrop);
    return { el: backdrop, close };
  }

  function statusBadge(status) {
    const map = {
      Active: ['ok', '有效'],
      Paid: ['ok', '已支付'],
      Manual: ['ok', '手动签发'],
      Pending: ['warn', '待支付'],
      Suspended: ['warn', '已暂停'],
      Disputed: ['warn', '争议冻结'],
      Revoked: ['err', '已撤销'],
      Refunded: ['err', '已退款']
    };
    const [cls, label] = map[status] || ['muted', status || '—'];
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  }

  W.BTPortal = {
    API_BASE, getToken, setSession, clearSession, getCachedUser,
    api, refreshUser, logout, initTheme, esc, fmtDate, fmtUsdCents,
    downloadJson, copyText, toast, openModal, statusBadge
  };
})(window);

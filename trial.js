(function () {
  'use strict';

  const P = window.BTPortal;
  P.initTheme();

  const STORAGE_KEY = 'bareturn.trial.submitted.v1';
  // Release installer base URL (automatically overridden if Worker /api/v1/downloads returns custom URLs).
  const DEFAULT_VERSION = '3.1.0';
  const DEFAULT_DOWNLOAD_BASE = window.BARETURN_DOWNLOAD_BASE || 'https://github.com/nykkolin/bareturn-website/releases/latest/download';

  const FILES = {
    core: `BareTurn-core-${DEFAULT_VERSION}-win-x64-Setup.exe`,
    winAgent: `BareTurn-agent-${DEFAULT_VERSION}-win-x64-Setup.exe`,
    linuxX64: `BareTurn-agent-${DEFAULT_VERSION}-linux-x64.tar.gz`,
    linuxArm64: `BareTurn-agent-${DEFAULT_VERSION}-linux-arm64.tar.gz`
  };

  const EN = {
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.demo': 'Console demo',
    'nav.login': 'Sign in',
    't.title': 'Download Free Trial',
    't.lead': 'Complete the form below to download and install for free!',
    't.sub': 'Enter your phone number and email (personal or work email accepted) to go straight to the installer download page. Installing Core automatically activates a 30-day full-feature trial.',
    'f.company': 'Company',
    'f.contact': 'Contact name',
    'f.phone': 'Phone number',
    'f.email': 'Email',
    'f.req': '(Required)*',
    'f.notes': 'Requirements',
    'f.privacy': 'By clicking "Submit", you agree to the processing of personal data in accordance with our <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.',
    'f.submit': 'Submit & Go to Downloads',
    'a.title': 'Included in your 30-day full trial',
    'a.1': 'Installing BareTurn Core <strong>automatically activates a 30-day trial</strong> — no activation key or credit card required',
    'a.2': 'Covers up to 5 workstations and 1 server with every feature enabled',
    'a.3': 'Whole-machine & bare-metal recovery, instant volume recovery, file restore, S3 Object Lock, and bootable offline drives',
    'a.4': 'Runs fully on-premises in air-gapped networks with zero backup data telemetry',
    'a.5': 'Existing backups remain restorable after the trial; import a perpetual license anytime with no reinstall',
    'a.demoT': 'Want to try the console first?',
    'a.demoD': 'Explore the interactive web console demo directly in your browser with nothing to install.',
    'a.demoBtn': 'Open console demo',
    'd.bannerT': '✓ Trial details submitted — download BareTurn 3.1 installers below',
    'd.bannerD': 'After installing BareTurn Core and creating the admin account, your <strong>30-day full-feature trial activates automatically</strong> (5 workstations + 1 server, no license key needed).',
    'd.edit': 'Edit contact info',
    'd.coreT': 'BareTurn Core Server',
    'd.coreD': 'Windows Server 2019–2025 or Windows 10 / 11 (x64). Includes Web Console, scheduler, and recovery media builder.',
    'd.coreBadge': '30-day trial included',
    'd.downloadCore': 'Download Core installer',
    'd.step1Hint': 'Install first',
    'd.winAgentT': 'BareTurn Agent (Windows)',
    'd.winAgentD': 'Install on protected Windows 10 / 11 workstations and Windows Server 2012–2025 servers for VSS snapshots and live restore.',
    'd.downloadWin': 'Download Windows Agent',
    'd.linX64T': 'BareTurn Agent (Linux x86-64)',
    'd.linX64D': 'Self-contained systemd agent for Ubuntu, Debian, RHEL, Rocky Linux, and AlmaLinux (x86-64).',
    'd.downloadLin64': 'Download Linux x86-64',
    'd.linArmT': 'BareTurn Agent (Linux ARM64)',
    'd.linArmD': 'For ARM64 / aarch64 Linux servers with ext2/3/4, XFS, LVM snapshot, and dm-clone live restore.',
    'd.downloadLinArm': 'Download Linux ARM64',
    'd.guideT': 'Quick start guide',
    'd.g1': 'Run <code>BareTurn-core-3.1.0-win-x64-Setup.exe</code>, open <code>https://&lt;server&gt;:9843/</code> in your browser, and create the admin account — your <strong>30-day full trial activates automatically</strong>.',
    'd.g2': 'Run the Windows Agent installer on Windows machines, or run the command below on Linux:',
    'd.g3': 'In the Core console, open Machines → Protect machine, verify the certificate fingerprint, and start backing up.',
    'd.copy': 'Copy command',
    'foot.privacy': 'Privacy Policy'
  };

  const ZH = {};
  const PH_ZH = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => { ZH[el.dataset.i18n] = el.innerHTML; });
  document.querySelectorAll('[data-ph-en]').forEach((el) => { PH_ZH[el.id] = el.placeholder; });

  let lang = (() => { try { return localStorage.getItem('bareturn.site.lang') === 'en' ? 'en' : 'zh'; } catch (_) { return 'zh'; } })();
  const t = (zh, en) => (lang === 'en' ? en : zh);
  const langBtn = document.getElementById('lang-toggle');

  function applyLang(next) {
    lang = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    langBtn.textContent = lang === 'en' ? '中' : 'EN';
    document.title = t('下载 30 天免费试用 · BareTurn', 'Download 30-day Free Trial · BareTurn');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.dataset.i18n;
      if (lang === 'en' && EN[k]) el.innerHTML = EN[k];
      else if (ZH[k]) el.innerHTML = ZH[k];
    });
    document.querySelectorAll('[data-ph-en]').forEach((el) => {
      el.placeholder = lang === 'en' ? el.dataset.phEn : (PH_ZH[el.id] || '');
    });
    try { localStorage.setItem('bareturn.site.lang', lang); } catch (_) {}
  }
  langBtn.addEventListener('click', () => applyLang(lang === 'zh' ? 'en' : 'zh'));
  applyLang(lang);

  // Reflect logged-in state in top navbar
  (async function syncNavAuth() {
    const authBtn = document.getElementById('nav-auth-btn');
    if (!authBtn || !P.getToken()) return;
    const u = await P.refreshUser();
    if (!u) return;
    authBtn.href = u.role === 'admin' ? 'admin.html' : 'account.html';
    authBtn.removeAttribute('data-i18n');
    authBtn.textContent = u.role === 'admin' ? `${u.name}（管理后台）` : `${u.name}（我的账户）`;
  })();

  // Populate download links (and allow Worker /api/v1/downloads to override if configured)
  function applyDownloadUrls(urls) {
    Object.keys(FILES).forEach((key) => {
      const href = (urls && urls[key]) || `${DEFAULT_DOWNLOAD_BASE.replace(/\/+$/, '')}/${FILES[key]}`;
      document.querySelectorAll(`[data-dl="${key}"]`).forEach((a) => {
        a.href = href;
        a.setAttribute('download', FILES[key]);
      });
    });
  }
  applyDownloadUrls(null);
  P.api('/api/v1/downloads', { skipClearOn401: true }).then((res) => {
    if (res && res.downloads) applyDownloadUrls(res.downloads);
  }).catch(() => {});

  const formView = document.getElementById('trial-form-view');
  const downloadView = document.getElementById('trial-download-view');
  const form = document.getElementById('trial-form');
  const errEl = document.getElementById('t-err');
  const submitBtn = document.getElementById('t-submit');

  function showDownloadView(scrollTop = true) {
    formView.classList.add('hidden');
    downloadView.classList.remove('hidden');
    if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showFormView() {
    downloadView.classList.add('hidden');
    formView.classList.remove('hidden');
  }

  function loadSaved() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  const saved = loadSaved();
  if (saved) {
    if (saved.company) document.getElementById('t-company').value = saved.company;
    if (saved.contactName) document.getElementById('t-contact').value = saved.contactName;
    if (saved.phone) document.getElementById('t-phone').value = saved.phone;
    if (saved.email) document.getElementById('t-email').value = saved.email;
    if (saved.notes) document.getElementById('t-notes').value = saved.notes;
    if (new URLSearchParams(location.search).get('step') !== 'form') {
      showDownloadView(false);
    }
  }

  document.getElementById('btn-edit-trial').addEventListener('click', () => showFormView());

  document.getElementById('btn-copy-cmd').addEventListener('click', () => {
    const cmd = document.getElementById('linux-cmd').textContent.trim();
    P.copyText(cmd);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.textContent = '';

    const company = document.getElementById('t-company').value.trim();
    const contactName = document.getElementById('t-contact').value.trim();
    const phone = document.getElementById('t-phone').value.trim();
    const email = document.getElementById('t-email').value.trim();
    const notes = document.getElementById('t-notes').value.trim();

    if (!phone) {
      errEl.textContent = t('请填写联系电话。', 'Please enter your phone number.');
      document.getElementById('t-phone').focus();
      return;
    }
    const phoneDigits = phone.replace(/[^\d]/g, '');
    if (phoneDigits.length < 6 || phoneDigits.length > 20 || !/^[+\d()\-\s]{6,32}$/.test(phone)) {
      errEl.textContent = t('请输入有效的联系电话（6–20 位数字）。', 'Please enter a valid phone number (6–20 digits).');
      document.getElementById('t-phone').focus();
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errEl.textContent = t('请输入有效的邮箱地址（不限制企业邮箱）。', 'Please enter a valid email address.');
      document.getElementById('t-email').focus();
      return;
    }

    const origText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = t('正在提交…', 'Submitting…');

    const payload = { company, contactName, phone, email, notes, lang };
    try {
      await P.api('/api/v1/trial-requests', {
        method: 'POST',
        skipClearOn401: true,
        body: JSON.stringify(payload)
      });
    } catch (_) {
      // Allow immediate download even if lead endpoint is temporarily unreachable or not yet deployed.
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, payload, { submittedAt: Date.now() })));
    } catch (_) {}

    submitBtn.disabled = false;
    submitBtn.textContent = origText;
    showDownloadView(true);
    P.toast(t('已解锁安装包下载，安装 Core 默认激活 30 天试用', 'Downloads unlocked — installing Core activates a 30-day trial'));
  });
})();

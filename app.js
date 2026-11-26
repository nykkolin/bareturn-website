(function () {
  'use strict';

  const PORTAL_URL = 'https://bareturn-licensing-portal.nykko-lin.workers.dev';
  // Set to false once Creem is switched to live payments.
  const CHECKOUT_TEST_MODE = true;

  // ── Theme ──
  const themeBtn = document.getElementById('theme-toggle');
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('bareturn.site.theme', t); } catch (_) {}
  }
  themeBtn.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // ── English dictionary (Chinese is the source in index.html) ──
  const EN = {
    'nav.scenarios': 'Use cases',
    'nav.features': 'Features',
    'nav.security': 'Security',
    'nav.compat': 'Compatibility',
    'nav.pricing': 'Pricing',
    'nav.faq': 'FAQ',
    'nav.demo': 'Console demo',
    'nav.login': 'Sign in',
    'nav.account': 'My Account',
    'nav.cta': 'Free trial',
    'hero.title': 'Whole-machine backup and bare-metal recovery, running in your own data center.',
    'hero.lead': 'BareTurn protects Windows and Linux servers and workstations with whole-machine backup, bare-metal recovery, instant volume recovery, and ransomware-resistant offline copies. Every component runs on-premises, including in air-gapped networks. Perpetual licenses, paid once.',
    'hero.btnTrial': 'Start 30-day free trial',
    'hero.btnDemo': 'View console demo',
    'hero.f1': 'No sign-up. Trial covers 5 workstations and 1 server',
    'hero.f2': 'Perpetual license with Lifetime Updates and zero renewal fees',
    'hero.f3': 'Existing backups stay restorable regardless of license state',
    'mock.open': 'Open full demo',
    'plat.label': 'Supported platforms',
    'plat.s3': 'S3-compatible storage',
    'sc.title': 'A recovery path for every kind of failure',
    'sc.sub': 'Hardware failure, ransomware, and human error each need a different kind of restore. BareTurn provides all of them from one console.',
    'sc.h1': 'What happened',
    'sc.h2': 'How you recover',
    'sc.h3': 'Result',
    'sc.1.t': 'System disk or motherboard failure',
    'sc.1.d': 'Boot the target machine from URC media and restore the whole system to the original or different hardware. Partitions, boot configuration, and drivers are handled automatically.',
    'sc.1.o': 'Same or new hardware',
    'sc.2.t': 'Ransomware encrypted production',
    'sc.2.d': 'Restore from a disconnected offline drive or an S3 copy protected by Object Lock. Even if the Core server is compromised, these copies cannot be deleted or altered.',
    'sc.2.o': 'Offline and immutable copies',
    'sc.3.t': 'A multi-TB volume needs restoring',
    'sc.3.d': 'With instant volume recovery the volume is readable and writable within seconds while the remaining data copies back in the background.',
    'sc.3.o': 'Online in seconds',
    'sc.4.t': 'Files deleted or overwritten',
    'sc.4.d': 'Mount any recovery point, find the files you need, then download them or write them back to the original machine.',
    'sc.4.o': 'File-level restore',
    'feat.title': 'Features',
    'feat.sub': 'From daily backups to full system rebuilds, every feature is included in every license.',
    'feat.1.t': 'Whole-machine and bare-metal recovery',
    'feat.1.d': 'The built-in media builder creates WinPE and Linux recovery ISOs. GPT/UEFI and MBR/BIOS layouts are rebuilt at their original offsets and GUIDs, with driver injection for dissimilar hardware.',
    'feat.2.t': 'Instant volume recovery',
    'feat.2.d': 'Recovery points are attached via local iSCSI on Windows or dm-clone on Linux and become read-write within seconds. Hot data is fetched on demand and the rest is copied back in the background, resuming after reboots.',
    'feat.3.t': 'Offline drives and immutable copies',
    'feat.3.d': 'Sync automatically to bootable USB offline drives that eject when done. Replicate recovery points to S3-compatible storage with Object Lock in compliance or governance mode.',
    'feat.4.t': 'Driverless incremental backup',
    'feat.4.d': 'No kernel filter drivers. NTFS changes are tracked through the USN journal and MFT, Linux skips free blocks. Zstandard compression, SHA-256 source-side dedup, and parallel streams.',
    'feat.5.t': 'File-level restore',
    'feat.5.d': 'Mount any recovery point read-only to browse and download files, write them back to any protected machine, or map the point as a drive letter over WebDAV.',
    'feat.6.t': 'Central management and alerts',
    'feat.6.d': 'Manage machines, schedules, and repositories from one web console, with three role levels and alerts to WeCom, DingTalk, Feishu, and Syslog.',
    'sec.title': 'Your backup system needs protecting too',
    'sec.sub': 'Attackers usually go after backups first. BareTurn is designed to leave them fewer ways in.',
    'sec.1.t': 'Core-initiated backups',
    'sec.1.d': 'Protected machines never hold repository paths or credentials, so a compromised endpoint cannot delete backups.',
    'sec.2.t': 'No stored OS passwords',
    'sec.2.d': 'After one-time pairing, Core and agents use certificate pinning and random tokens. OS passwords are never written to disk.',
    'sec.3.t': 'Encrypted end to end',
    'sec.3.d': 'Repositories and offline drives use AES-256-GCM. Traffic is protected by TLS.',
    'sec.4.t': 'Offline-signed licenses',
    'sec.4.d': 'License files are signed with ECDSA P-256 and verified locally, with no call-home to the vendor.',
    'sec.5.t': 'Access control',
    'sec.5.d': 'Three role levels and TOTP two-factor authentication that runs locally.',
    'sec.6.t': 'Portable configuration',
    'sec.6.d': 'Export the Core configuration encrypted. After restoring it on new hardware, a 30-day migration grace period starts automatically.',
    'arch.title': 'Architecture',
    'arch.sub': 'Core, agents, and storage are separate tiers. Core schedules jobs, pulls data, and drives every restore.',
    'arch.tab1': 'Backup data flow',
    'arch.tab2': '3-2-1-1-0 copy policy',
    'arch.tab3': 'Bare-metal recovery',
    'compat.title': 'Compatibility',
    'compat.sub': 'Mainstream Windows and Linux releases, file systems, and storage targets.',
    'compat.c1.t': 'Protected machines',
    'compat.c1.l3': 'Linux x86-64 and ARM64: Ubuntu, Debian, RHEL, Rocky Linux, AlmaLinux',
    'compat.c1.l4': 'Whole machine, system disk, selected volumes, and Windows file-level backup',
    'compat.c2.t': 'File systems and partitions',
    'compat.c2.l3': 'GPT/UEFI and MBR/BIOS, including extended partitions, MSR, and BitLocker',
    'compat.c2.l4': 'Page, hibernation, and swap file contents skipped automatically',
    'compat.c3.t': 'Backup storage',
    'compat.c3.l1': 'Local NTFS / ReFS disks on the Core server',
    'compat.c3.l2': 'NAS or file server SMB 2/3 shares with automatic reconnect',
    'compat.c3.l3': 'Bootable USB offline drives with automatic sync, verify, and eject',
    'compat.c3.l4': 'S3-compatible object storage with Object Lock',
    'price.title': 'Perpetual licenses with Lifetime Updates',
    'price.sub': 'Buy once, use indefinitely, and get free lifetime updates. No subscriptions, no annual maintenance renewals — priced transparently per protected machine.',
    'price.t0.tag': 'Evaluation',
    'price.t0.name': 'Free trial',
    'price.t0.unit': '30 days',
    'price.t0.desc': 'Starts automatically when you install Core. No sign-up or credit card, suitable for a proof of concept in production.',
    'price.t0.f1': 'Up to 5 workstations and 1 server',
    'price.t0.f2': 'All features included',
    'price.t0.f3': 'Existing backups stay restorable after the trial',
    'price.t0.f4': 'Import a license to convert, no reinstall needed',
    'price.t0.btn': 'Start trial',
    'price.t1.tag': 'Workstation',
    'price.t1.unit': 'per machine, one-time',
    'price.t1.desc': 'For Windows 10 / 11 office PCs, finance workstations, and industrial PCs.',
    'price.t1.f1': 'Permanent usage — never expires',
    'price.t1.f2': 'Lifetime Updates included',
    'price.t1.f3': 'Zero subscriptions or renewal fees',
    'price.t1.f4': 'Online or offline activation',
    'price.t2.ribbon': 'Most chosen',
    'price.t2.tag': 'Server',
    'price.t2.unit': 'per machine, one-time',
    'price.t2.desc': 'For physical or virtual Windows Server and Linux servers. Can also protect a workstation.',
    'price.t2.f1': 'Permanent usage — never expires',
    'price.t2.f2': 'Lifetime Updates included',
    'price.t2.f3': 'Zero subscriptions or renewal fees',
    'price.t2.f4': '30-day grace period and self-service rehost when Core hardware changes',
    'price.addWs': 'Add to order',
    'price.addSrv': 'Add to order',
    'inc.1': 'No charge for storage capacity',
    'inc.2': 'Unlimited repositories, offline drives, and admin accounts',
    'inc.3': 'Licenses freed as soon as a machine is retired',
    'calc.title': 'Calculate your order',
    'calc.sub': 'Choose how many servers and workstations you need and check out once. After payment you receive one activation code that covers all of them.',
    'calc.srv': 'Servers ($299 each)',
    'calc.ws': 'Workstations ($49 each)',
    'calc.total': 'One-time total (includes Lifetime Updates)',
    'calc.maint': 'Future renewal & upgrade fees',
    'calc.maintVal': '$0 · Lifetime Updates',
    'calc.buy': 'Continue to checkout',
    'calc.portal': 'Already licensed? Offline activation or rehost',
    'dl.title': 'Start your trial in three steps',
    'dl.sub': 'Your 30-day full-feature trial starts when Core is installed. No account needed.',
    'dl.s1.n': 'Step 1',
    'dl.s1.t': 'Install Core',
    'dl.s1.d': 'Run the Core installer on a Windows Server or PC, then open https://&lt;server&gt;:9843/ in a browser to create the admin account.',
    'dl.s2.n': 'Step 2',
    'dl.s2.t': 'Deploy agents',
    'dl.s2.d': 'Run the agent installer on Windows or <code>sudo ./install.sh</code> on Linux, then confirm the certificate fingerprint in the console to pair.',
    'dl.s3.n': 'Step 3',
    'dl.s3.t': 'Back up and test a restore',
    'dl.s3.d': 'Create a backup schedule, build a recovery ISO or bootable offline drive, and run a test restore. After purchase, import your license to convert with no restart.',
    'dl.bar.t': 'Want to see the console first?',
    'dl.bar.d': 'Open the interactive console demo in your browser. Nothing to install.',
    'dl.bar.demo': 'Open console demo',
    'dl.bar.portal': 'Licensing portal',
    'faq.title': 'FAQ',
    'faq.sub': 'Common questions about licensing, trials, and deployment.',
    'faq.q1': 'What does Lifetime Updates include? Are there any renewal fees?',
    'faq.a1': 'There are no annual maintenance or upgrade fees. Your one-time purchase grants permanent usage plus free lifetime software updates and OS compatibility releases, along with standard email and documentation support. Dedicated 24/7 enterprise SLA contracts are optional and arranged separately if needed.',
    'faq.q2': 'Can I still restore my backups after the trial ends?',
    'faq.a2': 'Yes. Whether or not the trial has expired, every recovery point remains available for bare-metal recovery, offline drive restore, volume restore, mounting, and file download.',
    'faq.q3': 'Can I activate BareTurn in a fully air-gapped network?',
    'faq.a3': 'Yes. Export a request file (.req) from the Core console, exchange it for a license file (.bareturnlic) on the licensing portal from any internet-connected device, and import it back. No internet access is needed after that.',
    'faq.q4': 'What happens if the Core server fails or has to be moved?',
    'faq.a4': 'Licenses are tied to three stable hardware attributes, and any two matching counts as the same machine. NIC MACs and data disk serials are not used, so routine maintenance will not invalidate a license. After moving Core or restoring its configuration on new hardware, a 30-day grace period starts automatically with backups and restores unaffected, and you can rehost through the licensing portal.',
    'faq.q5': 'Do retired machines keep using a license?',
    'faq.a5': 'No. When you stop protecting a machine in the console, it is archived and its license is freed immediately for another machine. Its recovery points are kept and can still be mounted and restored.',
    'faq.q6': 'Can I buy server and workstation licenses together?',
    'faq.a6': 'Yes. Set both quantities in the order calculator in the Pricing section and check out once. You will receive one activation code covering everything. Payments are handled by Creem as Merchant of Record.',
    'foot.desc': 'On-premises whole-machine backup and bare-metal recovery for Windows and Linux.',
    'foot.c1': 'Product',
    'foot.arch': 'Architecture',
    'foot.c2': 'Licensing and services',
    'foot.portal': 'Licensing portal',
    'foot.offline': 'Offline activation',
    'foot.rehost': 'Move Core to new hardware',
    'foot.pay': 'Payments handled by Creem as Merchant of Record'
  };

  const ZH = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => { ZH[el.dataset.i18n] = el.innerHTML; });
  const descMeta = document.querySelector('meta[name="description"]');
  const META = {
    zh: { title: document.title, desc: descMeta.content },
    en: {
      title: 'BareTurn — Whole-machine backup and bare-metal recovery for Windows and Linux',
      desc: 'BareTurn is on-premises whole-machine backup and bare-metal recovery for Windows and Linux, with dissimilar-hardware restore, instant volume recovery, bootable offline drives, and S3 immutable copies. Perpetual licenses. 30-day free trial.'
    }
  };

  let lang = (() => { try { return localStorage.getItem('bareturn.site.lang') || 'zh'; } catch (_) { return 'zh'; } })();
  const langBtn = document.getElementById('lang-toggle');
  const t = (zh, en) => (lang === 'en' ? en : zh);

  function applyLang(next) {
    lang = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    langBtn.textContent = lang === 'en' ? '中' : 'EN';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.dataset.i18n;
      if (lang === 'en' && EN[k]) el.innerHTML = EN[k];
      else if (ZH[k]) el.innerHTML = ZH[k];
    });
    document.title = META[lang].title;
    descMeta.content = META[lang].desc;
    try { localStorage.setItem('bareturn.site.lang', lang); } catch (_) {}
    renderArch(currentArch);
    updateCalc();
    if (window.BTHeroDemo) window.BTHeroDemo.setLang(lang);
    document.getElementById('calc-note').textContent = CHECKOUT_TEST_MODE
      ? t('结账目前处于测试模式，不会产生真实扣款。', 'Checkout is currently in test mode. No real charges will be made.')
      : '';
  }
  langBtn.addEventListener('click', () => applyLang(lang === 'zh' ? 'en' : 'zh'));

  // ── Architecture ──
  const ARCH = {
    pull: {
      zh: {
        nodes: [
          { title: 'Agent', sub: 'Windows / Linux\nVSS 或 LVM 快照\n源端去重与压缩' },
          { title: 'Core', sub: '调度与作业队列\n主动拉取数据\nWeb 控制台', core: true },
          { title: '存储库', sub: '本地磁盘或 SMB NAS\nAES-256-GCM 加密' }
        ],
        heading: '由 Core 发起，Agent 不接触存储',
        bullets: [
          'Agent 只监听受令牌和证书固定保护的端口，不知道存储库的位置和凭据。',
          '一次性配对后使用 256 位随机令牌通信，Windows 和 Linux 系统密码不落盘。',
          '多连接并行传输，已存在的数据块只发送引用，节省局域网带宽。'
        ]
      },
      en: {
        nodes: [
          { title: 'Agent', sub: 'Windows / Linux\nVSS or LVM snapshot\nSource-side dedup' },
          { title: 'Core', sub: 'Scheduler and job queue\nPulls data\nWeb console', core: true },
          { title: 'Repository', sub: 'Local disk or SMB NAS\nAES-256-GCM' }
        ],
        heading: 'Core pulls, agents never touch storage',
        bullets: [
          'Agents listen only on a token- and certificate-pinned port and never learn where backups are stored or how to reach them.',
          'After one-time pairing, traffic uses a 256-bit random token. Windows and Linux passwords are never stored.',
          'Parallel streams, and blocks that already exist are sent as references only, saving LAN bandwidth.'
        ]
      }
    },
    ransomware: {
      zh: {
        nodes: [
          { title: '主存储库', sub: '加密分段存储\n定期汇总与校验' },
          { title: '可引导离线盘', sub: '独立完整的副本\n同步后自动弹出', core: true },
          { title: 'S3 不可变副本', sub: 'Object Lock\n锁定期内不可删除' }
        ],
        heading: '可落地的 3-2-1-1-0 策略',
        bullets: [
          '离线盘保存独立完整的恢复点，拔出后与网络物理隔离，勒索软件和失陷的管理员账户都无法访问。',
          '离线盘自带 URC 恢复环境。即使 Core 和整个机房都无法使用，插上离线盘开机即可恢复。',
          'S3 Object Lock 在存储端强制保留，锁定期内任何账户都无法删除或修改副本。'
        ]
      },
      en: {
        nodes: [
          { title: 'Primary repository', sub: 'Encrypted segments\nScheduled rollup and verify' },
          { title: 'Bootable offline drive', sub: 'Self-contained copy\nEjects after sync', core: true },
          { title: 'S3 immutable copy', sub: 'Object Lock\nUndeletable while locked' }
        ],
        heading: 'A 3-2-1-1-0 policy you can actually run',
        bullets: [
          'Offline drives hold self-contained recovery points and are physically disconnected once unplugged, out of reach of ransomware and compromised admin accounts.',
          'Each offline drive carries the URC recovery environment. If Core and the whole server room are gone, boot from the drive and restore.',
          'S3 Object Lock enforces retention on the storage side, so no account can delete or alter a copy while it is locked.'
        ]
      }
    },
    bmr: {
      zh: {
        nodes: [
          { title: 'URC 启动介质', sub: 'WinPE / Linux ISO\n或可引导离线盘' },
          { title: '重建分区与引导', sub: '原始偏移与 GUID\n驱动注入与引导修复', core: true },
          { title: '系统重新上线', sub: '原机或新硬件\n数据逐块校验' }
        ],
        heading: '同机或异机，重建可引导的系统',
        bullets: [
          '在控制台中生成 WinPE 或 Linux 恢复 ISO，可加入额外的网卡和阵列卡驱动。',
          '恢复时可连接 Core，也可完全离线，直接读取本地存储库或离线盘。',
          '自动映射多块磁盘，修复 UEFI/BIOS 引导，并启用通用存储控制器驱动，避免异机启动失败。'
        ]
      },
      en: {
        nodes: [
          { title: 'URC boot media', sub: 'WinPE / Linux ISO\nor bootable offline drive' },
          { title: 'Rebuild layout and boot', sub: 'Original offsets and GUIDs\nDriver injection, boot repair', core: true },
          { title: 'System back online', sub: 'Original or new hardware\nBlock-level verification' }
        ],
        heading: 'Rebuild a bootable system on the same or new hardware',
        bullets: [
          'Build WinPE or Linux recovery ISOs from the console, with extra NIC and RAID drivers if needed.',
          'Restore over the network from Core, or fully offline from a local repository or offline drive.',
          'Multiple disks are mapped automatically, UEFI/BIOS boot is repaired, and generic storage drivers are enabled so the system boots on new hardware.'
        ]
      }
    }
  };

  let currentArch = 'pull';
  function renderArch(key) {
    currentArch = key;
    const data = ARCH[key][lang];
    document.getElementById('arch-diagram').innerHTML = `<div class="arch-flow">${data.nodes.map((n, i) =>
      `${i > 0 ? '<span class="arch-arrow" aria-hidden="true"></span>' : ''}<div class="arch-node${n.core ? ' core' : ''}"><strong>${n.title}</strong><small>${n.sub.replace(/\n/g, '<br>')}</small></div>`
    ).join('')}</div>`;
    document.getElementById('arch-notes').innerHTML = `<h3>${data.heading}</h3><ul>${data.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;
  }
  document.querySelectorAll('.arch-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.arch-tab').forEach((b) => {
        b.classList.toggle('on', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      renderArch(btn.dataset.arch);
    });
  });

  // ── Order calculator & Creem checkout ──
  const srvSlider = document.getElementById('calc-srv');
  const wsSlider = document.getElementById('calc-ws');
  const srvNum = document.getElementById('calc-srv-num');
  const wsNum = document.getElementById('calc-ws-num');
  const checkoutBtn = document.getElementById('btn-bundle-checkout');
  const statusEl = document.getElementById('checkout-status');
  const clamp = (v) => Math.max(0, Math.min(500, Math.trunc(Number(v) || 0)));
  const usd = (n, d = 0) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

  function setSeats(s, w) {
    const cs = clamp(s), cw = clamp(w);
    srvNum.value = cs; wsNum.value = cw;
    srvSlider.value = Math.min(50, cs); wsSlider.value = Math.min(200, cw);
    updateCalc();
  }

  function updateCalc() {
    const s = clamp(srvNum.value), w = clamp(wsNum.value);
    const sCost = s * 299, wCost = w * 49, total = sCost + wCost;
    document.getElementById('bd-srv').textContent = `${s} × $299 = ${usd(sCost)}`;
    document.getElementById('bd-ws').textContent = `${w} × $49 = ${usd(wCost)}`;
    document.getElementById('calc-total').textContent = usd(total);
    checkoutBtn.disabled = s + w < 1;
  }

  srvSlider.addEventListener('input', () => setSeats(srvSlider.value, wsNum.value));
  wsSlider.addEventListener('input', () => setSeats(srvNum.value, wsSlider.value));
  srvNum.addEventListener('input', () => setSeats(srvNum.value, wsNum.value));
  wsNum.addEventListener('input', () => setSeats(srvNum.value, wsNum.value));

  function bump(spec) {
    const [which, delta] = spec.split(',');
    setSeats(Number(srvNum.value || 0) + (which === 'srv' ? Number(delta) : 0),
             Number(wsNum.value || 0) + (which === 'ws' ? Number(delta) : 0));
  }
  document.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => bump(btn.dataset.step));
  });
  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => { const [s, w] = btn.dataset.preset.split(','); setSeats(s, w); });
  });
  document.querySelectorAll('[data-add-seat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      bump(btn.dataset.addSeat);
      document.getElementById('bundle-builder')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  checkoutBtn.addEventListener('click', async () => {
    const serverSeats = clamp(srvNum.value);
    const workstationSeats = clamp(wsNum.value);
    if (serverSeats + workstationSeats < 1) return;
    const origText = checkoutBtn.textContent;
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = t('正在打开结账页…', 'Opening checkout…');
    statusEl.className = 'checkout-status';
    statusEl.textContent = t(
      `正在为 ${serverSeats} 台服务器和 ${workstationSeats} 台工作站创建订单…`,
      `Creating an order for ${serverSeats} server(s) and ${workstationSeats} workstation(s)…`);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = window.BTPortal?.getToken();
      if (token) headers.Authorization = 'Bearer ' + token;
      const payload = { serverSeats, workstationSeats };
      if (token) payload.successUrl = location.origin + '/account.html?paid=1';
      const res = await fetch(`${PORTAL_URL}/api/v1/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || 'Checkout creation failed');
      window.location.href = data.checkoutUrl;
    } catch (err) {
      statusEl.className = 'checkout-status err';
      statusEl.textContent = t('无法打开结账页：', 'Could not open checkout: ') + err.message +
        t('。请稍后重试，或通过许可门户购买。', '. Try again shortly, or buy through the licensing portal.');
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = origText;
    }
  });

  applyLang(lang);

  // Reflect logged-in state in top navbar
  (async function syncNavAuth() {
    const authBtn = document.getElementById('nav-auth-btn');
    if (!authBtn || !window.BTPortal || !window.BTPortal.getToken()) return;
    const u = await window.BTPortal.refreshUser();
    if (!u) return;
    authBtn.href = u.role === 'admin' ? 'admin.html' : 'account.html';
    authBtn.removeAttribute('data-i18n');
    authBtn.textContent = u.role === 'admin' ? `${u.name}（管理后台）` : `${u.name}（我的账户）`;
  })();
})();

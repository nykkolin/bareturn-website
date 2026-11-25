(function () {
  'use strict';

  const PORTAL_URL = 'https://bareturn-licensing-portal.nykko-lin.workers.dev';

  // ── Theme toggle ──
  const themeBtn = document.getElementById('theme-toggle');
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('bareturn.site.theme', t); } catch (_) {}
  }
  const savedTheme = (() => { try { return localStorage.getItem('bareturn.site.theme'); } catch (_) { return null; } })();
  if (savedTheme) applyTheme(savedTheme);
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // ── Bilingual dictionary (ZH default / EN) ──
  const EN = {
    'brand.sub': 'by Rootford',
    'nav.features': 'Features',
    'nav.arch': 'Architecture',
    'nav.compat': 'Compatibility',
    'nav.pricing': 'Perpetual Pricing',
    'nav.faq': 'FAQ',
    'nav.demo': 'Live Console Demo',
    'nav.portal': 'License Portal',
    'nav.cta': 'Trial / Buy',
    'hero.badge': 'BareTurn 3.1 · Perpetual License · No Subscriptions · 100% Air-Gap Ready',
    'hero.title': 'Whole-Machine Backup & Bare-Metal Recovery,<br><span class="accent">Buy Once. Own Forever.</span>',
    'hero.lead': 'On-premises disaster recovery for Windows and Linux servers & workstations. Built-in Web Console, driverless incremental dedup, dissimilar-hardware BMR (URC), instant Live Recovery, bootable offline drives, and S3 Object Lock. Zero subscription lock-in.',
    'hero.btnTrial': 'Start 30-Day Full Trial',
    'hero.btnDemo': 'Launch Live Console Demo ↗',
    'proof.1.k': '$0 Subscription',
    'proof.1.v': 'Transparent perpetual per-seat licensing',
    'proof.2.k': '5 WS + 1 Server',
    'proof.2.v': 'Zero-signup 30-day evaluation out of the box',
    'proof.3.k': 'Restores Never Lock',
    'proof.3.v': 'Historical recovery points always stay accessible',
    'mock.badge': 'On-Prem · Air-Gapped',
    'mock.nav1': 'Dashboard',
    'mock.nav2': 'Protected Machines',
    'mock.nav3': 'Points & Mounts',
    'mock.nav4': 'Live Volume Restore',
    'mock.nav5': 'Repositories & Drives',
    'mock.nav6': 'Settings · License',
    'mock.k1': 'Protected Machines',
    'mock.k1s': '100% RPO Compliant',
    'mock.k2': 'Storage Efficiency',
    'mock.k2s': 'Zstd + SHA-256 Dedup',
    'mock.k3': 'Offline / Immutable',
    'mock.k3s': 'Object Lock Active',
    'mock.foot': 'Perpetual License · Offline Signed · Zero Cloud Dependency',
    'mock.open': 'Open Full Interactive Demo →',
    'strip.1.t': 'True Perpetual Ownership, Zero Subscription Tax',
    'strip.1.d': 'Pay once to run your licensed version indefinitely. Includes 1 year of updates & support; when maintenance ends, backups and restores keep running forever.',
    'strip.2.t': 'Air-Gap Native for Isolated Networks',
    'strip.2.d': 'Local Web Console, offline TOTP 2FA, and ECDSA P-256 signed .bareturnlic files operate indefinitely with zero outbound internet access.',
    'strip.3.t': 'No Capacity Tax & Instant Seat Release',
    'strip.3.d': 'Unlimited TB storage, repositories, offline drives, and admin users. Archiving a retired machine frees its seat immediately while preserving recovery points.',
    'feat.kicker': 'CORE CAPABILITIES',
    'feat.title': 'Engineered for Real Hardware Failures & Ransomware',
    'feat.sub': 'Inspired by Quest Rapid Recovery, Acronis, and Macrium Reflect — distilled into one clean, dependable on-premises platform.',
    'feat.1.t': 'Windows & Linux Bare-Metal Recovery',
    'feat.1.d': 'Built-in Bootable Media Builder produces WinPE / Linux URC ISO images. Rebuilds GPT/UEFI and MBR/BIOS at exact partition offsets with dissimilar-hardware driver injection.',
    'feat.2.t': 'Instant Partition Live Recovery',
    'feat.2.d': 'Bring multi-TB data volumes online in seconds via Windows loopback iSCSI or Linux kernel dm-clone. Read-on-demand while hydrating in the background with seamless cutover.',
    'feat.3.t': 'Bootable Offline Drives & S3 Object Lock',
    'feat.3.d': 'Automate copies to bootable USB drives with safe hardware ejection, and replicate standalone points to S3-compatible buckets protected by Compliance/Governance Object Lock.',
    'feat.4.t': 'Driverless Incrementals & Source Dedup',
    'feat.4.d': 'Zero kernel filter drivers to crash servers: NTFS USN + $MFT change tracking, Linux free-block skipping & LVM snapshots, 1 MiB Zstandard compression, and SHA-256 source dedup.',
    'feat.5.t': 'Instant Mount, File Recovery & WebDAV',
    'feat.5.d': 'Mount any recovery point read-only from the console to browse, download ZIPs, push files back to any agent, or map as a local Windows drive letter over WebDAV.',
    'feat.6.t': 'Zero Stored Passwords & Enterprise Governance',
    'feat.6.d': 'One-time pairing with certificate pinning and Bearer tokens — OS passwords never touch disk. Includes RBAC roles, local 2FA, WeCom/DingTalk/Feishu/Slack/Syslog alerts, and encrypted config backups.',
    'arch.kicker': 'ARCHITECTURE',
    'arch.title': 'Clean 3-Tier Pull Architecture',
    'arch.sub': 'BareTurn Core initiates every capture. Agents never hold repository paths or credentials.',
    'arch.tab1': 'Core Pull Backup',
    'arch.tab2': '3-2-1-1-0 Ransomware Defense',
    'arch.tab3': 'Core-Independent BMR',
    'compat.kicker': 'COMPATIBILITY',
    'compat.title': 'Broad OS, Filesystem, and Storage Coverage',
    'compat.c1.t': 'Protected Agents',
    'compat.c1.l4': 'Whole machine, system disk, selected volumes, and Windows file-level scopes',
    'compat.c2.t': 'Filesystems & Layouts',
    'compat.c2.l4': 'Automatically zeroes pagefile / hiberfil / swapfile blocks to save bandwidth',
    'compat.c3.t': 'Repositories & Offsite',
    'compat.c3.l1': 'Local NTFS / ReFS fixed disks (1 GiB segmented block store)',
    'compat.c3.l2': 'NAS / File Server SMB 2/3 shares with automatic reconnect',
    'compat.c3.l3': 'Bootable USB offline drives with auto-sync & hardware eject',
    'compat.c3.l4': 'S3-compatible immutable offsite copies with Object Lock',
    'price.kicker': 'PERPETUAL LICENSING',
    'price.title': 'Simple Perpetual Pricing. No Recurring Lock-In.',
    'price.sub': 'Own your version forever with 1 year of updates & technical support included. Optional maintenance renewal is 20%/year — never mandatory to keep running.',
    'price.t0.tag': 'Evaluation',
    'price.t0.name': '30-Day Full Trial',
    'price.t0.unit': '/ 30 days',
    'price.t0.desc': 'Starts automatically on first Core setup. No registration or credit card required.',
    'price.t0.f1': 'Up to 5 Workstations + 1 Server seat',
    'price.t0.f2': '100% full features unlocked for real PoC',
    'price.t0.f3': 'All backups remain restorable after trial ends',
    'price.t0.f4': 'Offline signed extensions & zero-restart conversion',
    'price.t0.btn': 'Download Free Trial',
    'price.t1.tag': 'Desktop Endpoints',
    'price.t1.name': 'Workstation Perpetual',
    'price.t1.unit': '/ machine · one-time',
    'price.t1.desc': 'For Windows 10 / 11 desktops, finance PCs, and industrial control workstations.',
    'price.t1.f1': 'Run your licensed version forever — never stops',
    'price.t1.f2': 'Includes 1 year of updates & technical support',
    'price.t1.f3': 'Optional annual renewal: $9.80 / yr (20%)',
    'price.t1.f4': 'Unlimited TB storage · Online or air-gapped activation',
    'price.t2.ribbon': 'Most Popular',
    'price.t2.tag': 'Physical & Virtual Servers',
    'price.t2.name': 'Server Perpetual',
    'price.t2.unit': '/ machine · one-time',
    'price.t2.desc': 'For Windows Server and Linux servers. Downward-compatible with Workstations.',
    'price.t2.f1': 'Run your licensed version forever — never stops',
    'price.t2.f2': '1 Server seat can also cover 1 Workstation seat',
    'price.t2.f3': 'Includes 1Y SMA · Optional renewal $59.80 / yr (20%)',
    'price.t2.f4': '30-day Core hardware migration grace & self-service rehost',
    'price.qty': 'Qty',
    'price.buyBtn': 'Buy Perpetual',
    'calc.title': 'Perpetual Cost Estimator',
    'calc.sub': 'Estimate your one-time perpetual purchase and optional Year 2+ maintenance renewal (20%).',
    'calc.srv': 'Servers ($299 each)',
    'calc.ws': 'Workstations ($49 each)',
    'calc.total': 'One-Time Perpetual Total (incl. 1Y updates & support)',
    'calc.maint': 'Optional Year 2+ Maintenance Renewal (20%/yr — software keeps running without it)',
    'calc.portal': 'Open Licensing Portal (Renewals & Offline Activation) ↗',
    'dl.kicker': 'GET STARTED',
    'dl.title': 'Deploy On-Premises in 5 Minutes',
    'dl.sub': 'Install BareTurn Core to unlock your 30-day full evaluation (5 Workstations + 1 Server) with zero signup.',
    'dl.s1.t': 'Install BareTurn Core',
    'dl.s1.d': 'Run BareTurn-core-3.1.0-win-x64-Setup.exe on a Windows host and open https://<host>:9843/ to create your admin.',
    'dl.s2.t': 'Pair Windows / Linux Agents',
    'dl.s2.d': 'Install the Windows Agent or run sudo ./install.sh on Linux, verify the TLS fingerprint, and pair once.',
    'dl.s3.t': 'Build URC Media & Convert Anytime',
    'dl.s3.d': 'Generate your bootable WinPE/Linux ISO. Enter your activation code or import .bareturnlic anytime with zero downtime.',
    'dl.bar.t': 'Ready to explore BareTurn 3.1?',
    'dl.bar.d': 'Test-drive the real Web Console in your browser or visit the Licensing Portal to purchase seats.',
    'dl.bar.demo': 'Open Live Console Demo',
    'dl.bar.portal': 'Open Licensing Portal',
    'faq.title': 'Licensing & Technical FAQ',
    'faq.q1': 'Will backups stop if my 1-year maintenance (SMA) expires?',
    'faq.a1': 'Never. BareTurn licenses are truly perpetual: your installed version continues backing up and restoring forever after maintenance expires. Renewal (20%/yr) is completely optional and only needed to upgrade to newer releases or receive technical support.',
    'faq.q2': 'Can I still restore my data if my trial expires?',
    'faq.a2': 'Yes, always. Restores never lock in BareTurn: URC bare-metal recovery, bootable offline drive restore, partition restore, read-only mounts, and file downloads remain permanently available.',
    'faq.q3': 'Does BareTurn work in completely air-gapped networks?',
    'faq.a3': 'Yes. Export a .req request code from your air-gapped Core, exchange it for an ECDSA P-256 signed .bareturnlic file on the portal from any internet-connected device, and import it offline. BareTurn never phones home.',
    'faq.q4': 'What if my Core server hardware fails or migrates?',
    'faq.a4': 'BareTurn uses a tolerant 2-of-3 hardware fingerprint (never binding volatile NIC MACs or data disk serials). If you restore .bareturnconfig onto brand-new hardware, Core automatically enters a 30-day migration grace period with uninterrupted backups while you complete self-service rehost.',
    'faq.q5': 'Do retired or archived machines still consume license seats?',
    'faq.a5': 'No. Stopping protection archives the machine and immediately frees its seat for another host while keeping all historical recovery points available for browsing and restoration.',
    'foot.desc': 'On-premises whole-machine backup, bare-metal recovery, and ransomware-resilient protection for Windows & Linux. Perpetual licenses, zero subscriptions.',
    'foot.c1': 'Product',
    'foot.c2': 'Licensing & Services',
    'foot.offline': 'Offline .bareturnlic Exchange',
    'foot.rehost': 'Self-Service Rehost',
    'foot.pay': 'Payments processed by Creem (Merchant of Record) · Test Mode'
  };

  const ZH = {};
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    ZH[el.dataset.i18n] = el.innerHTML;
  });

  let lang = (() => { try { return localStorage.getItem('bareturn.site.lang') || 'zh'; } catch (_) { return 'zh'; } })();
  const langBtn = document.getElementById('lang-toggle');

  function applyLang(next) {
    lang = next === 'en' ? 'en' : 'zh';
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    langBtn.textContent = lang === 'en' ? '中' : 'EN';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.dataset.i18n;
      if (lang === 'en' && EN[k]) el.innerHTML = EN[k];
      else if (ZH[k]) el.innerHTML = ZH[k];
    });
    try { localStorage.setItem('bareturn.site.lang', lang); } catch (_) {}
    renderArch(currentArch);
    updateCalc();
  }
  langBtn.addEventListener('click', () => applyLang(lang === 'zh' ? 'en' : 'zh'));

  // ── Architecture diagrams ──
  const ARCH = {
    pull: {
      zh: {
        nodes: [
          { title: 'BareTurn Agent', sub: 'Windows / Linux · HTTPS 9803\nVSS / LVM · 源端去重压缩' },
          { title: 'BareTurn Core', sub: '主动拉取 · 调度与作业队列\nWeb 控制台 · 证书指纹固定', core: true },
          { title: '存储库 v3', sub: '本地 NTFS/ReFS 或 SMB NAS\n1 GiB 分段 · AES-256-GCM' }
        ],
        heading: 'Core 主动拉取，最小化攻击面',
        bullets: [
          '被保护端仅监听受令牌与证书固定保护的 9803 端口，完全不知道存储库路径与凭据。',
          '一次性管理员配对后使用 256 位随机令牌（DPAPI 机器级保护），Windows / Linux 密码永不落盘。',
          '多连接并行传输 + 源端 SHA-256 去重，显著降低局域网带宽占用。'
        ]
      },
      en: {
        nodes: [
          { title: 'BareTurn Agent', sub: 'Windows / Linux · HTTPS 9803\nVSS / LVM · Source Dedup' },
          { title: 'BareTurn Core', sub: 'Pull Engine · Scheduler\nWeb Console · Cert Pinning', core: true },
          { title: 'Repository v3', sub: 'Local Disk or SMB NAS\n1 GiB Segments · AES-256-GCM' }
        ],
        heading: 'Core-Initiated Pull Minimizes Attack Surface',
        bullets: [
          'Agents never see repository paths or storage credentials — compromised endpoints cannot wipe backups.',
          'One-time admin pairing issues a 256-bit Bearer token with pinned TLS fingerprints; OS passwords are never stored.',
          'Multi-lane HTTPS streaming with SHA-256 source deduplication minimizes LAN overhead.'
        ]
      }
    },
    ransomware: {
      zh: {
        nodes: [
          { title: '主存储库', sub: '加密分段块存储\n夜间汇总与完整性校验' },
          { title: '可引导离线盘', sub: 'USB 硬盘独立完整副本\n同步完成自动硬件弹出', core: true },
          { title: 'S3 不可变副本', sub: 'Object Lock Compliance\n锁定期内任何账号不可删除' }
        ],
        heading: '真正落地的 3-2-1-1-0 防勒索架构',
        bullets: [
          '离线盘复制独立完整恢复点，拔出物理断网后勒索软件与失陷管理员均无法触达。',
          '可引导离线盘内置 URC 恢复环境，即使整个机房与 Core 全部损毁，插盘开机即可原地裸机恢复。',
          'S3 Object Lock 合规锁在对象存储侧强制防篡改与防删除。'
        ]
      },
      en: {
        nodes: [
          { title: 'Primary Repo', sub: 'AES-256-GCM Segments\nNightly Rollup & Verify' },
          { title: 'Bootable Offline Drive', sub: 'Standalone USB Copies\nAuto Hardware Eject', core: true },
          { title: 'S3 Immutable Copy', sub: 'Object Lock Compliance\nTamper-Proof Retention' }
        ],
        heading: 'Practical 3-2-1-1-0 Ransomware Resilience',
        bullets: [
          'Offline drives store self-contained standalone points and automatically eject after sync for true physical air-gap.',
          'Bootable offline drives embed the URC recovery environment — boot and restore even if Core is completely gone.',
          'S3 Object Lock enforces write-once-read-many immutability against compromised credentials.'
        ]
      }
    },
    bmr: {
      zh: {
        nodes: [
          { title: 'URC 启动介质', sub: 'WinPE / Linux ISO\n或可引导离线盘启动' },
          { title: '精确分区重建', sub: 'GPT/MBR 原偏移与 GUID\n异机驱动注入 + 引导修复', core: true },
          { title: '目标裸机上线', sub: '原机或异机硬件直接引导\n数据逐字节校验一致' }
        ],
        heading: '无论同机还是异机，快速重建可引导系统',
        bullets: [
          '控制台一键构建定制 WinPE / Linux URC ISO，支持加载额外网卡与阵列卡驱动。',
          '恢复时可直连 BareTurn Core（12 小时恢复令牌），也可完全离线直接读取本机存储库或离线盘。',
          '支持多盘映射、动态调整引导项及通用存储控制器启用，消除异机蓝屏。'
        ]
      },
      en: {
        nodes: [
          { title: 'URC Boot Media', sub: 'WinPE / Linux ISO\nor Bootable USB Drive' },
          { title: 'Exact Layout Rebuild', sub: 'Original Offsets & GUIDs\nDriver Injection + Boot Fix', core: true },
          { title: 'Bare-Metal Boot', sub: 'Original or Dissimilar Hardware\nByte-Verified Integrity' }
        ],
        heading: 'Reliable Bootable Recovery on Same or New Hardware',
        bullets: [
          'Build customized WinPE and Linux URC ISO images directly in the Core console with custom NIC/RAID drivers.',
          'Restore over the network via Core or completely offline straight from a local repository or bootable USB drive.',
          'Automatic multi-disk mapping, UEFI/BIOS boot repair, and generic storage driver enablement.'
        ]
      }
    }
  };

  let currentArch = 'pull';
  function renderArch(key) {
    currentArch = key;
    const data = ARCH[key][lang];
    document.getElementById('arch-diagram').innerHTML = `<div class="arch-flow">${data.nodes.map((n, i) =>
      `${i > 0 ? '<span class="arch-arrow" aria-hidden="true">→</span>' : ''}<div class="arch-node${n.core ? ' core' : ''}"><strong>${n.title}</strong><small>${n.sub.replace(/\n/g, '<br>')}</small></div>`
    ).join('')}</div>`;
    document.getElementById('arch-notes').innerHTML = `<h3>${data.heading}</h3><ul>${data.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;
  }
  document.querySelectorAll('.arch-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.arch-tab').forEach((b) => b.classList.toggle('on', b === btn));
      renderArch(btn.dataset.arch);
    });
  });

  // ── Perpetual cost calculator ──
  const srvSlider = document.getElementById('calc-srv');
  const wsSlider = document.getElementById('calc-ws');
  function updateCalc() {
    const s = Number(srvSlider.value);
    const w = Number(wsSlider.value);
    const total = s * 299 + w * 49;
    const maint = total * 0.2;
    document.getElementById('calc-srv-val').textContent = lang === 'en' ? `${s}` : `${s} 台`;
    document.getElementById('calc-ws-val').textContent = lang === 'en' ? `${w}` : `${w} 台`;
    document.getElementById('calc-total').textContent = `$${total.toLocaleString('en-US')}`;
    document.getElementById('calc-maint').textContent = `$${maint.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${lang === 'en' ? ' / yr' : ' / 年'}`;
  }
  srvSlider.addEventListener('input', updateCalc);
  wsSlider.addEventListener('input', updateCalc);

  // ── Direct Creem Checkout via BareTurn Cloudflare Worker Portal ──
  const statusEl = document.getElementById('checkout-status');
  document.querySelectorAll('[data-buy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const sku = btn.dataset.buy;
      const qtyInput = document.getElementById(btn.dataset.qtyInput);
      const units = Math.max(1, Math.min(500, parseInt(qtyInput?.value || '1', 10) || 1));
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = lang === 'en' ? 'Connecting Creem…' : '正在创建结账…';
      statusEl.className = 'checkout-status';
      statusEl.textContent = lang === 'en' ? 'Creating secure Creem one-time checkout session…' : '正在连接 BareTurn 许可门户与 Creem 结账页…';
      try {
        const res = await fetch(`${PORTAL_URL}/api/v1/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sku, units })
        });
        const data = await res.json();
        if (!res.ok || !data.checkoutUrl) throw new Error(data.error || 'Checkout creation failed');
        window.location.href = data.checkoutUrl;
      } catch (err) {
        statusEl.className = 'checkout-status err';
        statusEl.textContent = (lang === 'en' ? 'Could not start checkout: ' : '无法创建结账会话：') + err.message;
        btn.disabled = false;
        btn.textContent = origText;
      }
    });
  });

  applyLang(lang);
})();

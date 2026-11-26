(function () {
  'use strict';

  const root = document.getElementById('hero-demo');
  if (!root) return;

  const SCENE_DURATION = 5800;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const urlEl = document.getElementById('demo-url');
  const badgeEl = document.getElementById('demo-badge');
  const playBtn = document.getElementById('demo-play-toggle');
  const bodyEl = document.getElementById('demo-body');
  const titleEl = document.getElementById('demo-stage-title');
  const topBarEl = document.getElementById('demo-top-bar');
  const topPctEl = document.getElementById('demo-top-pct');
  const viewportEl = document.getElementById('demo-viewport');
  const cursorEl = document.getElementById('demo-cursor');
  const rippleEl = document.getElementById('demo-ripple');
  const captionEl = document.getElementById('demo-caption');
  const openLinkEl = document.getElementById('demo-open-link');
  const navBtns = [...root.querySelectorAll('[data-demo-scene]')];
  const stepBtns = [...root.querySelectorAll('[data-demo-step]')];

  const TEXT = {
    zh: {
      badge: '交互演示',
      badgePaused: '已暂停',
      pauseAria: '暂停演示',
      playAria: '继续演示',
      nav: ['概览', '计算机', '分区恢复', '文件恢复', '存储库'],
      captions: [
        '保护概览 · 14 天变化量与勒索异常检测',
        '磁盘布局与恢复点链 · Windows / Linux 一目了然',
        '分区即时恢复 · iSCSI / dm-clone 秒级上线',
        '文件级恢复 · 只读挂载还原误删文件',
        '3-2-1-1-0 · 不可变副本与可引导离线盘'
      ],
      s0: {
        protTitle: '保护状态',
        protHealth: '台正常',
        segs: ['已保护', '需注意', '失败', '离线'],
        facts: [
          ['受保护数据', '4.6 TB', '368 个恢复点'],
          ['去重与压缩', '64%', '2 个存储库'],
          ['24 小时备份', '182', '98.9% 成功'],
          ['按计划完成', '7 / 9', '含 14 天趋势']
        ],
        chartTitle: '近 14 天数据变化量',
        chartSub: '按日增量',
        anomText: 'FS-02 最近 24 小时变化 9.0×（已标记防勒索核查）',
        anomBadge: '9.0× 突增',
        jobTitle: '正在进行 · 计划备份 SQL-PROD-01',
        jobSub: 'D: SQLData · 412 MB/s · 源端去重传输'
      },
      s1: {
        sub: '10.20.1.21 · Windows Server 2019 · UEFI',
        running: '正在备份',
        diskTitle: '磁盘布局（3 块磁盘 · GPT）',
        d0: '磁盘 0 · 200 GB NVMe · 系统磁盘',
        d1: '磁盘 1 · 1.0 TB RAID · 数据',
        d2: '磁盘 2 · 500 GB NVMe · 日志',
        roles: ['EFI', 'Windows', '数据', '恢复'],
        tlTitle: '恢复点链',
        tlHint: '实心为基准 · 点击节点查看',
        pts: [
          { time: '11-19 01:00', kind: '基准', delta: '782 GB', verified: '已校验 ✓' },
          { time: '11-21 22:00', kind: '增量', delta: '+1.4 GB', verified: '已校验 ✓' },
          { time: '11-23 22:00', kind: '增量', delta: '+910 MB', verified: '已校验 ✓' },
          { time: '11-24 22:00', kind: '增量', delta: '+1.1 GB', verified: '已校验 ✓' },
          { time: '昨天 22:00', kind: '增量', delta: '+760 MB', verified: '已校验 ✓' },
          { time: '今天 08:30', kind: '增量', delta: '+842 MB', verified: '已校验 ✓' }
        ],
        restoreBtn: '恢复…'
      },
      s2: {
        liveTag: '即时恢复',
        stateTag: '已上线 · 回写中',
        steps: ['① iSCSI 挂载 3s ✓', '② D: 可读写 ✓', '③ 后台回写中'],
        speed: '418 MB/s',
        onDemand: '按需读取 3.1 GB',
        onDemandHot: '按需热读取 +128 MB',
        linuxSub: '/srv · 2.0 TB · XFS → /dev/sdc1 · /srv-restored',
        linuxTag: 'dm-clone',
        linuxDone: '已完成 · 自动在线切换'
      },
      s3: {
        path: ['E: 共享文件', '财务部', '月度报表'],
        ro: '只读',
        noneSel: '已挂载只读恢复点 · 勾选文件以恢复',
        pickedPrefix: '已选',
        pickedMid: '项 ·',
        btn: '恢复到计算机…',
        rows: [
          { name: '发票扫描', size: '文件夹', meta: '24 个文件', dir: true },
          { name: '2026-09 管理报表.xlsx', size: '1.1 MB', meta: '10-08 18:10', dir: false },
          { name: '2026-10 管理报表.xlsx', size: '1.2 MB', meta: '11-04 17:42', dir: false },
          { name: '2026-11 管理报表（草稿）.xlsx', size: '0.9 MB', meta: '11-25 14:15', dir: false }
        ],
        toast: '✓ 已恢复 2 个文件（2.1 MB）至 FS-02 E:\\财务部\\月度报表'
      },
      s4: {
        r1Name: '主存储库',
        r1Status: '在线',
        r1Meta: '6.41 TB / 16 TB · 去重压缩节省 64%',
        s3Name: 'Wasabi 异地（不可变）',
        s3Status: '正常',
        s3Lock: 'Object Lock · 合规锁定 30 天',
        s3Meta: 'corp-bareturn-immutable · 9 台计算机 · 84 个不可变副本',
        offName: '离线盘 A',
        offSub: '可引导 URC 离线盘 · AES-256-GCM · 18 个独立恢复点',
        offSyncing: '同步中',
        offVerified: '已校验 ✓',
        offEjected: '已安全弹出 · 物理隔离',
        offBtn: '安全弹出',
        offBtnDone: '已断开',
        toast: '✓ 离线盘 A 已安全弹出，可拔出离线存放'
      }
    },
    en: {
      badge: 'Live preview',
      badgePaused: 'Paused',
      pauseAria: 'Pause demo',
      playAria: 'Play demo',
      nav: ['Overview', 'Machines', 'Volumes', 'File restore', 'Storage'],
      captions: [
        'Protection overview · 14-day delta & ransomware anomaly detection',
        'Disk layout & recovery chain · Windows and Linux visibility',
        'Instant volume recovery · Online in seconds via iSCSI / dm-clone',
        'File-level restore · Read-only mount to recover deleted files',
        '3-2-1-1-0 copies · S3 Object Lock & bootable offline drives'
      ],
      s0: {
        protTitle: 'Protection status',
        protHealth: 'healthy',
        segs: ['OK', 'Warn', 'Error', 'Offline'],
        facts: [
          ['Protected data', '4.6 TB', '368 recovery points'],
          ['Data reduction', '64%', '2 repositories'],
          ['24h backups', '182', '98.9% succeeded'],
          ['On schedule', '7 / 9', '14-day history']
        ],
        chartTitle: '14-day data changes',
        chartSub: 'Daily delta',
        anomText: 'FS-02 changed 9.0× over baseline in last 24h',
        anomBadge: '9.0× spike',
        jobTitle: 'Running · Scheduled backup SQL-PROD-01',
        jobSub: 'D: SQLData · 412 MB/s · source-side dedup'
      },
      s1: {
        sub: '10.20.1.21 · Windows Server 2019 · UEFI',
        running: 'Backing up',
        diskTitle: 'Disk layout (3 disks · GPT)',
        d0: 'Disk 0 · 200 GB NVMe · System',
        d1: 'Disk 1 · 1.0 TB RAID · Data',
        d2: 'Disk 2 · 500 GB NVMe · Logs',
        roles: ['EFI', 'Windows', 'Data', 'Recovery'],
        tlTitle: 'Recovery point chain',
        tlHint: 'Solid = base · click a node',
        pts: [
          { time: '11-19 01:00', kind: 'Base', delta: '782 GB', verified: 'Verified ✓' },
          { time: '11-21 22:00', kind: 'Incr', delta: '+1.4 GB', verified: 'Verified ✓' },
          { time: '11-23 22:00', kind: 'Incr', delta: '+910 MB', verified: 'Verified ✓' },
          { time: '11-24 22:00', kind: 'Incr', delta: '+1.1 GB', verified: 'Verified ✓' },
          { time: 'Yesterday 22:00', kind: 'Incr', delta: '+760 MB', verified: 'Verified ✓' },
          { time: 'Today 08:30', kind: 'Incr', delta: '+842 MB', verified: 'Verified ✓' }
        ],
        restoreBtn: 'Restore…'
      },
      s2: {
        liveTag: 'Instant',
        stateTag: 'Online · Hydrating',
        steps: ['① iSCSI mount 3s ✓', '② D: read-write ✓', '③ Hydrating'],
        speed: '418 MB/s',
        onDemand: 'On-demand 3.1 GB',
        onDemandHot: 'Hot read +128 MB',
        linuxSub: '/srv · 2.0 TB · XFS → /dev/sdc1 · /srv-restored',
        linuxTag: 'dm-clone',
        linuxDone: 'Completed · Online cutover'
      },
      s3: {
        path: ['E: Shared', 'Finance', 'Monthly'],
        ro: 'Read-only',
        noneSel: 'Read-only mount · select files to restore',
        pickedPrefix: '',
        pickedMid: 'selected ·',
        btn: 'Restore to machine…',
        rows: [
          { name: 'Invoices', size: 'Folder', meta: '24 files', dir: true },
          { name: '2026-09 Report.xlsx', size: '1.1 MB', meta: '10-08 18:10', dir: false },
          { name: '2026-10 Report.xlsx', size: '1.2 MB', meta: '11-04 17:42', dir: false },
          { name: '2026-11 Report (Draft).xlsx', size: '0.9 MB', meta: '11-25 14:15', dir: false }
        ],
        toast: '✓ Restored 2 files (2.1 MB) to FS-02 E:\\Finance\\Monthly'
      },
      s4: {
        r1Name: 'Primary Repository',
        r1Status: 'Online',
        r1Meta: '6.41 TB / 16 TB · 64% saved via dedup',
        s3Name: 'Wasabi Offsite (Immutable)',
        s3Status: 'Healthy',
        s3Lock: 'Object Lock · Compliance 30d',
        s3Meta: 'corp-bareturn-immutable · 9 machines · 84 immutable points',
        offName: 'Offline Drive A',
        offSub: 'Bootable URC drive · AES-256-GCM · 18 standalone points',
        offSyncing: 'Syncing',
        offVerified: 'Verified ✓',
        offEjected: 'Safely ejected · Air-gapped',
        offBtn: 'Safe eject',
        offBtnDone: 'Ejected',
        toast: '✓ Offline Drive A ejected safely and ready to store off-site'
      }
    }
  };

  const SCENES = [
    { hash: '#/dashboard', demoRoute: '#/dashboard' },
    { hash: '#/machines/sql-prod-01', demoRoute: '#/machines' },
    { hash: '#/volume-restores', demoRoute: '#/volume-restores' },
    { hash: '#/mounts/fs-02', demoRoute: '#/mounts' },
    { hash: '#/repositories', demoRoute: '#/repositories' }
  ];

  const CHART_HEIGHTS = [24, 31, 22, 28, 35, 26, 29, 32, 25, 30, 27, 34, 28, 96];

  const folderSvg = '<svg viewBox="0 0 24 24"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.8l2 2H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>';
  const fileSvg = '<svg viewBox="0 0 24 24"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5z"/><path d="M14 3v5h5"/></svg>';
  const lockSvg = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  let lang = (() => { try { return localStorage.getItem('bareturn.site.lang') === 'en' ? 'en' : 'zh'; } catch (_) { return 'zh'; } })();
  let activeScene = 0;
  let sceneElapsed = 0;
  let manualPaused = reducedMotion;
  let hoverPaused = false;
  let focusPaused = false;
  let hadKeyboard = false;
  let inView = true;
  let lastTs = 0;
  let firedBeats = new Set();

  // Scene-local mutable state for interactive / settled rendering
  let s1SelectedPt = 3;
  let s3Checked = [false, false, false, false];
  let s3Toast = false;
  let s4Phase = 'syncing'; // 'syncing' | 'verified' | 'ejected'

  const isPaused = () => manualPaused || hoverPaused || focusPaused || !inView || document.hidden;

  function moveCursorTo(el) {
    if (reducedMotion || !el || !bodyEl) { cursorEl.classList.add('is-hidden'); return; }
    const br = bodyEl.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (!er.width || !er.height || er.right < br.left || er.left > br.right) {
      cursorEl.classList.add('is-hidden');
      return;
    }
    const x = Math.round(er.left - br.left + er.width * 0.56);
    const y = Math.round(er.top - br.top + er.height * 0.54);
    cursorEl.classList.remove('is-hidden');
    cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function clickCursor() {
    if (reducedMotion || cursorEl.classList.contains('is-hidden')) return;
    cursorEl.classList.add('is-clicking');
    rippleEl.classList.remove('pop');
    void rippleEl.offsetWidth;
    rippleEl.classList.add('pop');
    setTimeout(() => cursorEl.classList.remove('is-clicking'), 140);
  }

  function renderSceneHtml(idx) {
    const t = TEXT[lang];
    if (idx === 0) {
      const s = t.s0;
      const pct = Math.min(64, Math.round(48 + (sceneElapsed / SCENE_DURATION) * 16));
      return `
        <div class="demo-scene" data-scene="0">
          <div class="dm-card dm-ov-top">
            <div>
              <div class="dm-figure">5<small>/ 9 ${s.protHealth}</small></div>
              <div class="dm-statebar" aria-hidden="true">
                <span style="flex:5;background:#2fb3a1"></span>
                <span style="flex:2;background:#e0a24a;animation-delay:.07s"></span>
                <span style="flex:1;background:#ef7d6d;animation-delay:.14s"></span>
                <span style="flex:1;background:#74828b;animation-delay:.21s"></span>
              </div>
              <div class="dm-legend">
                <span><i style="background:#2fb3a1"></i>${s.segs[0]} 5</span>
                <span><i style="background:#e0a24a"></i>${s.segs[1]} 2</span>
                <span><i style="background:#ef7d6d"></i>${s.segs[2]} 1</span>
                <span><i style="background:#74828b"></i>${s.segs[3]} 1</span>
              </div>
            </div>
            <div class="dm-facts">
              ${s.facts.map(([k, v, d]) => `<div class="dm-fact"><small>${k}</small><strong>${v}</strong><span>${d}</span></div>`).join('')}
            </div>
          </div>

          <div class="dm-card dm-chart-wrap">
            <div class="dm-head" style="margin-bottom:2px">
              <span class="dm-head-title">${s.chartTitle}</span>
              <span class="dm-sub">${s.chartSub}</span>
            </div>
            <div class="dm-bars" aria-hidden="true">
              ${CHART_HEIGHTS.map((h, i) => `<div class="dm-col${i === 13 ? ' anom' : ''}" ${i === 13 ? 'id="dm-anom-bar"' : ''}><span style="height:${h}%;animation-delay:${(i * 0.03).toFixed(2)}s"></span></div>`).join('')}
            </div>
            <div class="dm-anom-chip" id="dm-anom-chip">
              <span>${s.anomText}</span>
              <span class="dm-pill warn">${s.anomBadge}</span>
            </div>
          </div>

          <div class="dm-card dm-job-line">
            <div class="dm-job-top">
              <b>${s.jobTitle}</b>
              <span class="dm-mono" id="dm-s0-pct" style="color:#9eb9ff">${pct}%</span>
            </div>
            <div class="dm-bar"><span id="dm-s0-bar" style="width:${pct}%"></span></div>
            <div class="dm-sub">${s.jobSub}</div>
          </div>
        </div>`;
    }

    if (idx === 1) {
      const s = t.s1;
      const pt = s.pts[s1SelectedPt];
      return `
        <div class="demo-scene" data-scene="1">
          <div class="dm-card">
            <div class="dm-head" style="margin-bottom:8px">
              <div>
                <div class="dm-head-title">SQL-PROD-01 <span class="dm-pill run">${s.running}</span></div>
                <div class="dm-sub">${s.sub}</div>
              </div>
              <span class="dm-tag brand">${s.diskTitle}</span>
            </div>
            <div class="dm-disk-list">
              <div class="dm-disk-row">
                <div class="dm-disk-meta"><strong>${s.d0}</strong></div>
                <div class="dm-disk-bar">
                  <div class="dm-part" style="flex:.06;--pc:#7b61c9;--used:45%"><span class="fill"></span></div>
                  <div class="dm-part" style="flex:.04;--pc:#7e8d95;--used:100%"><span class="fill"></span></div>
                  <div class="dm-part" style="flex:.82;--pc:#2fb3a1;--used:37%"><span class="fill"></span><span>C: Windows · 37%</span></div>
                  <div class="dm-part" style="flex:.08;--pc:#cf8a26;--used:88%"><span class="fill"></span></div>
                </div>
              </div>
              <div class="dm-disk-row">
                <div class="dm-disk-meta"><strong>${s.d1}</strong></div>
                <div class="dm-disk-bar">
                  <div class="dm-part" style="flex:1;--pc:#4b83f2;--used:62%"><span class="fill"></span><span>D: SQLData · NTFS · 618 GB / 1.0 TB</span></div>
                </div>
              </div>
              <div class="dm-disk-row">
                <div class="dm-disk-meta"><strong>${s.d2}</strong></div>
                <div class="dm-disk-bar">
                  <div class="dm-part" style="flex:1;--pc:#4b83f2;--used:26%"><span class="fill"></span><span>L: SQLLogs · NTFS · 132 / 500 GB</span></div>
                </div>
              </div>
            </div>
            <div class="dm-role-key" style="margin-top:6px">
              <span style="--pc:#7b61c9"><i></i>${s.roles[0]}</span>
              <span style="--pc:#2fb3a1"><i></i>${s.roles[1]}</span>
              <span style="--pc:#4b83f2"><i></i>${s.roles[2]}</span>
              <span style="--pc:#cf8a26"><i></i>${s.roles[3]}</span>
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-head" style="margin-bottom:2px">
              <span class="dm-head-title">${s.tlTitle}</span>
              <span class="dm-sub">${s.tlHint}</span>
            </div>
            <div class="dm-timeline">
              <div class="dm-tl-axis">
                <div class="dm-tl-chain" aria-hidden="true"></div>
                ${s.pts.map((p, i) => `<button type="button" class="dm-pt${i === 0 ? ' base' : ''}${i === s1SelectedPt ? ' sel' : ''}" data-dm-pt="${i}" aria-label="${p.time}"></button>`).join('')}
              </div>
            </div>
            <div class="dm-tl-detail" id="dm-tl-detail">
              <span><b style="color:#fff">${pt.time}</b> · <span class="dm-tag">${pt.kind}</span> · <span class="dm-mono">${pt.delta}</span> · <span style="color:#5fd6c4">${pt.verified}</span></span>
              <span class="dm-btn primary" id="dm-s1-restore">${s.restoreBtn}</span>
            </div>
          </div>
        </div>`;
    }

    if (idx === 2) {
      const s = t.s2;
      const pct = reducedMotion ? 74 : Math.min(76, Math.round(37 + (sceneElapsed / SCENE_DURATION) * 39));
      const doneGb = Math.round(pct * 10);
      return `
        <div class="demo-scene" data-scene="2">
          <div class="dm-card is-flash">
            <div class="dm-head">
              <div>
                <div class="dm-head-title">SQL-PROD-01 · D: SQLData <span class="dm-tag brand">${s.liveTag}</span></div>
                <div class="dm-sub">1.0 TB · NTFS · iSCSI Loopback → D:</div>
              </div>
              <span class="dm-pill run">${s.stateTag}</span>
            </div>
            <div class="dm-live-steps">
              <div class="dm-lstep done"><b>${s.steps[0]}</b></div>
              <div class="dm-lstep done"><b>${s.steps[1]}</b></div>
              <div class="dm-lstep active"><b>${s.steps[2]}</b></div>
            </div>
            <div class="dm-bar"><span id="dm-s2-bar" style="width:${pct}%"></span></div>
            <div class="dm-live-stats">
              <span class="dm-mono" id="dm-s2-bytes">${doneGb} GB / 1.0 TB · ${pct}% · ${s.speed}</span>
              <span class="dm-ondemand" id="dm-s2-ondemand">${s.onDemand}</span>
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-head">
              <div>
                <div class="dm-head-title">web-01 · /srv <span class="dm-tag">${s.linuxTag}</span></div>
                <div class="dm-sub">${s.linuxSub}</div>
              </div>
              <span class="dm-pill ok">${s.linuxDone}</span>
            </div>
            <div class="dm-bar ok"><span style="width:100%"></span></div>
            <div class="dm-live-stats">
              <span class="dm-mono">2.0 TB / 2.0 TB · 100%</span>
              <span class="dm-sub">ext4 / XFS · Zero-downtime</span>
            </div>
          </div>
        </div>`;
    }

    if (idx === 3) {
      const s = t.s3;
      const count = s3Checked.filter(Boolean).length;
      const totalMb = (s3Checked[2] ? 1.2 : 0) + (s3Checked[3] ? 0.9 : 0);
      return `
        <div class="demo-scene" data-scene="3">
          <div class="dm-card" style="padding:0;overflow:hidden">
            <div class="dm-head" style="padding:8px 10px;margin:0;border-bottom:1px solid #1e333c">
              <div class="dm-pathbar">
                <span>${s.path[0]}</span><span>›</span><span>${s.path[1]}</span><span>›</span><b>${s.path[2]}</b>
              </div>
              <span class="dm-tag brand">${s.ro}</span>
            </div>
            <div class="dm-selbar">
              <span class="dm-sub" id="dm-s3-count">${count ? `${s.pickedPrefix ? s.pickedPrefix + ' ' : ''}${count} ${s.pickedMid} ${totalMb.toFixed(1)} MB` : s.noneSel}</span>
              <button type="button" class="dm-btn primary${count ? '' : ' is-disabled'}" id="dm-s3-btn">${s.btn}</button>
            </div>
            <div class="dm-files">
              ${s.rows.map((r, i) => `
                <div class="dm-frow${r.dir ? ' is-dir' : ''}${s3Checked[i] ? ' sel' : ''}" data-dm-frow="${i}">
                  <span class="dm-chk"></span>
                  <div class="dm-fname">${r.dir ? folderSvg : fileSvg}<span>${r.name}</span></div>
                  <span class="dm-mono dm-sub">${r.size}</span>
                  <span class="dm-sub">${r.meta}</span>
                </div>`).join('')}
            </div>
          </div>
          <div class="dm-toast${s3Toast ? ' show' : ''}" id="dm-s3-toast">${s.toast}</div>
        </div>`;
    }

    // Scene 4: Repositories, S3 Object Lock, Offline Drive
    const s = t.s4;
    const syncPct = s4Phase === 'syncing' ? Math.min(100, Math.round(86 + (sceneElapsed / 1700) * 14)) : 100;
    const offPill = s4Phase === 'syncing'
      ? `<span class="dm-pill run" id="dm-s4-pill">${s.offSyncing} ${syncPct}%</span>`
      : s4Phase === 'verified'
        ? `<span class="dm-pill ok" id="dm-s4-pill">${s.offVerified}</span>`
        : `<span class="dm-pill off" id="dm-s4-pill">${s.offEjected}</span>`;
    return `
      <div class="demo-scene" data-scene="4">
        <div class="dm-card">
          <div class="dm-head" style="margin-bottom:2px">
            <span class="dm-head-title">${s.r1Name} <span class="dm-tag">${lockSvg} AES-256-GCM</span></span>
            <span class="dm-pill ok">${s.r1Status}</span>
          </div>
          <div class="dm-capbar" aria-hidden="true"><span class="repo" style="width:40%"></span><span class="other" style="width:6%"></span></div>
          <div class="dm-repo-meta"><span class="dm-mono">D:\\BareTurnRepository</span><span>${s.r1Meta}</span></div>
        </div>

        <div class="dm-card">
          <div class="dm-head" style="margin-bottom:4px">
            <span class="dm-head-title">${s.s3Name}</span>
            <span class="dm-pill ok">${s.s3Status}</span>
          </div>
          <div class="dm-repo-meta">
            <span class="dm-tag brand">${lockSvg} ${s.s3Lock}</span>
            <span>${s.s3Meta}</span>
          </div>
        </div>

        <div class="dm-card${s4Phase === 'ejected' ? ' is-flash' : ''}" id="dm-s4-off-card">
          <div class="dm-head" style="margin-bottom:4px">
            <div>
              <div class="dm-head-title">${s.offName} ${offPill}</div>
              <div class="dm-sub">${s.offSub}</div>
            </div>
            <button type="button" class="dm-btn${s4Phase === 'verified' ? ' primary' : ' is-disabled'}" id="dm-s4-eject">${s4Phase === 'ejected' ? s.offBtnDone : s.offBtn}</button>
          </div>
          <div class="dm-bar${s4Phase !== 'syncing' ? ' ok' : ''}"><span id="dm-s4-bar" style="width:${syncPct}%"></span></div>
        </div>
        <div class="dm-toast${s4Phase === 'ejected' ? ' show' : ''}" id="dm-s4-toast">${s.toast}</div>
      </div>`;
  }

  function applyChrome() {
    const t = TEXT[lang];
    const sc = SCENES[activeScene];
    urlEl.textContent = 'https://core.corp.local:9843/' + sc.hash;
    openLinkEl.href = 'demo.html' + sc.demoRoute;
    titleEl.textContent = t.nav[activeScene];
    captionEl.textContent = t.captions[activeScene];

    navBtns.forEach((btn, i) => {
      const span = btn.querySelector('[data-demo-nav]');
      if (span) span.textContent = t.nav[i];
      const on = i === activeScene;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    stepBtns.forEach((btn, i) => {
      btn.setAttribute('aria-label', t.nav[i]);
      btn.classList.toggle('on', i === activeScene);
      btn.classList.toggle('done', i < activeScene);
      const fill = btn.querySelector('i');
      if (fill) fill.style.width = i < activeScene ? '100%' : i === activeScene ? `${Math.min(100, (sceneElapsed / SCENE_DURATION) * 100).toFixed(1)}%` : '0%';
    });

    const paused = manualPaused;
    root.classList.toggle('is-paused', paused);
    badgeEl.textContent = paused ? t.badgePaused : t.badge;
    playBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    playBtn.setAttribute('aria-label', paused ? t.playAria : t.pauseAria);
  }

  function settleSceneForStaticView(idx) {
    s1SelectedPt = 5;
    s3Checked = [false, false, true, true];
    s3Toast = true;
    s4Phase = 'ejected';
    if (idx === 1) s1SelectedPt = 5;
  }

  function enterScene(idx, settle) {
    activeScene = ((idx % SCENES.length) + SCENES.length) % SCENES.length;
    sceneElapsed = 0;
    firedBeats = new Set();
    s1SelectedPt = 3;
    s3Checked = [false, false, false, false];
    s3Toast = false;
    s4Phase = 'syncing';
    if (settle) settleSceneForStaticView(activeScene);
    cursorEl.classList.add('is-hidden');
    applyChrome();
    viewportEl.innerHTML = renderSceneHtml(activeScene);
    bindSceneInteractions();
    if (settle && activeScene === 0) {
      const chip = document.getElementById('dm-anom-chip');
      const bar = document.getElementById('dm-anom-bar');
      if (chip) chip.classList.add('is-hot');
      if (bar) bar.classList.add('is-hot');
    }
  }

  function bindSceneInteractions() {
    if (activeScene === 1) {
      viewportEl.querySelectorAll('[data-dm-pt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          s1SelectedPt = Number(btn.dataset.dmPt);
          updateS1Point();
        });
      });
    }
  }

  function updateS1Point() {
    const s = TEXT[lang].s1;
    const pt = s.pts[s1SelectedPt];
    viewportEl.querySelectorAll('[data-dm-pt]').forEach((b, i) => b.classList.toggle('sel', i === s1SelectedPt));
    const detail = document.getElementById('dm-tl-detail');
    if (detail) {
      detail.innerHTML = `<span><b style="color:#fff">${pt.time}</b> · <span class="dm-tag">${pt.kind}</span> · <span class="dm-mono">${pt.delta}</span> · <span style="color:#5fd6c4">${pt.verified}</span></span><span class="dm-btn primary is-active" id="dm-s1-restore">${s.restoreBtn}</span>`;
    }
  }

  function updateS3Selection() {
    const s = TEXT[lang].s3;
    const count = s3Checked.filter(Boolean).length;
    const totalMb = (s3Checked[2] ? 1.2 : 0) + (s3Checked[3] ? 0.9 : 0);
    viewportEl.querySelectorAll('[data-dm-frow]').forEach((row, i) => row.classList.toggle('sel', !!s3Checked[i]));
    const countEl = document.getElementById('dm-s3-count');
    if (countEl) countEl.textContent = count ? `${s.pickedPrefix ? s.pickedPrefix + ' ' : ''}${count} ${s.pickedMid} ${totalMb.toFixed(1)} MB` : s.noneSel;
    const btn = document.getElementById('dm-s3-btn');
    if (btn) btn.classList.toggle('is-disabled', !count);
  }

  function updateS4Offline() {
    const s = TEXT[lang].s4;
    const card = document.getElementById('dm-s4-off-card');
    const pill = document.getElementById('dm-s4-pill');
    const btn = document.getElementById('dm-s4-eject');
    const bar = document.getElementById('dm-s4-bar');
    const toast = document.getElementById('dm-s4-toast');
    if (!pill || !btn || !bar) return;
    if (s4Phase === 'verified') {
      pill.className = 'dm-pill ok';
      pill.textContent = s.offVerified;
      btn.className = 'dm-btn primary';
      btn.textContent = s.offBtn;
      bar.style.width = '100%';
      bar.parentElement.classList.add('ok');
    } else if (s4Phase === 'ejected') {
      pill.className = 'dm-pill off';
      pill.textContent = s.offEjected;
      btn.className = 'dm-btn is-disabled';
      btn.textContent = s.offBtnDone;
      bar.style.width = '100%';
      bar.parentElement.classList.add('ok');
      if (card) card.classList.add('is-flash');
      if (toast) toast.classList.add('show');
    }
  }

  function once(key, fn) {
    if (firedBeats.has(key)) return;
    firedBeats.add(key);
    fn();
  }

  function updateContinuousAndBeats() {
    // Topbar running job ticks smoothly 48% -> 82% across the 5 scenes
    const globalPct = Math.round(48 + ((activeScene * SCENE_DURATION + sceneElapsed) / (SCENES.length * SCENE_DURATION)) * 34);
    if (topBarEl) topBarEl.style.width = globalPct + '%';
    if (topPctEl) topPctEl.textContent = globalPct + '%';

    const curSeg = stepBtns[activeScene]?.querySelector('i');
    if (curSeg) curSeg.style.width = Math.min(100, (sceneElapsed / SCENE_DURATION) * 100).toFixed(1) + '%';

    if (activeScene === 0) {
      const p0 = Math.min(64, Math.round(48 + (sceneElapsed / SCENE_DURATION) * 16));
      const b0 = document.getElementById('dm-s0-bar');
      const t0 = document.getElementById('dm-s0-pct');
      if (b0) b0.style.width = p0 + '%';
      if (t0) t0.textContent = p0 + '%';
      if (sceneElapsed >= 1350) once('s0-hover', () => {
        moveCursorTo(document.getElementById('dm-anom-bar'));
        document.getElementById('dm-anom-bar')?.classList.add('is-hot');
        document.getElementById('dm-anom-chip')?.classList.add('is-hot');
      });
      if (sceneElapsed >= 4700) once('s0-nav', () => moveCursorTo(navBtns[1]));
      if (sceneElapsed >= 5350) once('s0-click', () => clickCursor());
    } else if (activeScene === 1) {
      if (sceneElapsed >= 950) once('s1-m1', () => moveCursorTo(viewportEl.querySelector('[data-dm-pt="4"]')));
      if (sceneElapsed >= 1450) once('s1-c1', () => { clickCursor(); s1SelectedPt = 4; updateS1Point(); });
      if (sceneElapsed >= 2450) once('s1-m2', () => moveCursorTo(viewportEl.querySelector('[data-dm-pt="5"]')));
      if (sceneElapsed >= 2950) once('s1-c2', () => { clickCursor(); s1SelectedPt = 5; updateS1Point(); });
      if (sceneElapsed >= 4700) once('s1-nav', () => moveCursorTo(navBtns[2]));
      if (sceneElapsed >= 5350) once('s1-click', () => clickCursor());
    } else if (activeScene === 2) {
      const p2 = Math.min(76, Math.round(37 + (sceneElapsed / SCENE_DURATION) * 39));
      const b2 = document.getElementById('dm-s2-bar');
      const t2 = document.getElementById('dm-s2-bytes');
      if (b2) b2.style.width = p2 + '%';
      if (t2) t2.textContent = `${p2 * 10} GB / 1.0 TB · ${p2}% · ${TEXT[lang].s2.speed}`;
      if (sceneElapsed >= 1650) once('s2-hot', () => {
        const od = document.getElementById('dm-s2-ondemand');
        moveCursorTo(od);
        if (od) { od.classList.add('is-hot'); od.textContent = TEXT[lang].s2.onDemandHot; }
      });
      if (sceneElapsed >= 3400) once('s2-cool', () => {
        const od = document.getElementById('dm-s2-ondemand');
        if (od) { od.classList.remove('is-hot'); od.textContent = TEXT[lang].s2.onDemand; }
      });
      if (sceneElapsed >= 4700) once('s2-nav', () => moveCursorTo(navBtns[3]));
      if (sceneElapsed >= 5350) once('s2-click', () => clickCursor());
    } else if (activeScene === 3) {
      if (sceneElapsed >= 800) once('s3-m1', () => moveCursorTo(viewportEl.querySelector('[data-dm-frow="2"]')));
      if (sceneElapsed >= 1300) once('s3-c1', () => { clickCursor(); s3Checked[2] = true; updateS3Selection(); });
      if (sceneElapsed >= 1800) once('s3-m2', () => moveCursorTo(viewportEl.querySelector('[data-dm-frow="3"]')));
      if (sceneElapsed >= 2250) once('s3-c2', () => { clickCursor(); s3Checked[3] = true; updateS3Selection(); });
      if (sceneElapsed >= 2850) once('s3-m3', () => moveCursorTo(document.getElementById('dm-s3-btn')));
      if (sceneElapsed >= 3350) once('s3-c3', () => {
        clickCursor();
        s3Toast = true;
        document.getElementById('dm-s3-btn')?.classList.add('is-active');
        document.getElementById('dm-s3-toast')?.classList.add('show');
      });
      if (sceneElapsed >= 4750) once('s3-nav', () => moveCursorTo(navBtns[4]));
      if (sceneElapsed >= 5350) once('s3-click', () => clickCursor());
    } else if (activeScene === 4) {
      if (s4Phase === 'syncing') {
        const sp = Math.min(100, Math.round(86 + (sceneElapsed / 1700) * 14));
        const pill = document.getElementById('dm-s4-pill');
        const bar = document.getElementById('dm-s4-bar');
        if (pill) pill.textContent = `${TEXT[lang].s4.offSyncing} ${sp}%`;
        if (bar) bar.style.width = sp + '%';
      }
      if (sceneElapsed >= 1750) once('s4-ver', () => { s4Phase = 'verified'; updateS4Offline(); });
      if (sceneElapsed >= 2450) once('s4-m1', () => moveCursorTo(document.getElementById('dm-s4-eject')));
      if (sceneElapsed >= 3050) once('s4-c1', () => { clickCursor(); s4Phase = 'ejected'; updateS4Offline(); });
      if (sceneElapsed >= 4750) once('s4-nav', () => moveCursorTo(navBtns[0]));
      if (sceneElapsed >= 5350) once('s4-click', () => clickCursor());
    }
  }

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(100, ts - lastTs);
    lastTs = ts;
    if (!isPaused()) {
      sceneElapsed += dt;
      if (sceneElapsed >= SCENE_DURATION) {
        enterScene((activeScene + 1) % SCENES.length, false);
      } else {
        updateContinuousAndBeats();
      }
    }
    requestAnimationFrame(frame);
  }

  navBtns.forEach((btn) => btn.addEventListener('click', () => enterScene(Number(btn.dataset.demoScene), isPaused())));
  stepBtns.forEach((btn) => btn.addEventListener('click', () => enterScene(Number(btn.dataset.demoStep), isPaused())));
  playBtn.addEventListener('click', () => {
    manualPaused = !manualPaused;
    applyChrome();
    if (manualPaused) cursorEl.classList.add('is-hidden');
  });

  root.addEventListener('pointerdown', () => { hadKeyboard = false; focusPaused = false; });
  root.addEventListener('keydown', () => { hadKeyboard = true; });
  root.addEventListener('mouseenter', () => { hoverPaused = true; });
  root.addEventListener('mouseleave', () => { hoverPaused = false; focusPaused = false; lastTs = 0; });
  root.addEventListener('focusin', () => { if (hadKeyboard) focusPaused = true; });
  root.addEventListener('focusout', () => { focusPaused = false; lastTs = 0; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0] ? entries[0].isIntersecting : true;
      if (inView) lastTs = 0;
    }, { threshold: 0.15 }).observe(root);
  }

  window.BTHeroDemo = {
    setLang(next) {
      lang = next === 'en' ? 'en' : 'zh';
      applyChrome();
      viewportEl.innerHTML = renderSceneHtml(activeScene);
      bindSceneInteractions();
    },
    goTo(idx) { enterScene(Number(idx) || 0, isPaused()); },
    setPaused(v) { manualPaused = !!v; applyChrome(); }
  };

  enterScene(0, reducedMotion);
  requestAnimationFrame(frame);
})();

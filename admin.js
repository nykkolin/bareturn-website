(function () {
  'use strict';
  const P = window.BTPortal;
  P.initTheme();

  let me = null;
  let cache = { users: [], licenses: [], orders: [], trials: [], logs: [] };
  let activeTab = 'users';

  document.getElementById('btn-logout').onclick = () => P.logout('login.html');
  document.getElementById('btn-refresh').onclick = () => loadAll();

  document.querySelectorAll('.portal-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('.portal-tabs button').forEach((b) => b.classList.toggle('on', b === btn));
      ['users', 'licenses', 'orders', 'trials', 'audit'].forEach((t) => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== activeTab);
      });
    });
  });

  async function init() {
    if (!P.getToken()) { location.href = 'login.html?next=admin.html'; return; }
    me = await P.refreshUser();
    if (!me) { location.href = 'login.html?next=admin.html'; return; }
    document.getElementById('admin-user-label').textContent = `${me.name} (${me.email})`;
    if (me.role !== 'admin') {
      document.getElementById('admin-root').innerHTML = `<div class="panel"><div class="empty-box"><h3>需要管理员权限</h3><p>当前账号（${P.esc(me.email)}）为普通用户，无法访问运营管理后台。</p><a class="btn primary" href="account.html">返回我的账户</a></div></div>`;
      return;
    }
    await loadAll();
  }

  async function loadAll() {
    try {
      const [ov, u, l, o, tr, a] = await Promise.all([
        P.api('/api/v1/admin/overview'),
        loadUsers(),
        loadLicenses(),
        loadOrders(),
        loadTrials().catch(() => null),
        P.api('/api/v1/admin/audit?limit=100')
      ]);
      renderOverview(ov);
      cache.logs = a.logs || [];
      renderAudit();
    } catch (err) { P.toast(err.message, 'err'); }
  }

  function renderOverview(ov) {
    document.getElementById('ak-users').textContent = ov.users.total;
    document.getElementById('ak-users-sub').textContent = `正常 ${ov.users.active} · 管理员 ${ov.users.admins}`;
    document.getElementById('ak-rev').textContent = P.fmtUsdCents(ov.orders.revenueCents);
    document.getElementById('ak-ord-sub').textContent = `总订单 ${ov.orders.total}（成交 ${ov.orders.paid}）`;
    document.getElementById('ak-lic').textContent = ov.licenses.active;
    document.getElementById('ak-lic-sub').textContent = `总计 ${ov.licenses.total} · 已绑定 Core ${ov.licenses.boundCores}`;
    document.getElementById('ak-seats').textContent = ov.licenses.serverSeats + ov.licenses.workstationSeats;
    document.getElementById('ak-seats-sub').textContent = `${ov.licenses.serverSeats} Server · ${ov.licenses.workstationSeats} Workstation`;
  }

  async function loadUsers() {
    const q = new URLSearchParams({
      q: document.getElementById('u-q').value.trim(),
      role: document.getElementById('u-role').value,
      status: document.getElementById('u-status').value
    });
    const res = await P.api('/api/v1/admin/users?' + q.toString());
    cache.users = res.users || [];
    const tb = document.getElementById('u-tbody');
    if (!cache.users.length) { tb.innerHTML = '<tr><td colspan="7" class="empty-box">没有匹配的用户。</td></tr>'; return; }
    tb.innerHTML = cache.users.map((u) => {
      const provHtml = (u.providers || []).length
        ? `<div style="margin-top:4px">${u.providers.map((p) => `<span class="provider-pill">${P.esc(p)}</span>`).join('')}</div>`
        : '';
      return `<tr>
      <td><strong>${P.esc(u.name)}</strong><div class="muted" style="font-size:12px">${P.esc(u.email)}${u.company ? ' · ' + P.esc(u.company) : ''}</div>${provHtml}</td>
      <td>${u.role === 'admin' ? '<span class="badge ok">管理员</span>' : '<span class="badge muted">用户</span>'}</td>
      <td>${u.disabled ? '<span class="badge err">已停用</span>' : '<span class="badge ok">正常</span>'}</td>
      <td>${u.orderCount} 单 / ${u.licenseCount} 许可</td>
      <td>${u.serverSeats} S · ${u.workstationSeats} W</td>
      <td style="font-size:12px">${P.esc(P.fmtDate(u.createdAt))}<div class="muted">登录：${P.esc(P.fmtDate(u.lastLoginAt))}</div></td>
      <td><div class="cell-actions">
        <button class="btn xs" data-u-detail="${P.esc(u.id)}">详情</button>
        <button class="btn xs" data-u-edit="${P.esc(u.id)}">编辑</button>
        <button class="btn xs primary" data-u-grant="${P.esc(u.id)}">发许可</button>
      </div></td>
    </tr>`;
    }).join('');
  }

  async function loadLicenses() {
    const q = new URLSearchParams({
      q: document.getElementById('l-q').value.trim(),
      status: document.getElementById('l-status').value
    });
    const res = await P.api('/api/v1/admin/licenses?' + q.toString());
    cache.licenses = res.licenses || [];
    const tb = document.getElementById('l-tbody');
    if (!cache.licenses.length) { tb.innerHTML = '<tr><td colspan="7" class="empty-box">没有匹配的许可。</td></tr>'; return; }
    tb.innerHTML = cache.licenses.map((l) => `<tr>
      <td><button class="btn xs ghost mono" data-copy="${P.esc(l.activation_code)}">${P.esc(l.activation_code)}</button>${l.notes ? `<div class="muted" style="font-size:11.5px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${P.esc(l.notes)}</div>` : ''}</td>
      <td><strong>${P.esc(l.owner_name || l.customer_name)}</strong><div class="muted" style="font-size:12px">${P.esc(l.owner_email || l.customer_email || '未关联邮箱')}</div></td>
      <td><strong>${l.server_seats}</strong> S · <strong>${l.workstation_seats}</strong> W</td>
      <td>${P.statusBadge(l.status)}</td>
      <td class="mono" style="font-size:11.5px">${l.bound_core_id ? P.esc(l.bound_core_id.slice(0, 13) + '…') : '<span class="muted">未绑定</span>'}</td>
      <td>${l.rehost_count || 0}/${l.max_self_rehosts ?? 3}</td>
      <td><div class="cell-actions">
        <button class="btn xs" data-l-edit="${P.esc(l.id)}">管理</button>
        ${l.bound_core_id ? `<button class="btn xs" data-l-unbind="${P.esc(l.id)}">解绑 Core</button>` : ''}
        <button class="btn xs primary" data-l-issue="${P.esc(l.id)}">代签 .req</button>
      </div></td>
    </tr>`).join('');
  }

  async function loadOrders() {
    const q = new URLSearchParams({
      q: document.getElementById('o-q').value.trim(),
      status: document.getElementById('o-status').value
    });
    const res = await P.api('/api/v1/admin/orders?' + q.toString());
    cache.orders = res.orders || [];
    const tb = document.getElementById('o-tbody');
    if (!cache.orders.length) { tb.innerHTML = '<tr><td colspan="7" class="empty-box">没有匹配的订单。</td></tr>'; return; }
    tb.innerHTML = cache.orders.map((o) => `<tr>
      <td style="font-size:12px">${P.esc(P.fmtDate(o.created_at))}</td>
      <td class="mono">${P.esc(o.creem_order_id || o.creem_checkout_id || o.id.slice(0, 8))}</td>
      <td>${P.esc(o.user_email || o.customer_email || '—')}</td>
      <td>${o.server_seats} S · ${o.workstation_seats} W</td>
      <td><strong>${P.fmtUsdCents(o.amount_cents)}</strong></td>
      <td>${P.statusBadge(o.status)}</td>
      <td class="mono">${o.activation_code ? P.esc(o.activation_code) : '—'}</td>
    </tr>`).join('');
  }

  async function loadTrials() {
    const tb = document.getElementById('t-tbody');
    if (!tb) return;
    try {
      const q = new URLSearchParams({ q: document.getElementById('t-q').value.trim() });
      const res = await P.api('/api/v1/admin/trials?' + q.toString());
      cache.trials = res.trials || [];
      if (!cache.trials.length) { tb.innerHTML = '<tr><td colspan="5" class="empty-box">暂无试用申请记录。</td></tr>'; return; }
      tb.innerHTML = cache.trials.map((r) => `<tr>
        <td style="font-size:12px;white-space:nowrap">${P.esc(P.fmtDate(r.created_at))}</td>
        <td><strong>${P.esc(r.company || '—')}</strong><div class="muted" style="font-size:12px">${P.esc(r.contact_name || '未填联系人')}</div></td>
        <td class="mono">${P.esc(r.phone)}</td>
        <td>${P.esc(r.email)}</td>
        <td style="font-size:12.5px;max-width:340px;white-space:pre-wrap;word-break:break-word">${P.esc(r.notes || '—')}</td>
      </tr>`).join('');
    } catch (_) {
      tb.innerHTML = '<tr><td colspan="5" class="empty-box">暂无法读取试用申请（需先部署 Worker 迁移 0004）。</td></tr>';
    }
  }

  function renderAudit() {
    const tb = document.getElementById('a-tbody');
    if (!cache.logs.length) { tb.innerHTML = '<tr><td colspan="5" class="empty-box">暂无管理员操作审计记录。</td></tr>'; return; }
    tb.innerHTML = cache.logs.map((a) => `<tr>
      <td style="font-size:12px;white-space:nowrap">${P.esc(P.fmtDate(a.created_at))}</td>
      <td>${P.esc(a.admin_email)}</td>
      <td><span class="badge muted">${P.esc(a.action)}</span></td>
      <td class="mono">${P.esc(a.target_type)}:${P.esc(String(a.target_id).slice(0, 12))}</td>
      <td class="mono" style="font-size:11.5px;max-width:340px;word-break:break-all">${P.esc(a.details_json || '')}</td>
    </tr>`).join('');
  }

  ['u-q', 'u-role', 'u-status'].forEach((id) => document.getElementById(id).addEventListener('input', () => loadUsers()));
  ['l-q', 'l-status'].forEach((id) => document.getElementById(id).addEventListener('input', () => loadLicenses()));
  ['o-q', 'o-status'].forEach((id) => document.getElementById(id).addEventListener('input', () => loadOrders()));
  document.getElementById('t-q').addEventListener('input', () => loadTrials());

  document.addEventListener('click', async (e) => {
    const cp = e.target.closest('[data-copy]'); if (cp) { P.copyText(cp.dataset.copy); return; }
    const ud = e.target.closest('[data-u-detail]'); if (ud) { await openUserDetail(ud.dataset.uDetail); return; }
    const ue = e.target.closest('[data-u-edit]'); if (ue) { openUserEdit(ue.dataset.uEdit); return; }
    const ug = e.target.closest('[data-u-grant]'); if (ug) { openGrantModal(ug.dataset.uGrant); return; }
    const le = e.target.closest('[data-l-edit]'); if (le) { openLicenseEdit(le.dataset.lEdit); return; }
    const lu = e.target.closest('[data-l-unbind]'); if (lu) { await unbindLicense(lu.dataset.lUnbind); return; }
    const li = e.target.closest('[data-l-issue]'); if (li) { openAdminIssueModal(li.dataset.lIssue); return; }
  });

  async function openUserDetail(userId) {
    try {
      const d = await P.api('/api/v1/admin/users/' + userId);
      const u = d.user;
      P.openModal({
        title: `用户详情 · ${u.name}`,
        bodyHtml: `<dl class="lic-meta" style="margin-bottom:16px">
            <div><dt>邮箱</dt><dd>${P.esc(u.email)}</dd></div>
            <div><dt>公司</dt><dd>${P.esc(u.company || '—')}</dd></div>
            <div><dt>角色 / 状态</dt><dd>${P.esc(u.role)} · ${u.disabled ? '已停用' : '正常'}</dd></div>
            <div><dt>活跃会话数</dt><dd>${d.activeSessions}</dd></div>
            <div style="grid-column:1/-1"><dt>已绑定第三方登录</dt><dd>${(u.identities || []).length ? u.identities.map((i) => `<span class="provider-pill">${P.esc(i.provider)}${i.email ? ' (' + P.esc(i.email) + ')' : ''}</span>`).join('') : '仅邮箱密码登录'}</dd></div>
          </dl>
          <h4 style="margin:0 0 8px">名下许可（${d.licenses.length}）</h4>
          ${d.licenses.length ? d.licenses.map((l) => `<div class="lic-code-row" style="margin-bottom:6px"><span class="mono">${P.esc(l.activation_code)}</span><span>${l.server_seats}S + ${l.workstation_seats}W · ${P.statusBadge(l.status)}</span></div>`).join('') : '<p class="muted">暂无许可</p>'}
          <h4 style="margin:14px 0 8px">历史订单（${d.orders.length}）</h4>
          ${d.orders.length ? d.orders.map((o) => `<div class="lic-code-row" style="margin-bottom:6px"><span class="mono">${P.esc(o.creem_order_id || o.id.slice(0, 8))}</span><span>${P.fmtUsdCents(o.amount_cents)} · ${P.statusBadge(o.status)}</span></div>`).join('') : '<p class="muted">暂无订单</p>'}`,
        footHtml: `<button type="button" class="btn" data-close>关闭</button>`
      });
    } catch (ex) { P.toast(ex.message, 'err'); }
  }

  function openUserEdit(userId) {
    const u = cache.users.find((x) => x.id === userId);
    const m = P.openModal({
      title: `编辑用户 · ${u.email}`,
      bodyHtml: `<div class="field"><label>姓名</label><input id="eu-name" value="${P.esc(u.name)}"></div>
        <div class="field"><label>公司</label><input id="eu-company" value="${P.esc(u.company || '')}"></div>
        <div class="form-row">
          <div class="field"><label>角色</label><select id="eu-role"><option value="user" ${u.role === 'user' ? 'selected' : ''}>普通用户 (user)</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>管理员 (admin)</option></select></div>
          <div class="field"><label>状态</label><select id="eu-dis"><option value="0" ${!u.disabled ? 'selected' : ''}>正常</option><option value="1" ${u.disabled ? 'selected' : ''}>已停用（强制踢下线）</option></select></div>
        </div>
        <div class="field"><label>重置密码（留空则不修改）</label><input id="eu-pw" type="password" placeholder="至少 8 个字符"></div>
        <div class="form-err" id="eu-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="eu-ok">保存修改</button>`
    });
    m.el.querySelector('#eu-ok').onclick = async () => {
      const btn = m.el.querySelector('#eu-ok'); const err = m.el.querySelector('#eu-err');
      err.textContent = ''; btn.disabled = true;
      try {
        const body = {
          name: m.el.querySelector('#eu-name').value.trim(),
          company: m.el.querySelector('#eu-company').value.trim(),
          role: m.el.querySelector('#eu-role').value,
          disabled: m.el.querySelector('#eu-dis').value === '1'
        };
        const pw = m.el.querySelector('#eu-pw').value;
        if (pw) body.newPassword = pw;
        await P.api('/api/v1/admin/users/' + userId, { method: 'PATCH', body: JSON.stringify(body) });
        m.close(); P.toast('用户信息已更新'); loadAll();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  }

  function openGrantModal(presetUserId = '') {
    const u = presetUserId ? cache.users.find((x) => x.id === presetUserId) : null;
    const m = P.openModal({
      title: '手动签发永久许可（Lifetime Updates）',
      bodyHtml: `<p class="muted" style="margin-top:0;font-size:13px">适用于线下对公打款、代理商订单、合作伙伴 NFR 或补偿扩容。</p>
        <div class="form-row">
          <div class="field"><label>客户邮箱（若已注册自动关联账户）</label><input id="g-email" type="email" value="${P.esc(u?.email || '')}" placeholder="client@corp.com"></div>
          <div class="field"><label>客户 / 公司名称</label><input id="g-name" value="${P.esc(u?.company || u?.name || '')}" placeholder="示例科技有限公司"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>Server 席位数</label><input id="g-srv" type="number" min="0" max="5000" value="1"></div>
          <div class="field"><label>Workstation 席位数</label><input id="g-ws" type="number" min="0" max="5000" value="5"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>自助换机上限</label><input id="g-rh" type="number" min="0" max="100" value="3"></div>
          <div class="field"><label>实收金额（USD，可选记账）</label><input id="g-usd" type="number" min="0" step="0.01" value="0"></div>
        </div>
        <div class="field"><label>内部备注</label><input id="g-notes" placeholder="如：对公合同 #2026-01 / 合作伙伴 NFR"></div>
        <div class="form-err" id="g-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="g-ok">生成激活码</button>`
    });
    m.el.querySelector('#g-ok').onclick = async () => {
      const btn = m.el.querySelector('#g-ok'); const err = m.el.querySelector('#g-err');
      err.textContent = ''; btn.disabled = true;
      try {
        const res = await P.api('/api/v1/admin/licenses', {
          method: 'POST',
          body: JSON.stringify({
            userId: presetUserId || undefined,
            customerEmail: m.el.querySelector('#g-email').value.trim() || undefined,
            customerName: m.el.querySelector('#g-name').value.trim() || undefined,
            serverSeats: Number(m.el.querySelector('#g-srv').value || 0),
            workstationSeats: Number(m.el.querySelector('#g-ws').value || 0),
            maxSelfRehosts: Number(m.el.querySelector('#g-rh').value || 3),
            amountCents: Math.round(Number(m.el.querySelector('#g-usd').value || 0) * 100),
            notes: m.el.querySelector('#g-notes').value.trim()
          })
        });
        m.close();
        P.toast('已签发激活码：' + res.license.activation_code);
        loadAll();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  }
  document.getElementById('btn-grant').onclick = () => openGrantModal();

  function openLicenseEdit(licId) {
    const l = cache.licenses.find((x) => x.id === licId);
    const m = P.openModal({
      title: `管理许可 · ${l.activation_code}`,
      bodyHtml: `<div class="form-row">
          <div class="field"><label>Server 席位数</label><input id="el-srv" type="number" min="0" max="5000" value="${l.server_seats}"></div>
          <div class="field"><label>Workstation 席位数</label><input id="el-ws" type="number" min="0" max="5000" value="${l.workstation_seats}"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>许可状态</label><select id="el-st">
            <option value="Active" ${l.status === 'Active' ? 'selected' : ''}>有效 (Active)</option>
            <option value="Suspended" ${l.status === 'Suspended' ? 'selected' : ''}>暂停 (Suspended)</option>
            <option value="Revoked" ${l.status === 'Revoked' ? 'selected' : ''}>撤销 (Revoked)</option>
            <option value="Disputed" ${l.status === 'Disputed' ? 'selected' : ''}>争议冻结 (Disputed)</option>
          </select></div>
          <div class="field"><label>自助换机上限</label><input id="el-rh" type="number" min="0" max="100" value="${l.max_self_rehosts ?? 3}"></div>
        </div>
        <div class="form-row">
          <div class="field"><label>客户名称</label><input id="el-cname" value="${P.esc(l.customer_name || '')}"></div>
          <div class="field"><label>客户邮箱</label><input id="el-cemail" value="${P.esc(l.customer_email || '')}"></div>
        </div>
        <div class="field"><label>备注</label><input id="el-notes" value="${P.esc(l.notes || '')}"></div>
        <div class="form-err" id="el-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="el-ok">保存</button>`
    });
    m.el.querySelector('#el-ok').onclick = async () => {
      const btn = m.el.querySelector('#el-ok'); const err = m.el.querySelector('#el-err');
      err.textContent = ''; btn.disabled = true;
      try {
        await P.api('/api/v1/admin/licenses/' + licId, {
          method: 'PATCH',
          body: JSON.stringify({
            serverSeats: Number(m.el.querySelector('#el-srv').value || 0),
            workstationSeats: Number(m.el.querySelector('#el-ws').value || 0),
            status: m.el.querySelector('#el-st').value,
            maxSelfRehosts: Number(m.el.querySelector('#el-rh').value || 3),
            customerName: m.el.querySelector('#el-cname').value.trim(),
            customerEmail: m.el.querySelector('#el-cemail').value.trim(),
            notes: m.el.querySelector('#el-notes').value.trim()
          })
        });
        m.close(); P.toast('许可已更新'); loadAll();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  }

  async function unbindLicense(licId) {
    const l = cache.licenses.find((x) => x.id === licId);
    if (!confirm(`确认强制解绑许可 ${l.activation_code} 的当前 CoreId（${l.bound_core_id}）？解绑后客户可直接在新服务器重新激活。`)) return;
    try {
      await P.api(`/api/v1/admin/licenses/${licId}/unbind`, { method: 'POST' });
      P.toast('已解绑 Core，客户可重新激活'); loadAll();
    } catch (ex) { P.toast(ex.message, 'err'); }
  }

  function openAdminIssueModal(licId) {
    const l = cache.licenses.find((x) => x.id === licId);
    const m = P.openModal({
      title: `代客离线签发 · ${l.activation_code}`,
      bodyHtml: `<div class="field"><label>客户发来的 .req 请求码</label><textarea id="ai-req" rows="5" placeholder="粘贴 .req 请求码…"></textarea></div>
        <div class="form-err" id="ai-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="ai-ok">签发并下载 .bareturnlic</button>`
    });
    m.el.querySelector('#ai-ok').onclick = async () => {
      const btn = m.el.querySelector('#ai-ok'); const err = m.el.querySelector('#ai-err');
      err.textContent = ''; btn.disabled = true;
      try {
        const res = await P.api(`/api/v1/admin/licenses/${licId}/issue-offline`, {
          method: 'POST', body: JSON.stringify({ requestCode: m.el.querySelector('#ai-req').value.trim() })
        });
        P.downloadJson(res.license, `bareturn-${l.activation_code}.bareturnlic`);
        m.close(); P.toast('离线证书已签发下载'); loadAll();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  }

  init();
})();

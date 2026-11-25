(function () {
  'use strict';
  const P = window.BTPortal;
  P.initTheme();

  let state = { user: null, orders: [], licenses: [] };

  document.getElementById('btn-logout').onclick = () => P.logout('login.html');

  document.querySelectorAll('.portal-tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.portal-tabs button').forEach((b) => b.classList.toggle('on', b === btn));
      ['licenses', 'orders', 'profile'].forEach((t) => {
        document.getElementById('sec-' + t).classList.toggle('hidden', btn.dataset.tab !== t);
      });
    });
  });

  async function load() {
    if (!P.getToken()) { location.href = 'login.html?next=account.html'; return; }
    try {
      const data = await P.api('/api/v1/account/overview');
      state = data;
      P.setSession(P.getToken(), data.user);
      render();
    } catch (err) {
      if (!P.getToken()) location.href = 'login.html?next=account.html';
      else P.toast(err.message, 'err');
    }
  }

  function render() {
    const { user, orders, licenses } = state;
    document.getElementById('nav-user-label').textContent = `${user.name} (${user.email})`;
    document.getElementById('welcome-title').textContent = `你好，${user.name}`;
    document.getElementById('welcome-sub').textContent = user.company ? `${user.company} · ${user.email}` : user.email;
    document.getElementById('nav-admin-link').classList.toggle('hidden', user.role !== 'admin');

    const active = licenses.filter((l) => l.status === 'Active');
    document.getElementById('k-lic').textContent = active.length;
    document.getElementById('k-srv').textContent = active.reduce((a, b) => a + Number(b.server_seats || 0), 0);
    document.getElementById('k-ws').textContent = active.reduce((a, b) => a + Number(b.workstation_seats || 0), 0);
    document.getElementById('k-ord').textContent = orders.length;

    // Profile fields
    document.getElementById('p-email').value = user.email;
    document.getElementById('p-name').value = user.name;
    document.getElementById('p-company').value = user.company || '';

    // Licenses cards
    const grid = document.getElementById('licenses-grid');
    if (!licenses.length) {
      grid.innerHTML = `<div class="panel" style="grid-column:1/-1"><div class="empty-box">当前账户下还没有许可。您可以点击右上角「+ 购买永久席位」，或点击「认领激活码」关联之前游客购买的激活码。</div></div>`;
    } else {
      grid.innerHTML = licenses.map((l) => `
        <article class="lic-card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <strong>${l.server_seats} 服务器 + ${l.workstation_seats} 工作站</strong>
            ${P.statusBadge(l.status)}
          </div>
          <div class="lic-code-row">
            <span class="lic-code">${P.esc(l.activation_code)}</span>
            <button type="button" class="btn xs" data-copy="${P.esc(l.activation_code)}">复制</button>
          </div>
          <dl class="lic-meta">
            <div><dt>更新权益</dt><dd>终身免费更新</dd></div>
            <div><dt>自助换机次数</dt><dd>${l.rehost_count || 0} / ${l.max_self_rehosts ?? 3}</dd></div>
            <div style="grid-column:1/-1"><dt>已绑定 CoreId</dt><dd class="mono">${l.bound_core_id ? P.esc(l.bound_core_id) : '尚未绑定（可在 Core 直接激活）'}</dd></div>
            ${l.notes ? `<div style="grid-column:1/-1"><dt>备注</dt><dd>${P.esc(l.notes)}</dd></div>` : ''}
          </dl>
          <div class="lic-card-foot">
            <button type="button" class="btn sm primary" data-offline="${P.esc(l.id)}" ${l.status !== 'Active' ? 'disabled' : ''}>离线签发 .bareturnlic</button>
            <button type="button" class="btn sm" data-rehost="${P.esc(l.id)}" ${l.status !== 'Active' || !l.bound_core_id ? 'disabled' : ''}>换机迁移</button>
          </div>
        </article>`).join('');
    }

    // Orders table
    const tbody = document.getElementById('orders-tbody');
    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-box">暂无订单记录。</td></tr>`;
    } else {
      tbody.innerHTML = orders.map((o) => `<tr>
        <td>${P.esc(P.fmtDate(o.created_at))}</td>
        <td class="mono">${P.esc(o.creem_order_id || o.creem_checkout_id || o.id.slice(0, 8))}</td>
        <td>${o.server_seats} 服务器 · ${o.workstation_seats} 工作站</td>
        <td><strong>${P.fmtUsdCents(o.amount_cents)}</strong></td>
        <td>${P.statusBadge(o.status)}</td>
        <td class="mono">${o.activation_code ? `<button type="button" class="btn xs ghost" data-copy="${P.esc(o.activation_code)}">${P.esc(o.activation_code)}</button>` : '—'}</td>
      </tr>`).join('');
    }
  }

  document.addEventListener('click', (e) => {
    const cp = e.target.closest('[data-copy]');
    if (cp) { P.copyText(cp.dataset.copy); return; }
    const off = e.target.closest('[data-offline]');
    if (off) { openOfflineModal(off.dataset.offline); return; }
    const rh = e.target.closest('[data-rehost]');
    if (rh) { openRehostModal(rh.dataset.rehost); return; }
  });

  function openOfflineModal(licId) {
    const lic = state.licenses.find((x) => x.id === licId);
    const m = P.openModal({
      title: `离线签发许可 · ${lic.activation_code}`,
      bodyHtml: `<p class="muted" style="margin-top:0;font-size:13.5px">在 BareTurn Core「设置 → 许可」点击“导出请求码”，将 <code>.req</code> 上传或粘贴到下方即可下载绑定该服务器的 <code>.bareturnlic</code>。</p>
        <div class="field"><label>上传 .req 文件（可选）</label><input type="file" id="m-req-file" accept=".req,.txt,.json"></div>
        <div class="field"><label>请求码内容</label><textarea id="m-req-txt" rows="5" placeholder="粘贴 Core 导出的请求码…"></textarea></div>
        <div class="form-err" id="m-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="m-ok">签发并下载</button>`
    });
    m.el.querySelector('#m-req-file').onchange = async (ev) => {
      const f = ev.target.files[0]; if (f) m.el.querySelector('#m-req-txt').value = await f.text();
    };
    m.el.querySelector('#m-ok').onclick = async () => {
      const btn = m.el.querySelector('#m-ok');
      const err = m.el.querySelector('#m-err'); err.textContent = ''; btn.disabled = true;
      try {
        const res = await P.api(`/api/v1/account/licenses/${licId}/activate`, {
          method: 'POST', body: JSON.stringify({ requestCode: m.el.querySelector('#m-req-txt').value.trim() })
        });
        P.downloadJson(res.license, `bareturn-${lic.activation_code}.bareturnlic`);
        m.close(); P.toast('离线许可证书已签发并下载'); load();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  }

  function openRehostModal(licId) {
    const lic = state.licenses.find((x) => x.id === licId);
    const m = P.openModal({
      title: `换机迁移（Rehost）· ${lic.activation_code}`,
      bodyHtml: `<p class="muted" style="margin-top:0;font-size:13.5px">提交旧服务器的 <code>.deact</code> 停用回执与新服务器的 <code>.req</code> 请求码，即可自助解绑并签发新机证书。</p>
        <div class="field"><label>旧服务器停用回执（.deact JSON）</label><textarea id="rh-deact" rows="4" placeholder='{"format":"BareTurn.Deactivation",...}'></textarea></div>
        <div class="field"><label>新服务器请求码（.req）</label><textarea id="rh-req" rows="4" placeholder="粘贴新服务器请求码…"></textarea></div>
        <div class="form-err" id="rh-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="rh-ok">换绑并下载新证书</button>`
    });
    m.el.querySelector('#rh-ok').onclick = async () => {
      const btn = m.el.querySelector('#rh-ok');
      const err = m.el.querySelector('#rh-err'); err.textContent = ''; btn.disabled = true;
      try {
        const res = await P.api(`/api/v1/account/licenses/${licId}/rehost`, {
          method: 'POST', body: JSON.stringify({
            deactivationReceipt: m.el.querySelector('#rh-deact').value.trim(),
            newRequestCode: m.el.querySelector('#rh-req').value.trim()
          })
        });
        P.downloadJson(res.license, `bareturn-rehost-${lic.activation_code}.bareturnlic`);
        m.close(); P.toast('换绑成功，新机证书已下载'); load();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  }

  document.getElementById('btn-claim').onclick = () => {
    const m = P.openModal({
      title: '认领激活码',
      bodyHtml: `<p class="muted" style="margin-top:0;font-size:13.5px">如果您此前在未登录状态下通过 Creem 购买了许可，可输入收到的激活码将其归集到当前账户。</p>
        <div class="field"><label>激活码</label><input id="cl-code" class="mono" placeholder="BT-XXXX-XXXX-XXXX-XXXX"></div>
        <div class="form-err" id="cl-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="cl-ok">认领</button>`
    });
    m.el.querySelector('#cl-ok').onclick = async () => {
      const btn = m.el.querySelector('#cl-ok'); const err = m.el.querySelector('#cl-err');
      err.textContent = ''; btn.disabled = true;
      try {
        await P.api('/api/v1/account/claim', { method: 'POST', body: JSON.stringify({ activationCode: m.el.querySelector('#cl-code').value.trim() }) });
        m.close(); P.toast('激活码已认领至您的账户'); load();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  };

  document.getElementById('btn-buy-more').onclick = () => {
    const m = P.openModal({
      title: '购买永久席位（Lifetime Updates）',
      bodyHtml: `<div class="form-row">
          <div class="field"><label>Server 服务器席位（$299 / 台）</label><input id="b-srv" type="number" min="0" max="500" value="1"></div>
          <div class="field"><label>Workstation 工作站席位（$49 / 台）</label><input id="b-ws" type="number" min="0" max="500" value="5"></div>
        </div>
        <p style="margin:6px 0 0;font-size:14px">一次性总价（含终身免费更新）：<strong id="b-tot" style="color:var(--brand);font-size:18px">$544</strong></p>
        <div class="form-err" id="b-err"></div>`,
      footHtml: `<button type="button" class="btn" data-close>取消</button><button type="button" class="btn primary" id="b-ok">前往 Creem 结账</button>`
    });
    const srvIn = m.el.querySelector('#b-srv'), wsIn = m.el.querySelector('#b-ws'), tot = m.el.querySelector('#b-tot');
    const calc = () => {
      const v = Math.max(0, Number(srvIn.value || 0)) * 299 + Math.max(0, Number(wsIn.value || 0)) * 49;
      tot.textContent = '$' + v.toLocaleString('en-US');
    };
    srvIn.oninput = calc; wsIn.oninput = calc;
    m.el.querySelector('#b-ok').onclick = async () => {
      const btn = m.el.querySelector('#b-ok'); const err = m.el.querySelector('#b-err');
      err.textContent = ''; btn.disabled = true;
      try {
        const res = await P.api('/api/v1/checkout', {
          method: 'POST',
          body: JSON.stringify({
            serverSeats: Number(srvIn.value || 0),
            workstationSeats: Number(wsIn.value || 0),
            successUrl: location.origin + '/account.html?paid=1'
          })
        });
        location.href = res.checkoutUrl;
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  };

  document.getElementById('profile-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await P.api('/api/v1/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: document.getElementById('p-name').value.trim(), company: document.getElementById('p-company').value.trim() })
      });
      state.user = res.user; P.setSession(P.getToken(), res.user);
      render(); P.toast('个人资料已保存');
    } catch (ex) { P.toast(ex.message, 'err'); }
  };

  document.getElementById('pw-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await P.api('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: document.getElementById('pw-cur').value, newPassword: document.getElementById('pw-new').value })
      });
      e.target.reset(); P.toast('密码已更新');
    } catch (ex) { P.toast(ex.message, 'err'); }
  };

  if (new URLSearchParams(location.search).get('paid') === '1') {
    P.toast('支付已完成，正在同步您的新订单与激活码…');
    setTimeout(load, 2500);
  }
  load();
})();

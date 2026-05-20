(function () {
  var cfg = window.SUPABASE_CONFIG || {};
  var loginView = document.getElementById('login-view');
  var dashView = document.getElementById('dashboard-view');
  var loginForm = document.getElementById('login-form');
  var loginError = document.getElementById('login-error');
  var logoutBtn = document.getElementById('logout-btn');
  var refreshBtn = document.getElementById('refresh-btn');
  var filterStatus = document.getElementById('filter-status');
  var tableBody = document.getElementById('inquiry-tbody');
  var detailPanel = document.getElementById('detail-panel');
  var adminEmail = document.getElementById('admin-email');

  var client = null;
  var rows = [];

  function hasConfig() {
    return cfg.url && cfg.anonKey && typeof window.supabase !== 'undefined';
  }

  function getClient() {
    if (!client && hasConfig()) {
      client = window.supabase.createClient(cfg.url, cfg.anonKey);
    }
    return client;
  }

  function show(el) {
    if (el) el.classList.remove('hidden');
  }

  function hide(el) {
    if (el) el.classList.add('hidden');
  }

  function statusBadge(status) {
    var cls = 'badge badge-' + (status || 'new');
    var label = { new: '신규', read: '확인', replied: '답변완료', archived: '보관' }[status] || status;
    return '<span class="' + cls + '">' + label + '</span>';
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
  }

  function renderTable(list) {
    if (!tableBody) return;
    if (!list.length) {
      tableBody.innerHTML = '<tr><td colspan="7">문의가 없습니다.</td></tr>';
      return;
    }
    tableBody.innerHTML = list
      .map(function (r) {
        return (
          '<tr data-id="' +
          r.id +
          '">' +
          '<td>' +
          formatDate(r.created_at) +
          '</td>' +
          '<td>' +
          escapeHtml(r.name) +
          '</td>' +
          '<td>' +
          escapeHtml(r.phone || '-') +
          '</td>' +
          '<td>' +
          escapeHtml(r.email) +
          '</td>' +
          '<td>' +
          escapeHtml(r.project_type) +
          '</td>' +
          '<td>' +
          statusBadge(r.status) +
          '</td>' +
          '<td><button type="button" class="admin-btn secondary btn-view" data-id="' +
          r.id +
          '">보기</button></td>' +
          '</tr>'
        );
      })
      .join('');

    tableBody.querySelectorAll('.btn-view').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openDetail(btn.getAttribute('data-id'));
      });
    });
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openDetail(id) {
    var r = rows.find(function (x) {
      return x.id === id;
    });
    if (!r || !detailPanel) return;
    detailPanel.classList.add('open');
    detailPanel.innerHTML =
      '<p><strong>이름</strong> ' +
      escapeHtml(r.name) +
      ' · <strong>휴대폰</strong> ' +
      escapeHtml(r.phone || '-') +
      ' · <strong>이메일</strong> ' +
      escapeHtml(r.email) +
      '</p>' +
      '<p><strong>유형</strong> ' +
      escapeHtml(r.project_type) +
      '</p>' +
      '<p><strong>패키지</strong> ' +
      escapeHtml(r.package_budget || '-') +
      '</p>' +
      '<p class="message"><strong>문의</strong><br>' +
      escapeHtml(r.message || '(내용 없음)') +
      '</p>' +
      '<p><label>상태 변경 </label><select id="detail-status-select">' +
      ['new', 'read', 'replied', 'archived']
        .map(function (s) {
          return (
            '<option value="' +
            s +
            '"' +
            (r.status === s ? ' selected' : '') +
            '>' +
            s +
            '</option>'
          );
        })
        .join('') +
      '</select> <button type="button" class="admin-btn" id="save-status-btn">저장</button></p>';

    document.getElementById('save-status-btn').addEventListener('click', async function () {
      var sel = document.getElementById('detail-status-select');
      var newStatus = sel.value;
      var sb = getClient();
      if (!sb) return;
      var upd = await sb.from('inquiries').update({ status: newStatus }).eq('id', r.id);
      if (upd.error) {
        alert('저장 실패: ' + upd.error.message);
        return;
      }
      await loadInquiries();
    });
  }

  async function loadInquiries() {
    var sb = getClient();
    if (!sb) return;
    var q = sb.from('inquiries').select('*').order('created_at', { ascending: false });
    if (filterStatus && filterStatus.value) {
      q = q.eq('status', filterStatus.value);
    }
    var res = await q;
    if (res.error) {
      tableBody.innerHTML =
        '<tr><td colspan="7">불러오기 실패: ' + escapeHtml(res.error.message) + '</td></tr>';
      return;
    }
    rows = res.data || [];
    renderTable(rows);
  }

  async function checkSession() {
    var sb = getClient();
    if (!sb) {
      hide(dashView);
      show(loginView);
      if (loginError) loginError.textContent = 'Supabase 설정이 없습니다. Netlify 환경 변수를 확인하세요.';
      return;
    }
    var session = await sb.auth.getSession();
    if (session.data.session) {
      hide(loginView);
      show(dashView);
      if (adminEmail && session.data.session.user) {
        adminEmail.textContent = session.data.session.user.email || '';
      }
      await loadInquiries();
    } else {
      show(loginView);
      hide(dashView);
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (loginError) loginError.textContent = '';
      var sb = getClient();
      if (!sb) {
        if (loginError) loginError.textContent = 'Supabase 연결 설정이 필요합니다.';
        return;
      }
      var email = document.getElementById('admin-login-email').value.trim();
      var password = document.getElementById('admin-login-password').value;
      var res = await sb.auth.signInWithPassword({ email: email, password: password });
      if (res.error) {
        if (loginError) loginError.textContent = '로그인 실패: 이메일 또는 비밀번호를 확인하세요.';
        return;
      }
      await checkSession();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      var sb = getClient();
      if (sb) await sb.auth.signOut();
      if (detailPanel) detailPanel.classList.remove('open');
      await checkSession();
    });
  }

  if (refreshBtn) refreshBtn.addEventListener('click', loadInquiries);
  if (filterStatus) filterStatus.addEventListener('change', loadInquiries);

  checkSession();
})();

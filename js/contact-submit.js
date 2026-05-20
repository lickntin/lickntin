(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var cfg = window.SUPABASE_CONFIG || {};
  var statusEl = document.getElementById('contact-form-status');
  var submitBtn = form.querySelector('.contact-submit-btn');
  var defaultBtnText = submitBtn ? submitBtn.textContent : '문의 보내기';

  var MSG_OK = '문의가 접수되었습니다. 내용 확인 후 순차적으로 연락드리겠습니다.';
  var MSG_FAIL = '접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';

  function setStatus(type, text) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.classList.add('is-visible');
    statusEl.classList.remove('is-success', 'is-error');
    if (type === 'success') statusEl.classList.add('is-success');
    if (type === 'error') statusEl.classList.add('is-error');
    statusEl.textContent = text;
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.hidden = true;
    statusEl.classList.remove('is-visible', 'is-success', 'is-error');
    statusEl.textContent = '';
  }

  clearStatus();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus();

    if (!cfg.url || !cfg.anonKey) {
      console.error('Supabase config missing. Set SUPABASE_URL and SUPABASE_ANON_KEY on Netlify.');
      setStatus('error', MSG_FAIL);
      return;
    }

    if (typeof window.supabase === 'undefined') {
      setStatus('error', MSG_FAIL);
      return;
    }

    var name = (document.getElementById('contact-name') || {}).value || '';
    var phone = (document.getElementById('contact-phone') || {}).value || '';
    var email = (document.getElementById('contact-email') || {}).value || '';
    var projectType = (document.getElementById('project-type') || {}).value || '';
    var message = (document.getElementById('project-message') || {}).value || '';
    var pkgInput = form.querySelector('input[name="selected-package"]:checked');

    var phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 9) {
      setStatus('error', MSG_FAIL);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = submitBtn.getAttribute('data-wait') || '전송 중...';
    }

    var client = window.supabase.createClient(cfg.url, cfg.anonKey);

    var row = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      project_type: projectType,
      message: message.trim() || null,
      package_budget: pkgInput ? pkgInput.value : null,
      privacy_agreed: true,
      status: 'new'
    };

    var result = await client.from('inquiries').insert(row);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = defaultBtnText;
    }

    if (result.error) {
      console.error('Inquiry insert failed:', result.error.message, result.error);
      setStatus('error', MSG_FAIL);
      return;
    }

    form.reset();
    setStatus('success', MSG_OK);
  });
})();

(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var cfg = window.SUPABASE_CONFIG || {};
  var done = form.parentElement && form.parentElement.querySelector('.w-form-done');
  var fail = form.parentElement && form.parentElement.querySelector('.w-form-fail');
  var submitBtn = form.querySelector('.contact-submit-btn');
  var defaultBtnText = submitBtn ? submitBtn.textContent : '문의 보내기';

  function show(el, visible) {
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
  }

  function hideMessages() {
    show(done, false);
    show(fail, false);
  }

  hideMessages();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideMessages();

    if (!cfg.url || !cfg.anonKey) {
      console.error('Supabase config missing. Set SUPABASE_URL and SUPABASE_ANON_KEY on Netlify.');
      show(fail, true);
      return;
    }

    if (typeof window.supabase === 'undefined') {
      show(fail, true);
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
      show(fail, true);
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
      show(fail, true);
      return;
    }

    form.reset();
    show(done, true);
  });
})();

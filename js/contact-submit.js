(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var cfg = window.SUPABASE_CONFIG || {};
  var done = form.parentElement && form.parentElement.querySelector('.w-form-done');
  var fail = form.parentElement && form.parentElement.querySelector('.w-form-fail');
  var privacyInput = document.getElementById('I-agree-to-Privacy-Policy');
  var privacyVisual = form.querySelector('.checkbox-contact');

  function show(el, visible) {
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
  }

  function hideMessages() {
    show(done, false);
    show(fail, false);
  }

  function syncPrivacyCheckbox() {
    if (!privacyInput || !privacyVisual) return;
    privacyVisual.classList.toggle('w--redirected-checked', privacyInput.checked);
  }

  hideMessages();
  syncPrivacyCheckbox();

  if (privacyInput) {
    privacyInput.addEventListener('change', syncPrivacyCheckbox);
  }

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
    var submitBtn = form.querySelector('input[type="submit"]');

    if (!privacyInput || !privacyInput.checked) {
      show(fail, true);
      return;
    }

    var phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 9) {
      show(fail, true);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.value = '전송 중...';
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
      submitBtn.value = '문의 남기기';
    }

    if (result.error) {
      console.error('Inquiry insert failed:', result.error.message, result.error);
      show(fail, true);
      return;
    }

    form.reset();
    syncPrivacyCheckbox();
    show(done, true);
  });
})();

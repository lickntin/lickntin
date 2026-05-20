(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var cfg = window.SUPABASE_CONFIG || {};
  var wrap = form.closest('.form-block-contact') || form.parentElement;
  var done = wrap && wrap.querySelector('.w-form-done');
  var fail = wrap && wrap.querySelector('.w-form-fail');
  var privacyInput = document.getElementById('I-agree-to-Privacy-Policy');
  var submitInput = form.querySelector('input[type="submit"]');
  var submitVisual = form.querySelector('.contact-form-submit-visual');

  function show(el, visible) {
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
  }

  function hideMessages() {
    show(done, false);
    show(fail, false);
  }

  hideMessages();

  if (submitVisual) {
    submitVisual.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
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

    if (!privacyInput || !privacyInput.checked) {
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
    if (phoneDigits.length < 9 || !projectType) {
      show(fail, true);
      return;
    }

    if (submitInput) {
      submitInput.disabled = true;
      submitInput.value = '전송 중...';
    }
    if (submitVisual) submitVisual.style.pointerEvents = 'none';

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

    if (submitInput) {
      submitInput.disabled = false;
      submitInput.value = '문의 접수';
    }
    if (submitVisual) submitVisual.style.pointerEvents = '';

    if (result.error) {
      console.error('Inquiry insert failed:', result.error.message, result.error);
      show(fail, true);
      return;
    }

    form.reset();
    show(done, true);
  });
})();

(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var cfg = window.SUPABASE_CONFIG || {};
  var wrap = form.closest('.form-block-contact') || form.parentElement;
  var done = wrap && wrap.querySelector('.w-form-done');
  var fail = wrap && wrap.querySelector('.w-form-fail');
  var privacyInput = document.getElementById('I-agree-to-Privacy-Policy');
  var submitBtn = form.querySelector('.contact-form-submit-btn');
  var defaultBtnText = submitBtn ? submitBtn.textContent : '상담 문의';

  function show(el, visible) {
    if (!el) return;
    el.style.display = visible ? 'block' : 'none';
  }

  function hideMessages() {
    show(done, false);
    show(fail, false);
  }

  hideMessages();

  form.addEventListener(
    'submit',
    async function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      hideMessages();

      if (!cfg.url || !cfg.anonKey) {
        console.error('Supabase config missing.');
        show(fail, true);
        return;
      }

      if (typeof window.supabase === 'undefined') {
        show(fail, true);
        return;
      }

      if (!privacyInput || !privacyInput.checked) {
        alert('개인정보 수집 및 이용에 동의해 주세요.');
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
        alert('휴대폰 번호를 확인해 주세요.');
        show(fail, true);
        return;
      }
      if (!projectType) {
        alert('프로젝트 유형을 선택해 주세요.');
        show(fail, true);
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = submitBtn.getAttribute('data-wait') || '전송 중...';
      }

      try {
        var client = window.supabase.createClient(cfg.url, cfg.anonKey);
        var result = await client.from('inquiries').insert({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          project_type: projectType,
          message: message.trim() || null,
          package_budget: pkgInput ? pkgInput.value : null,
          privacy_agreed: true,
          status: 'new'
        });

        if (result.error) {
          console.error('Inquiry insert failed:', result.error.message, result.error);
          var failMsg = fail && fail.querySelector('div');
          if (failMsg) {
            if (result.error.message && result.error.message.indexOf('row-level security') !== -1) {
              failMsg.textContent =
                'DB 권한 설정이 필요합니다. Supabase SQL Editor에서 fix_insert_now.sql 을 실행해 주세요.';
            } else {
              failMsg.textContent =
                '접수 중 문제가 발생했습니다. (' + result.error.message + ')';
            }
          }
          show(fail, true);
          return;
        }

        form.reset();
        show(done, true);
      } catch (err) {
        console.error('Inquiry submit error:', err);
        show(fail, true);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultBtnText;
        }
      }
    },
    true
  );
})();

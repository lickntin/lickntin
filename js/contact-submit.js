(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

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

  function setFailMessage(text) {
    var failMsg = fail && fail.querySelector('div');
    if (failMsg) failMsg.textContent = text;
    show(fail, true);
  }

  function hideMessages() {
    show(done, false);
    show(fail, false);
    var failMsg = fail && fail.querySelector('div');
    if (failMsg) failMsg.textContent = '접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  hideMessages();

  form.addEventListener(
    'submit',
    async function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      hideMessages();

      if (!privacyInput || !privacyInput.checked) {
        alert('개인정보 수집 및 이용에 동의해 주세요.');
        setFailMessage('개인정보 수집 및 이용에 동의해 주세요.');
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
        setFailMessage('휴대폰 번호를 확인해 주세요.');
        return;
      }
      if (!projectType) {
        alert('프로젝트 유형을 선택해 주세요.');
        setFailMessage('프로젝트 유형을 선택해 주세요.');
        return;
      }

      var payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        project_type: projectType,
        message: message.trim() || null,
        package_budget: pkgInput ? pkgInput.value : null,
        privacy_agreed: true
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = submitBtn.getAttribute('data-wait') || '전송 중...';
      }

      try {
        var res = await fetch('/.netlify/functions/submit-inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        var data = {};
        try {
          data = await res.json();
        } catch (parseErr) {
          data = {};
        }

        if (!res.ok) {
          console.error('Inquiry submit failed:', res.status, data);
          if (data.error && data.error.indexOf('SUPABASE_SERVICE_ROLE') !== -1) {
            setFailMessage('서버 설정이 필요합니다. Netlify에 SUPABASE_SERVICE_ROLE_KEY를 추가해 주세요.');
          } else if (data.error) {
            setFailMessage('접수 실패: ' + data.error);
          } else {
            setFailMessage('접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          }
          return;
        }

        form.reset();
        show(done, true);
      } catch (err) {
        console.error('Inquiry submit error:', err);
        setFailMessage('접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
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

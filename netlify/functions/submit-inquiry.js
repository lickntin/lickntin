exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: '{"error":"Method not allowed"}' };
  }

  var url = process.env.SUPABASE_URL;
  var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Netlify에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 환경 변수를 설정하세요.'
      })
    };
  }

  var body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: '{"error":"Invalid JSON"}' };
  }

  var name = String(body.name || '').trim();
  var phone = String(body.phone || '').trim();
  var email = String(body.email || '').trim();
  var projectType = String(body.project_type || '').trim();
  var message = body.message ? String(body.message).trim() : '';
  var pkg = body.package_budget ? String(body.package_budget) : null;

  if (!name || !phone || !email || !projectType) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: '{"error":"필수 항목을 입력해 주세요."}' };
  }

  if (phone.replace(/[^0-9]/g, '').length < 9) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: '{"error":"휴대폰 번호를 확인해 주세요."}' };
  }

  if (!body.privacy_agreed) {
    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: '{"error":"개인정보 동의가 필요합니다."}' };
  }

  var row = {
    name: name,
    phone: phone,
    email: email,
    project_type: projectType,
    message: message || null,
    package_budget: pkg,
    privacy_agreed: true,
    status: 'new'
  };

  try {
    var res = await fetch(url.replace(/\/$/, '') + '/rest/v1/inquiries', {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row)
    });

    if (!res.ok) {
      var errText = await res.text();
      return {
        statusCode: res.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: errText || 'DB 저장 실패' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err.message || err) })
    };
  }
};

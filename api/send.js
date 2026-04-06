module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'pradhanarush73@gmail.com';
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Missing RESEND_API_KEY.' });
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      return res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
    }
  }

  const name = String(payload?.name || '').trim();
  const email = String(payload?.email || '').trim();
  const message = String(payload?.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email address.' });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      })
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      return res.status(502).json({ ok: false, error: 'Email provider rejected request.', details: errorBody });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Unexpected send error.' });
  }
};

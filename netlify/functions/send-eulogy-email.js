// Netlify Function to send eulogy notification emails via Resend

export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { recipientEmail, recipientName, senderName, shareUrl } = JSON.parse(event.body);

    if (!recipientEmail || !recipientName || !shareUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Living Eulogy <hello@livingeulogy.io>',
        to: recipientEmail,
        subject: `${senderName || 'Someone'} wrote something special for you`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #4A90A4; font-size: 28px; margin-bottom: 20px;">
              A Living Eulogy for You
            </h1>
            <p style="font-size: 18px; color: #333; line-height: 1.6;">
              Hi ${recipientName},
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              ${senderName || 'Someone who cares about you'} took the time to write something meaningful about you —
              not for someday, but for right now.
            </p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              They want you to know how much you matter while you're here to read it.
            </p>
            <div style="margin: 32px 0;">
              <a href="${shareUrl}"
                 style="background-color: #4A90A4; color: white; padding: 14px 28px;
                        text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                Read Your Eulogy
              </a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 40px;">
              Living Eulogy — Share what matters, while it matters.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email' }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

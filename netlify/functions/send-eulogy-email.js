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
        subject: `${recipientName}, someone wants you to read this`,
        text: `Hi ${recipientName},\n\n${senderName || 'Someone who cares about you'} took the time to write something meaningful about you — not for someday, but for right now.\n\nThey want you to know how much you matter while you're here to read it.\n\nRead your message: ${shareUrl}\n\n—\nLiving Eulogy\nShare what matters, while it matters.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
            <!-- Preheader (hidden preview text) -->
            <span style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
              ${senderName || 'Someone'} took time to tell you what you mean to them.
            </span>

            <!-- Header with logo placeholder -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; width: 48px; height: 48px; background-color: #6366F1; border-radius: 12px; line-height: 48px; color: white; font-size: 24px;">
                ♥
              </div>
            </div>

            <h1 style="color: #6366F1; font-size: 28px; margin-bottom: 24px; text-align: center; font-weight: 700;">
              A Living Eulogy for You
            </h1>

            <p style="font-size: 18px; color: #1E293B; line-height: 1.6;">
              Hi ${recipientName},
            </p>

            <p style="font-size: 16px; color: #64748B; line-height: 1.7;">
              ${senderName || 'Someone who cares about you'} took the time to write something meaningful about you —
              not for someday, but for right now.
            </p>

            <p style="font-size: 16px; color: #64748B; line-height: 1.7;">
              They want you to know how much you matter while you're here to read it.
            </p>

            <div style="margin: 36px 0; text-align: center;">
              <a href="${shareUrl}"
                 style="display: inline-block; background-color: #4F46E5; color: white; padding: 16px 32px;
                        text-decoration: none; border-radius: 9999px; font-size: 16px; font-weight: 600;">
                Read Your Message
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 40px 0;" />

            <p style="font-size: 13px; color: #94A3B8; text-align: center; margin: 0;">
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

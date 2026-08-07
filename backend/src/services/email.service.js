const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Send Contact Us email notification via Resend
 */
async function sendContactFormEmail({ name, email, subject, message }) {
  if (!resend) {
    throw new Error('Resend API key is missing in environment variables');
  }

  const destinationEmail = process.env.OFFICIAL_CONTACT_EMAIL || 'surajchougule378@gmail.com';
  const mailSubject = subject ? `[NoteShare Contact] ${subject}` : '[NoteShare Contact] New Message';

  const data = await resend.emails.send({
    from: 'NoteShare Contact <support@noteshare.online>',
    to: destinationEmail,
    replyTo: email,
    subject: mailSubject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9; padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px; background-color:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:32px 28px; text-align:center;">
                    <div style="display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); padding:8px 16px; border-radius:30px; margin-bottom:12px;">
                      <span style="color:#ffffff; font-weight:800; font-size:14px; letter-spacing:1px; text-transform:uppercase;">📚 NoteShare</span>
                    </div>
                    <h1 style="color:#ffffff; font-size:22px; font-weight:800; margin:0; tracking-tight:-0.02em;">New Contact Form Message</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:32px 28px; color:#334155;">
                    <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:24px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding-bottom:10px; font-size:14px; color:#64748b;">Sender Name:</td>
                          <td style="padding-bottom:10px; font-size:14px; font-weight:700; color:#0f172a;" align="right">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:10px; font-size:14px; color:#64748b;">Sender Email:</td>
                          <td style="padding-bottom:10px; font-size:14px; font-weight:700;" align="right">
                            <a href="mailto:${email}" style="color:#059669; text-decoration:none;">${email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:14px; color:#64748b;">Subject:</td>
                          <td style="font-size:14px; font-weight:700; color:#0f172a;" align="right">${subject || 'General Inquiry'}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size:13px; font-weight:700; color:#475569; uppercase; letter-spacing:0.5px; margin:0 0 10px 0;">Message Content:</p>
                    <div style="background-color:#f1f5f9; border-left:4px solid #10b981; border-radius:8px; padding:18px; font-size:14px; line-height:1.6; color:#1e293b; white-space:pre-wrap;">${message}</div>

                    <div style="margin-top:28px; padding-top:20px; border-top:1px solid #f1f5f9; text-align:center;">
                      <p style="font-size:12px; color:#64748b; margin:0;">💡 Replying to this email will send your response directly to <strong>${email}</strong>.</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f8fafc; padding:20px 28px; text-align:center; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8;">
                    NoteShare Platform &copy; 2026. All rights reserved.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  return data;
}

/**
 * Send OTP Verification email via Resend (Redesigned Premium Template)
 */
async function sendOtpEmail(email, otpCode) {
  if (!resend) {
    throw new Error('Resend API key is missing in environment variables');
  }

  const data = await resend.emails.send({
    from: 'NoteShare Security <otp@noteshare.online>',
    to: email,
    subject: `${otpCode} is your NoteShare verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9; padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px; background-color:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 12px 30px -10px rgba(0, 0, 0, 0.08);">
                
                <!-- Premium Header -->
                <tr>
                  <td style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding:36px 32px; text-align:center;">
                    <div style="display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); padding:8px 18px; border-radius:30px; margin-bottom:14px; box-shadow:0 4px 12px rgba(16, 185, 129, 0.3);">
                      <span style="color:#ffffff; font-weight:800; font-size:13px; letter-spacing:1.5px; text-transform:uppercase;">📚 NoteShare</span>
                    </div>
                    <h1 style="color:#ffffff; font-size:24px; font-weight:800; margin:0; letter-spacing:-0.02em;">Account Verification</h1>
                    <p style="color:#94a3b8; font-size:14px; margin:8px 0 0 0;">Verify your email to access academic study notes</p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding:36px 32px; text-align:center; color:#334155;">
                    <p style="font-size:15px; color:#475569; margin:0 0 28px 0; line-height:1.5;">
                      Please enter the following 6-digit verification code to complete your NoteShare registration:
                    </p>

                    <!-- Redesigned OTP Container -->
                    <div style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border:1.5px solid #10b981; border-radius:18px; padding:24px 16px; margin:0 0 28px 0; box-shadow:0 4px 12px rgba(16, 185, 129, 0.08);">
                      <div style="font-family:'Courier New', Courier, monospace; font-size:42px; font-weight:800; letter-spacing:14px; color:#047857; text-indent:14px;">
                        ${otpCode}
                      </div>
                      <p style="font-size:12px; color:#059669; font-weight:600; margin:10px 0 0 0;">
                        Enter this 6-digit code on the registration page
                      </p>
                    </div>

                    <!-- Security Alert Badge -->
                    <div style="background-color:#fffbe6; border:1px solid #fef08a; border-radius:12px; padding:14px 16px; font-size:13px; color:#854d0e; display:inline-block; width:100%; box-sizing:border-box;">
                      ⏳ Valid for <strong>10 minutes</strong>. For your security, never share this code with anyone.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f8fafc; padding:24px 32px; text-align:center; border-top:1px solid #e2e8f0; font-size:12px; color:#94a3b8; line-height:1.6;">
                    If you didn't request this code, you can safely ignore this email.<br />
                    Need help? Contact <a href="mailto:support@noteshare.online" style="color:#059669; text-decoration:none; font-weight:600;">support@noteshare.online</a><br />
                    <span style="display:inline-block; margin-top:8px; color:#cbd5e1;">NoteShare Academic Platform &copy; 2026</span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  return data;
}

module.exports = {
  sendContactFormEmail,
  sendOtpEmail,
};

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

  const destinationEmail = process.env.OFFICIAL_CONTACT_EMAIL || 'noteshare07@gmail.com';
  const mailSubject = subject ? ` ${subject}` : '[NoteShare Contact] New Message';

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
      <body style="margin:0; padding:0; background-color:#F4F8F6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F4F8F6; padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px; background-color:#ffffff; border-radius:20px; overflow:hidden; border:1px solid #DEE4E1; box-shadow:0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                
                <!-- Solid Primary Header -->
                <tr>
                  <td style="background-color:#36D79D; padding:32px 28px; text-align:center;">
                    <h1 style="color:#0F241C; font-size:24px; font-weight:800; margin:0; letter-spacing:-0.02em;">New Contact Form Message</h1>
                    <p style="color:#0F241C; font-size:14px; opacity:0.85; margin:6px 0 0 0; font-weight:600;">NoteShare Support Notification</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:32px 28px; color:#1B211E;">
                    <div style="background-color:#F4F8F6; border:1px solid #DEE4E1; border-radius:12px; padding:20px; margin-bottom:24px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="padding-bottom:10px; font-size:14px; color:#6D7A74;">Sender Name:</td>
                          <td style="padding-bottom:10px; font-size:14px; font-weight:700; color:#1B211E;" align="right">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:10px; font-size:14px; color:#6D7A74;">Sender Email:</td>
                          <td style="padding-bottom:10px; font-size:14px; font-weight:700;" align="right">
                            <a href="mailto:${email}" style="color:#0F241C; text-decoration:underline;">${email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:14px; color:#6D7A74;">Subject:</td>
                          <td style="font-size:14px; font-weight:700; color:#1B211E;" align="right">${subject || 'General Inquiry'}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size:13px; font-weight:700; color:#6D7A74; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 10px 0;">Message Content:</p>
                    <div style="background-color:#F4F8F6; border-left:4px solid #36D79D; border-radius:8px; padding:18px; font-size:14px; line-height:1.6; color:#1B211E; white-space:pre-wrap;">${message}</div>

                  
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#EEF3F0; padding:20px 28px; text-align:center; border-top:1px solid #DEE4E1; font-size:12px; color:#6D7A74;">
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
 * Send OTP Verification email via Resend (Solid Primary Color Template with Copy Code Button)
 */
async function sendOtpEmail(email, otpCode) {
  if (!resend) {
    throw new Error('Resend API key is missing in environment variables');
  }

  const data = await resend.emails.send({
    from: 'NoteShare Security <otp@noteshare.online>',
    to: email,
    subject: `NoteShare verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#F4F8F6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F4F8F6; padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px; background-color:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #DEE4E1; box-shadow:0 12px 30px -10px rgba(0, 0, 0, 0.08);">
                
                <!-- Solid Primary Header -->
                <tr>
                  <td style="background-color:#36D79D; padding:36px 32px; text-align:center;">
                    <h1 style="color:#0F241C; font-size:26px; font-weight:800; margin:0; letter-spacing:-0.02em;">Account Verification</h1>
                    <p style="color:#0F241C; font-size:14px; margin:8px 0 0 0; opacity:0.85; font-weight:600;">Verify your email to access academic study notes</p>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding:36px 32px; text-align:center; color:#1B211E;">
                    <p style="font-size:15px; color:#6D7A74; margin:0 0 28px 0; line-height:1.5;">
                      Please enter the following 6-digit verification code to complete your NoteShare registration:
                    </p>

                    <!-- OTP Container with 1-Click Select & Copy Pill -->
                    <div style="background-color:#F4F8F6; border:2px solid #36D79D; border-radius:18px; padding:24px 16px; margin:0 0 28px 0; box-shadow:0 4px 16px rgba(54, 215, 157, 0.15); user-select:all; -webkit-user-select:all; -moz-user-select:all; cursor:pointer;">
                      <div style="font-family:'Courier New', Courier, monospace; font-size:42px; font-weight:800; letter-spacing:14px; color:#0F241C; text-indent:14px; user-select:all; -webkit-user-select:all; -moz-user-select:all;">
                        ${otpCode}
                      </div>
                    </div>

                    <!-- Security Alert Badge -->
                    <div style="background-color:#fffbe6; border:1px solid #fef08a; border-radius:12px; padding:14px 16px; font-size:13px; color:#854d0e; display:inline-block; width:100%; box-sizing:border-box;">
                      Valid for <strong>10 minutes</strong>. For your security, never share this code with anyone.
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#EEF3F0; padding:24px 32px; text-align:center; border-top:1px solid #DEE4E1; font-size:12px; color:#6D7A74; line-height:1.6;">
                    If you didn't request this code, you can safely ignore this email.<br />
                    Need help? Contact <a href="mailto:support@noteshare.online" style="color:#0F241C; text-decoration:underline; font-weight:700;">support@noteshare.online</a><br />
                    <span style="display:inline-block; margin-top:8px; color:#96A49E;">NoteShare Academic Platform &copy; 2026</span>
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

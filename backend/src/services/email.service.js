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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #059669; color: #ffffff; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">NoteShare Contact Us Message</h2>
        </div>
        <div style="padding: 24px; color: #1e293b;">
          <p style="margin-top: 0; font-size: 14px;"><strong>Student Name:</strong> ${name}</p>
          <p style="font-size: 14px;"><strong>Student Email:</strong> <a href="mailto:${email}" style="color: #059669;">${email}</a></p>
          <p style="font-size: 14px;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Message Content:</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #059669; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">💡 Replying to this email will send your response directly to <strong>${email}</strong>.</p>
        </div>
      </div>
    `,
  });

  return data;
}

/**
 * Send OTP Verification email via Resend
 */
async function sendOtpEmail(email, otpCode) {
  if (!resend) {
    throw new Error('Resend API key is missing in environment variables');
  }

  const data = await resend.emails.send({
    from: 'NoteShare Security <otp@noteshare.online>',
    to: email,
    subject: 'Your NoteShare Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
        <div style="background-color: #059669; color: #ffffff; padding: 24px; text-center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.02em;">NoteShare Account Verification</h1>
        </div>
        <div style="padding: 32px 24px; text-align: center; color: #1e293b;">
          <p style="font-size: 15px; margin-top: 0; color: #475569;">Use the following 6-digit verification code to complete your NoteShare registration:</p>
          <div style="margin: 28px 0; background-color: #f0fdf4; border: 2px dashed #059669; padding: 18px; border-radius: 12px; display: inline-block;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #059669; font-family: monospace;">${otpCode}</span>
          </div>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          © 2026 NoteShare Academic Platform. All rights reserved.
        </div>
      </div>
    `,
  });

  return data;
}

module.exports = {
  sendContactFormEmail,
  sendOtpEmail,
};

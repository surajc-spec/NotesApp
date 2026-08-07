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

module.exports = {
  sendContactFormEmail,
};

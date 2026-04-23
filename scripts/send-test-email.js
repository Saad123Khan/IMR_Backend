require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const secure = process.env.MAIL_SECURE === 'true';
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const fromName = process.env.MAIL_FROM_NAME || 'IMR Support';
  const fromAddress = process.env.MAIL_FROM_ADDRESS || user;
  const to = process.env.TEST_TO || user;

  if (!host || !user || !pass || !fromAddress) {
    console.error('Missing MAIL_* env vars. Please set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM_ADDRESS.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: 'IMR Test Email',
    text: 'This is a test email from IMR backend to verify SMTP settings.',
    html: '<p>This is a <strong>test email</strong> from IMR backend to verify SMTP settings.</p>',
  });

  console.log('Message sent:', info.messageId);
  console.log('Envelope:', info.envelope);
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to send test email:', err && err.message ? err.message : err);
  process.exit(2);
});

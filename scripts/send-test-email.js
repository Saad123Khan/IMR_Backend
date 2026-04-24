require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const secure = process.env.MAIL_SECURE === 'true';
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const fromName = process.env.MAIL_FROM_NAME || 'IMR Support';
  let fromAddress = process.env.MAIL_FROM_ADDRESS || user;
  const to = process.env.TEST_TO || user;

  let transporter;
  if (host && user && pass && fromAddress) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  } else {
    console.warn('MAIL_* env vars not fully configured — falling back to Ethereal test account');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    fromAddress = fromAddress || testAccount.user;
    console.log('Ethereal account created:', testAccount.user);
  }

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: 'IMR Test Email',
    text: 'This is a test email from IMR backend to verify SMTP settings.',
    html: '<p>This is a <strong>test email</strong> from IMR backend to verify SMTP settings.</p>',
  });

  console.log('Message sent:', info.messageId);
  console.log('Envelope:', info.envelope);
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log('Preview URL:', preview);
  process.exit(0);
}

main().catch(err => {
  console.error('Failed to send test email:', err && err.message ? err.message : err);
  process.exit(2);
});

require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

async function test() {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'SET (' + process.env.GMAIL_APP_PASSWORD.length + ' chars)' : '❌ MISSING');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    console.log('\nVerifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"NaukriQuest AI" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ NaukriQuest Email Test',
      html: '<h1 style="color:#0077ff">Email is working!</h1><p>Your NaukriQuest notification system is live.</p>',
    });
    console.log('✅ Email sent! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}
test();

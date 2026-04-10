const nodemailer = require('nodemailer');

const getTransporter = () => {
  // Create fresh each time to always use current env vars
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send a job alert email to a single candidate
 */
const sendJobNotificationEmail = async ({ to, candidateName, job }) => {
  try {
    const transporter = getTransporter();
    const applyLink = job.apply_link || 'https://naukariquest.vercel.app';

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#060c1a;color:#fff;padding:0;margin:0}
.outer{background:#060c1a;padding:32px 16px}
.card{max-width:560px;margin:0 auto;background:linear-gradient(145deg,#0f1626,#1a2235);border-radius:24px;border:1px solid rgba(0,212,255,0.18);overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6)}
.header{background:linear-gradient(135deg,#0055ff 0%,#00d4ff 100%);padding:28px 32px 24px}
.header-icon{width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:12px}
.header h1{font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#fff}
.header p{margin-top:6px;font-size:13px;color:rgba(255,255,255,0.82)}
.body{padding:28px 32px}
.greeting{font-size:15px;line-height:1.6;color:rgba(255,255,255,0.8);margin-bottom:22px}
.greeting strong{color:#fff}
.job-card{background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,255,0.2);border-radius:16px;padding:22px;margin-bottom:22px;position:relative;overflow:hidden}
.job-card-bar{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0055ff,#00d4ff)}
.job-title{font-size:18px;font-weight:900;color:#fff;line-height:1.3;margin-bottom:4px}
.company-name{font-size:13px;color:#00d4ff;font-weight:700;margin-bottom:16px}
.tags{display:flex;flex-wrap:wrap;gap:8px}
.tag{font-size:11px;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.07);padding:5px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1)}
.cta{display:block;text-align:center;background:linear-gradient(135deg,#0055ff,#00d4ff);color:#fff;text-decoration:none;font-weight:900;font-size:14px;padding:15px 28px;border-radius:14px;letter-spacing:0.2px}
.divider{height:1px;background:rgba(255,255,255,0.06);margin:24px 0}
.footer{padding:0 32px 28px;font-size:11px;color:rgba(255,255,255,0.28);text-align:center;line-height:1.8}
.footer a{color:#00d4ff;text-decoration:none}
</style>
</head>
<body>
<div class="outer">
<div class="card">
  <div class="header">
    <div class="header-icon">⚡</div>
    <h1>New Job Alert</h1>
    <p>NaukriQuest AI found a new opportunity for you!</p>
  </div>
  <div class="body">
    <p class="greeting">Hey <strong>${candidateName || 'there'}</strong> 👋,<br/>A new job has been posted that matches your profile. Don't miss out!</p>
    <div class="job-card">
      <div class="job-card-bar"></div>
      <div class="job-title">${job.title}</div>
      <div class="company-name">${job.company}</div>
      <div class="tags">
        <span class="tag">📍 ${job.location || 'Remote'}</span>
        <span class="tag">💼 ${job.type || 'Full-time'}</span>
        ${job.salary && job.salary !== 'Not Disclosed' ? `<span class="tag">💰 ${job.salary}</span>` : ''}
        ${job.apply_link ? '<span class="tag">🔗 LinkedIn Global</span>' : '<span class="tag">🏢 NaukriQuest</span>'}
      </div>
    </div>
    <a href="${applyLink}" class="cta">🚀 View &amp; Apply Now</a>
    <div class="divider"></div>
    <p style="font-size:12px;color:rgba(255,255,255,0.4);text-align:center">Log in to see your full personalized recommendations.</p>
  </div>
  <div class="footer">
    You're receiving this as a registered NaukriQuest candidate.<br/>
    <a href="https://naukariquest.vercel.app">naukariquest.vercel.app</a> · 
    <a href="https://naukariquest.vercel.app/profile">Manage Notifications</a>
  </div>
</div>
</div>
</body></html>`;

    await transporter.sendMail({
      from: `"NaukriQuest AI ⚡" <${process.env.EMAIL_USER}>`,
      to,
      subject: `⚡ New Job: ${job.title} at ${job.company}`,
      html,
    });
    console.log(`📧 Email sent → ${to}`);
    return true;
  } catch (err) {
    console.error(`❌ Email failed for ${to}:`, err.message);
    return false;
  }
};

/**
 * Blast job notifications to ALL candidates with emails.
 * Only triggered when a recruiter posts a job from the Dashboard.
 */
const blastJobNotification = async (savedJob) => {
  try {
    const User = require('../models/User');
    const Candidate = require('../models/Candidate');

    // Query User model — emails are ALWAYS stored here at registration
    const candidateUsers = await User.find({
      role: 'candidate',
      email: { $exists: true, $ne: '' }
    }).select('_id name email');

    if (!candidateUsers.length) {
      console.log('📭 No candidate users to notify.');
      return;
    }

    console.log(`📣 Blasting to ${candidateUsers.length} candidates for "${savedJob.title}"...`);

    let sent = 0;
    for (const user of candidateUsers) {
      // 1. Push in-app notification into Candidate doc (upsert if missing)
      try {
        await Candidate.findOneAndUpdate(
          { $or: [{ userId: user._id }, { email: user.email }] },
          {
            $push: {
              notifications: {
                message: `New job posted: "${savedJob.title}" at ${savedJob.company}`,
                jobId: savedJob._id,
                read: false,
                createdAt: new Date(),
              }
            },
            $setOnInsert: { userId: user._id, email: user.email, name: user.name }
          },
          { upsert: true }
        );
      } catch (notifErr) {
        console.warn(`In-app notif failed for ${user.email}:`, notifErr.message);
      }

      // 2. Send email
      const ok = await sendJobNotificationEmail({
        to: user.email,
        candidateName: user.name,
        job: savedJob,
      });
      if (ok) sent++;
    }

    console.log(`✅ Done: ${sent}/${candidateUsers.length} emails sent for "${savedJob.title}"`);
  } catch (err) {
    console.error('Blast notification error:', err.message);
  }
};

module.exports = { sendJobNotificationEmail, blastJobNotification };

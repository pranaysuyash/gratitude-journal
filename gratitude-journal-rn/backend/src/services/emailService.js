/**
 * Email Service
 * Send transactional emails
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_USER) {
      console.log('Email service not configured');
      console.log(`Would send email to: ${to}`);
      console.log(`Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Gratitude Journal" <noreply@gratitudejournal.app>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Gratitude Journal! 🙏',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Welcome, ${user.displayName}!</h1>
        <p>We're thrilled to have you join our gratitude community.</p>
        <p>Gratitude journaling is a powerful practice that can transform your mindset and improve your wellbeing.</p>

        <h2>Get Started:</h2>
        <ul>
          <li>✍️ Write your first entry</li>
          <li>🎯 Set a daily reminder</li>
          <li>📊 Track your streak</li>
          <li>🏆 Earn badges</li>
        </ul>

        <a href="${process.env.FRONTEND_URL}/write" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Write Your First Entry
        </a>

        <p style="color: #666; font-size: 14px;">
          Need help? Reply to this email or visit our <a href="${process.env.FRONTEND_URL}/help">Help Center</a>.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          © 2024 Gratitude Journal. All Rights Reserved.
        </p>
      </div>
    `
  });
};

/**
 * Send streak milestone email
 */
const sendStreakEmail = async (user, streak) => {
  const milestones = {
    7: { emoji: '🔥', message: 'One week strong!' },
    30: { emoji: '⭐', message: 'One month of gratitude!' },
    100: { emoji: '💯', message: 'Triple digits!' },
    365: { emoji: '🎉', message: 'One full year!' }
  };

  const milestone = milestones[streak];
  if (!milestone) return;

  return sendEmail({
    to: user.email,
    subject: `${milestone.emoji} ${streak}-Day Streak Achievement!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="font-size: 48px;">${milestone.emoji}</h1>
        <h2 style="color: #4CAF50;">${streak} Days!</h2>
        <p style="font-size: 18px;">${milestone.message}</p>
        <p>You've been practicing gratitude for ${streak} consecutive days. That's incredible dedication!</p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Keep your streak alive!</strong></p>
          <p style="margin: 10px 0 0;">Write today's entry and continue your journey.</p>
        </div>

        <a href="${process.env.FRONTEND_URL}/write" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Write Today's Entry
        </a>
      </div>
    `
  });
};

/**
 * Send monthly report
 */
const sendMonthlyReport = async (user, stats) => {
  return sendEmail({
    to: user.email,
    subject: `📊 Your Monthly Gratitude Report`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4CAF50;">Your Month in Gratitude</h1>
        <p>Hi ${user.displayName},</p>
        <p>Here's a summary of your gratitude practice this month:</p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 10px;">
                <strong>📝 Entries Written</strong><br/>
                <span style="font-size: 24px; color: #4CAF50;">${stats.entriesThisMonth}</span>
              </td>
              <td style="padding: 10px;">
                <strong>🔥 Current Streak</strong><br/>
                <span style="font-size: 24px; color: #FF5722;">${stats.currentStreak}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px;">
                <strong>✍️ Words Written</strong><br/>
                <span style="font-size: 24px; color: #2196F3;">${stats.wordsThisMonth}</span>
              </td>
              <td style="padding: 10px;">
                <strong>🏆 Badges Earned</strong><br/>
                <span style="font-size: 24px; color: #FFC107;">${stats.badgesThisMonth}</span>
              </td>
            </tr>
          </table>
        </div>

        <p>${stats.aiInsights || 'Keep up your amazing gratitude practice!'}</p>

        <a href="${process.env.FRONTEND_URL}/analytics" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          View Full Analytics
        </a>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendStreakEmail,
  sendMonthlyReport
};

// monthlyEmailScheduler.js
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import db from './db.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@vaidhisadhanabhakti.cloud';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: Number(smtpPort) || 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

async function sendMonthlySadhanaEmail(user) {
  const { email, first_name } = user;
  const logoPath = path.resolve('uploads/public-data/VSB-logo.png');
  const logoCid = 'vsb-info@vaidhisadhanabhakti.cloud';
  const logoExists = fs.existsSync(logoPath);
  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f7fb; padding: 24px; margin: 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eceef4;">
        <tr>
          <td style="padding: 28px 28px 16px 28px; text-align: center; background: #fff9ef;">
            ${logoExists
              ? `<img src=\"cid:${logoCid}\" alt=\"Vaidhi Sadhana Bhakti\" style=\"max-width: 240px; height: auto; display: inline-block;\" />`
              : `<h2 style=\"margin: 0; color: #5a2d0c; font-size: 26px; letter-spacing: 0.5px;\">VAIDHI SADHANA BHAKTI</h2>`}
          </td>
        </tr>
        <tr>
          <td style="padding: 28px; color: #222222;">
            <h2 style="margin: 0 0 12px 0; font-size: 24px; color: #1f2a44;">Monthly Sadhana Card Reminder</h2>
            <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
              Dear ${first_name || 'Devotee'},<br/>
              Your monthly sadhana card is ready! Please download your sadhana card from the app and continue your spiritual journey.
            </p>
            <div style="margin: 0 0 18px 0; text-align: center;">
              <a href="https://vaidhisadhanabhakti.cloud/login" style="display: inline-block; font-size: 18px; font-weight: 700; color: #fff; background: #5a2d0c; border-radius: 8px; padding: 12px 24px; text-decoration: none;">Download Sadhana Card</a>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #718096;">
              If you have any questions, reply to this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 28px 24px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #edf2f7;">
            © ${new Date().getFullYear()} Vaidhi Sadhana Bhakti. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  `;

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: 'VSB: Download Your Monthly Sadhana Card',
    html: htmlBody,
  };
  if (logoExists) {
    mailOptions.attachments = [
      {
        filename: 'VSB-logo.png',
        path: logoPath,
        cid: logoCid,
      },
    ];
  }
  await transporter.sendMail(mailOptions);
}

// Schedule: 1st of every month at 9:00 AM
cron.schedule('0 9 1 * *', async () => {
  const now = new Date();
  console.log(`[SCHEDULER] Running monthly sadhana email job at ${now.toLocaleString()}`);
  try {
    const [users] = await db.execute('SELECT email, first_name FROM devotees WHERE email IS NOT NULL');
    console.log(`[SCHEDULER] Found ${users.length} users to email.`);
    for (const user of users) {
      try {
        await sendMonthlySadhanaEmail(user);
        console.log(`[SCHEDULER] Email sent to: ${user.email}`);
      } catch (err) {
        console.error(`[SCHEDULER] Failed to send email to ${user.email}:`, err.message);
      }
    }
    console.log(`[SCHEDULER] Monthly sadhana email job completed at ${new Date().toLocaleString()}`);
  } catch (err) {
    console.error('[SCHEDULER] Error fetching users for monthly sadhana email:', err.message);
  }
});

// --- Daily Premium Expiry Email Scheduler ---
async function sendPremiumExpiryEmail(user) {
  const { email, first_name } = user;
  const logoPath = path.resolve('uploads/public-data/VSB-logo.png');
  const logoCid = 'vsb-info@vaidhisadhanabhakti.cloud';
  const logoExists = fs.existsSync(logoPath);
  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f7fb; padding: 24px; margin: 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eceef4;">
        <tr>
          <td style="padding: 28px 28px 16px 28px; text-align: center; background: #fff9ef;">
            ${logoExists
              ? `<img src=\"cid:${logoCid}\" alt=\"Vaidhi Sadhana Bhakti\" style=\"max-width: 240px; height: auto; display: inline-block;\" />`
              : `<h2 style=\"margin: 0; color: #5a2d0c; font-size: 26px; letter-spacing: 0.5px;\">VAIDHI SADHANA BHAKTI</h2>`}
          </td>
        </tr>
        <tr>
          <td style="padding: 28px; color: #222222;">
            <h2 style="margin: 0 0 12px 0; font-size: 24px; color: #c0392b;">Your Premium Access Has Expired</h2>
            <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
              Dear ${first_name || 'Devotee'},<br/>
              Your premium access to Vaidhi Sadhana Bhakti has expired. To continue enjoying all premium features, please upgrade your account.<br/>
              <b>Click the button below to renew your premium membership.</b>
            </p>
            <div style="margin: 0 0 18px 0; text-align: center;">
              <a href="https://vaidhisadhanabhakti.cloud/login" style="display: inline-block; font-size: 18px; font-weight: 700; color: #fff; background: #c0392b; border-radius: 8px; padding: 12px 24px; text-decoration: none;">Upgrade to Premium</a>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #718096;">
              If you have any questions, reply to this email.<br/>
              Hare Krishna!<br/>
              <b>Vaidhi Sadhana Bhakti Team</b>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 28px 24px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #edf2f7;">
            © ${new Date().getFullYear()} Vaidhi Sadhana Bhakti. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  `;

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: 'VSB: Your Premium Access Has Expired – Upgrade Now!',
    html: htmlBody,
  };
  if (logoExists) {
    mailOptions.attachments = [
      {
        filename: 'VSB-logo.png',
        path: logoPath,
        cid: logoCid,
      },
    ];
  }
  await transporter.sendMail(mailOptions);
}

// Schedule: Every week on Monday at 8:00 AM
// Runs at 8:00 AM every Monday (0 8 * * 1)
cron.schedule('0 8 * * 1', async () => {
  const now = new Date();
  console.log(`[SCHEDULER] Running daily premium expiry check at ${now.toLocaleString()}`);
  try {
    // Find users whose premium is expired (not premium, expiry date in past, and email exists)
    const [users] = await db.execute(
      `SELECT email, SUBSTRING_INDEX(email, '@', 1) AS first_name FROM users WHERE user_type != 'premium' AND premium_expiry_date IS NOT NULL AND premium_expiry_date < NOW() AND email IS NOT NULL`
    );
    console.log(`[SCHEDULER] Found ${users.length} users with expired premium.`);
    for (const user of users) {
      try {
        await sendPremiumExpiryEmail(user);
        console.log(`[SCHEDULER] Premium expiry email sent to: ${user.email}`);
      } catch (err) {
        console.error(`[SCHEDULER] Failed to send premium expiry email to ${user.email}:`, err.message);
      }
    }
    console.log(`[SCHEDULER] Daily premium expiry check completed at ${new Date().toLocaleString()}`);
  } catch (err) {
    console.error('[SCHEDULER] Error fetching users for premium expiry email:', err.message);
  }
});

// --- Daily Sadhana Entry Reminder Scheduler ---
async function sendSadhanaEntryReminderEmail(user, todayStr, dayStr) {
  const { email, first_name } = user;
  const logoPath = path.resolve('uploads/public-data/VSB-logo.png');
  const logoCid = 'vsb-info@vaidhisadhanabhakti.cloud';
  const logoExists = fs.existsSync(logoPath);
  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f6f7fb; padding: 24px; margin: 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #eceef4;">
        <tr>
          <td style="padding: 28px 28px 16px 28px; text-align: center; background: #fff9ef;">
            ${logoExists
              ? `<img src=\"cid:${logoCid}\" alt=\"Vaidhi Sadhana Bhakti\" style=\"max-width: 240px; height: auto; display: inline-block;\" />`
              : `<h2 style=\"margin: 0; color: #5a2d0c; font-size: 26px; letter-spacing: 0.5px;\">VAIDHI SADHANA BHAKTI</h2>`}
          </td>
        </tr>
        <tr>
          <td style="padding: 28px; color: #222222;">
            <h2 style="margin: 0 0 12px 0; font-size: 22px; color: #1f2a44;">Sadhana Entry Reminder</h2>
            <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">
              Dear ${first_name || 'Devotee'},<br/>
              This is a gentle reminder to enter your sadhana for <b>${todayStr} (${dayStr})</b>.<br/>
              Please log in and record your daily sadhana to track your spiritual progress!
            </p>
            <div style="margin: 0 0 18px 0; text-align: center;">
              <a href="https://vaidhisadhanabhakti.cloud/login" style="display: inline-block; font-size: 18px; font-weight: 700; color: #fff; background: #5a2d0c; border-radius: 8px; padding: 12px 24px; text-decoration: none;">Enter Today's Sadhana</a>
            </div>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #718096;">
              If you have any questions, reply to this email.<br/>
              Hare Krishna!<br/>
              <b>Vaidhi Sadhana Bhakti Team</b>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 28px 24px 28px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #edf2f7;">
            © ${new Date().getFullYear()} Vaidhi Sadhana Bhakti. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  `;

  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: `VSB: Reminder – Enter Your Sadhana for ${todayStr} (${dayStr})`,
    html: htmlBody,
  };
  if (logoExists) {
    mailOptions.attachments = [
      {
        filename: 'VSB-logo.png',
        path: logoPath,
        cid: logoCid,
      },
    ];
  }
  await transporter.sendMail(mailOptions);
}

// Schedule: Every day at 9:00 PM
cron.schedule('0 21 * * *', async () => {
  const now = new Date();
  const todayStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const dayStr = now.toLocaleDateString('en-IN', { weekday: 'long' });
  console.log(`[SCHEDULER] Running daily sadhana entry reminder at ${now.toLocaleString()}`);
  try {
    // Send to all users with a valid email (devotees and users)
    // 1. From devotees table
    const [devotees] = await db.execute('SELECT email, first_name FROM devotees WHERE email IS NOT NULL');
    // 2. From users table
    const [users] = await db.execute("SELECT email, SUBSTRING_INDEX(email, '@', 1) AS first_name FROM users WHERE email IS NOT NULL");
    // Merge and deduplicate by email
    const all = [...devotees, ...users].filter((v, i, a) => v.email && a.findIndex(t => t.email === v.email) === i);
    console.log(`[SCHEDULER] Found ${all.length} users to remind for sadhana entry.`);
    for (const user of all) {
      try {
        await sendSadhanaEntryReminderEmail(user, todayStr, dayStr);
        console.log(`[SCHEDULER] Sadhana entry reminder sent to: ${user.email}`);
      } catch (err) {
        console.error(`[SCHEDULER] Failed to send sadhana entry reminder to ${user.email}:`, err.message);
      }
    }
    console.log(`[SCHEDULER] Daily sadhana entry reminder completed at ${new Date().toLocaleString()}`);
  } catch (err) {
    console.error('[SCHEDULER] Error fetching users for sadhana entry reminder:', err.message);
  }
});

export default null; // For ES module compatibility

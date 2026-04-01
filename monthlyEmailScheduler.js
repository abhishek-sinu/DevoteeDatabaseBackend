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

export default null; // For ES module compatibility

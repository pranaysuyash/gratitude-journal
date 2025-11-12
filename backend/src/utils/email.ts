/**
 * Email Utility
 * Send emails using SendGrid or Nodemailer
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import nodemailer from 'nodemailer';
import logger from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@gratitudejournal.app',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
}

export async function sendBatchEmails(emails: EmailOptions[]): Promise<void> {
  try {
    await Promise.all(emails.map((email) => sendEmail(email)));
  } catch (error) {
    logger.error('Batch email send error:', error);
    throw error;
  }
}

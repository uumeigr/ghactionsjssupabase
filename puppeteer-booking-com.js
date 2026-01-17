

const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
import { Resend } from 'resend';

// Email configuration
const EMAIL_CONFIG = {
  service: 'outlook', // or 'gmail', etc.
  sender: 'onboarding@resend.dev',
  auth: {
    user: 'your-email@outlook.com', // Replace with your email
    pass: 'your-email-password' // Replace with your password or app password
  }
};

const TARGET_EMAIL = 'szjme@outlook.com';
const HOTEL_URL = 'https://www.booking.com/hotel/cn/intercontinental-shenzhen.html';

// Setup email transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

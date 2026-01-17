

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


// Function to send email with all prices
async function sendPriceReport(results) {
  // Generate table rows
  const tableRows = results.map(r => {
    const status = r.error ? '❌ Error' : (r.price ? `USD ${r.price}` : '⚠️ N/A');
    const rowClass = r.price && r.price <= 200 ? 'highlight' : '';
    return `
      <tr class="${rowClass}">
        <td>${r.date}</td>
        <td>${status}</td>
        ${r.error ? `<td colspan="2">${r.error}</td>` : ''}
      </tr>
    `;
  }).join('');

  // Calculate summary stats
  const validPrices = results.filter(r => r.price).map(r => r.price);
  const avgPrice = validPrices.length > 0 
    ? (validPrices.reduce((a, b) => a + b, 0) / validPrices.length).toFixed(2)
    : 'N/A';
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 'N/A';
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 'N/A';
  const underTarget = validPrices.filter(p => p <= 200).length;


  const mailOptions = {
    from: EMAIL_CONFIG.sender,
    to: TARGET_EMAIL,
    subject: `Hotel Price Report - 90 Days`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          h1 { color: #003580; margin-bottom: 10px; }
          h2 { color: #666; font-size: 18px; margin-top: 30px; }
          .summary { background: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .summary-item { padding: 10px; }
          .summary-label { font-weight: bold; color: #003580; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #003580; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f9f9f9; }
          .highlight { background: #e7f5e7; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏨 Hotel Price Report</h1>
          <p><strong>Hotel:</strong> InterContinental Shenzhen WECC by IHG</p>
          <p><strong>Room Type:</strong> Classic Room</p>
          <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
          
          <div class="summary">
            <h2>📊 Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Average Price:</div>
                <div>USD ${avgPrice}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Lowest Price:</div>
                <div>USD ${minPrice}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Highest Price:</div>
                <div>USD ${maxPrice}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Days ≤ USD 200:</div>
                <div>${underTarget} days</div>
              </div>
            </div>
          </div>

          <h2>📅 90-Day Price Calendar</h2>
          <table>
            <thead>
              <tr>
                <th>Check-in Date</th>
                <th>Price (1 Night)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            <p>💡 Highlighted rows indicate prices at or below USD 200</p>
            <p>🔗 <a href="${HOTEL_URL}">View hotel on Booking.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
 
	  const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send(mailOptions);
    
    console.log(`✓ Price report email sent to ${TARGET_EMAIL}`);
    
  } catch (error) {
    console.error(`✗ Failed to send email:`, error.message);
  }
  
}





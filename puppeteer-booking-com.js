

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

/ Function to check hotel price for a specific date
async function checkPrice(browser, checkInDate, checkOutDate) {
  const page = await browser.newPage();
  
  try {
    // Format dates for URL (YYYY-MM-DD)
    const checkIn = checkInDate.toISOString().split('T')[0];
    const checkOut = checkOutDate.toISOString().split('T')[0];
    
    const url = `${HOTEL_URL}?checkin=${checkIn}&checkout=${checkOut}&selected_currency=USD`;
    
    console.log(`Checking price for ${checkIn}...`);
    
    // Set viewport and user agent to appear more like a real browser
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);
    
    // Take screenshot for debugging (optional - comment out if not needed)
    // await page.screenshot({ path: `screenshot-${checkIn}.png` });
    
    // Try multiple selector strategies to find the price
    const priceInfo = await page.evaluate(() => {
      // Strategy 1: Look for common price class patterns
      const selectors = [
        '.prco-valign-middle-helper',
        '.prco-inline-block-maker-helper',
        '[data-testid="price-and-discounted-price"]',
        '.bui-price-display__value',
        '.prco-text-nowrap-helper',
        '.e1e3b38b8f', // Booking.com sometimes uses hash classes
        'span[aria-hidden="true"]',
        '.fcab3ed991.e729ed5ab6' // Common price wrapper classes
      ];
      
      for (let selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (let el of elements) {
          const text = el.textContent.trim();
          // Look for text that contains currency symbols and numbers
          if (text.match(/(?:US\$|USD|\$|CNY|¥|€|£)\s*[\d,]+/) || text.match(/^[\d,]+$/)) {
            return text;
            // jump out the loop when first match found
          }
        }
      }
      
      // Strategy 2: Look for any element containing price-like text
      const allElements = document.querySelectorAll('span, div, b, strong');
      for (let el of allElements) {
        const text = el.textContent.trim();
        // Match patterns like "US$200", "$200", "USD 200"
        if (text.match(/^(?:US\$|USD)\s*[\d,]+$/)) {
          return text;
        }
      }
      
      // Strategy 3: Get all text and find price patterns
      const bodyText = document.body.innerText;
      const priceMatches = bodyText.match(/US\$\s*[\d,]+/g);
      if (priceMatches && priceMatches.length > 0) {
        return priceMatches[0];
      }
      
      return null;
    });
    
    if (priceInfo) {
      // Extract numeric value from various formats
      // Handles: "US$200", "$200", "USD 200", "200", "1,200"
      const priceMatch = priceInfo.match(/[\d,]+/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(/,/g, ''));
        console.log(`  ✓ Price found: USD ${price} (raw: "${priceInfo}")`);
        return { date: checkIn, price };
      }
    }
    
    console.log(`  ⚠️ No price found for ${checkIn}`);
    return { date: checkIn, price: null };
    
  } catch (error) {
    console.error(`  ✗ Error for ${checkInDate.toISOString().split('T')[0]}:`, error.message);
    return { date: checkInDate.toISOString().split('T')[0], price: null, error: error.message };
  } finally {
    await page.close();
  }
}


/ Main monitoring function
async function monitorHotelPrices() {
  console.log('🏨 Starting hotel price monitoring...');
  console.log(`📍 Hotel: InterContinental Shenzhen WECC by IHG`);
  console.log(`📅 Monitoring next 90 days`);
  console.log(`📧 Report will be sent to: ${TARGET_EMAIL}`);
  console.log('---');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  const today = new Date();
  
  try {
    for (let i = 0; i < 90; i++) {
      const checkInDate = new Date(today);
      checkInDate.setDate(today.getDate() + i);
      
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkInDate.getDate() + 1); // 1 night stay
      
      const result = await checkPrice(browser, checkInDate, checkOutDate);
      results.push(result);
      
      // Add delay between requests to avoid being blocked
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } finally {
    await browser.close();
  }
  
  console.log('---');
  console.log('✅ Monitoring complete!');
  console.log(`📊 Checked ${results.length} dates`);
  
  const validPrices = results.filter(r => r.price);
  console.log(`💰 Valid prices found: ${validPrices.length}`);
  
  // Send email report
  await sendPriceReport(results);
  
  // Save results to file
  const fs = require('fs');
  fs.writeFileSync('price-results.json', JSON.stringify(results, null, 2));
  console.log('💾 Results saved to price-results.json');
  
  return results;
}

// Run the monitor
monitorHotelPrices()
  .then(() => {
    console.log('\n🎉 All done!');
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });




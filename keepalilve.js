// This script runs in a Node.js environment (like GitHub Actions)
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Pings an endpoint to keep the project active
async function keepAlive() {
  try {
    // Replace 'your_table_name' with the name of your small keep-alive table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/your_table_name`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (response.ok) {
      console.log('Supabase project ping successful. Project is awake.');
    } else {
      console.error('Supabase project ping failed. Status:', response.status);
    }
  } catch (error) {
    console.error('An error occurred during Supabase keep-alive ping:', error);
  }
}

keepAlive();

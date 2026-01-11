// This script runs in a Node.js environment (like GitHub Actions)
//const fetch = require('node-fetch');
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
console.log("The supabase url is: " + SUPABASE_URL);
console.log("The supabase anon key is: " + SUPABASE_ANON_KEY);

console.log("Breakpoint 1 ----------------------------------------------------------------------- set by J10");

const SUPABASE_URL_FR_SECRETS = ${{ secrets.SUPABASE_URL }};
const SUPABASE_ANON_KEY_FR_SECRETS = ${{ secrets.SUPABASE_ANON_KEY }};
console.log("The supabase url is: " + SUPABASE_URL_FR_SECRETS);
console.log("The supabase anon key is: " + SUPABASE_ANON_KEY_FR_SECRETS);

console.log("Breakpoint 2 ----------------------------------------------------------------------- set by J10");

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log("Breakpoint 3 ----------------------------------------------------------------------- set by J10");


// Pings an endpoint to keep the project active
async function keepAlive() {
  try {
//    const { data, error } = await supabase.from('keep_alive_ping').select();

//    if (data[status] == 200) {
//      console.log('Supabase project ping successful. Project is awake.');
//    } else {
//      console.error('Supabase project ping failed. Status:', data[status]);
//    }

      const currentDate = new Date();
      const timestamptz = currentDate.toISOString();

      console.log(timestamptz);
    
    

      const { error } = await supabase
        .from('keep_alive_ping')
        .insert({ id: 2, last_ping: timestamptz });

      console.log("Breakpoint 4 ----------------------------------------------------------------------- set by J10");
      
    
  } catch (error) {
    console.error('An error occurred during Supabase keep-alive ping:', error);
  }
}

keepAlive();

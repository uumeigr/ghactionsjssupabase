// This script runs in a Node.js environment (like GitHub Actions)
//const fetch = require('node-fetch');
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
console.log("The supabase url is: " + SUPABASE_URL);
console.log("The supabase anon key is: " + SUPABASE_ANON_KEY);

console.log("Breakpoint -------------------------------------001---------------------------------- set by J10");

//Run node keepalilve.js
//file:///home/runner/work/ghactionsjssupabase/ghactionsjssupabase/keepalilve.js:12
//const SUPABASE_URL_FR_SECRETS = ${{ secrets.SUPABASE_URL }};
//                                 ^

//SyntaxError: Unexpected token '{'
//const SUPABASE_ANON_KEY_FR_SECRETS = ${{ secrets.SUPABASE_ANON_KEY }};
//console.log("The supabase url is: " + SUPABASE_URL_FR_SECRETS);
//console.log("The supabase anon key is: " + SUPABASE_ANON_KEY_FR_SECRETS);

console.log("Breakpoint -------------------------------------002------------------------------ set by J10");

// Create a single supabase client for interacting with your database
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const currentDate = new Date();
const timestamptz = currentDate.toISOString();
console.log(timestamptz);

console.log("Breakpoint -------------------------------------003------------------------------- set by J10");


// Pings an endpoint to keep the project active
async function keepAlive() {
  try {
    const resp = await supabase.from('keep_alive_ping').select().eq('id', 1);
    console.log(resp);
    //Check the timestamp, select statement and from node in Supabase dashboard /left bar/ Logs, the query is exectued successfully
    //Breakpoint -------------------------------------002------------------------------ set by J10
    //2026-01-11T10:31:29.708Z
    //Breakpoint -------------------------------------003------------------------------- set by J10
    //{ error: null, data: [], count: null, status: 200, statusText: 'OK' }
    
    //const { data, error } = await supabase.from('keep_alive_ping').select();
    //console.log(data);
    //The supabase url is: ***
    //The supabase anon key is: ***
    //Breakpoint -------------------------------------001---------------------------------- set by J10
    //Breakpoint -------------------------------------002------------------------------ set by J10
    //Breakpoint -------------------------------------003------------------------------- set by J10
    //[]
    //Breakpoint -------------------------------------004------------------------------- set by J10

    //if (data[status] == 200) {
      //An error occurred during Supabase keep-alive ping: ReferenceError: status is not defined
      //at keepAlive (file:///home/runner/work/ghactionsjssupabase/ghactionsjssupabase/keepalilve.js:35:14)
      //console.log('Supabase project ping successful. Project is awake.');
    //} else {
    //  console.error('Supabase project ping failed. Status:', data[status]);
    //}

//      const currentDate = new Date();
//      const timestamptz = currentDate.toISOString();

//      console.log(timestamptz);
    
    

 //     const { error } = await supabase
 //       .from('keep_alive_ping')
 //       .insert({ id: 2, last_ping: timestamptz });


      console.log("Breakpoint -------------------------------------004------------------------------- set by J10");
    
  } catch (error) {
    console.error('An error occurred during Supabase keep-alive ping:', error);
  }
}

keepAlive();

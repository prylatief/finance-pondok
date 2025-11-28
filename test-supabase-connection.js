// Test Supabase Connection
// Run this with: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Check if credentials exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Missing credentials in .env.local');
  console.log('\nChecking what we got:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET (hidden)' : 'NOT SET');
  process.exit(1);
}

// Validate URL format
if (supabaseUrl.includes('your-project-id') || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.error('❌ ERROR: You still have placeholder URL!');
  console.log('Please replace with your actual Supabase URL from dashboard');
  process.exit(1);
}

// Validate Key format
if (supabaseAnonKey.includes('your-anon-key-here') || supabaseAnonKey === 'your-anon-key-here') {
  console.error('❌ ERROR: You still have placeholder API key!');
  console.log('Please replace with your actual anon key from dashboard');
  process.exit(1);
}

console.log('✅ Credentials found in .env.local');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key:', supabaseAnonKey.substring(0, 20) + '...' + '(hidden)');
console.log('');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
console.log('🔗 Attempting to connect to Supabase...\n');

try {
  // Try to query from a table (will fail if table doesn't exist, but that's OK)
  const { data, error } = await supabase
    .from('categories')
    .select('count', { count: 'exact', head: true });

  if (error && error.code === 'PGRST116') {
    // Table doesn't exist yet - but connection is OK!
    console.log('✅ CONNECTION SUCCESSFUL! 🎉');
    console.log('⚠️  Note: "categories" table not found (you need to run migrations)');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run database migrations to create tables');
    console.log('2. Your Supabase is connected and ready!');
  } else if (error) {
    console.error('❌ Connection error:', error.message);
    console.log('\nPossible issues:');
    console.log('- Wrong URL or API key');
    console.log('- Network issues');
    console.log('- Supabase project is paused/deleted');
  } else {
    console.log('✅ CONNECTION SUCCESSFUL! 🎉');
    console.log('✅ "categories" table exists and accessible!');
  }
} catch (err) {
  console.error('❌ Failed to connect:', err.message);
  console.log('\nPlease check:');
  console.log('1. Your internet connection');
  console.log('2. Supabase URL is correct');
  console.log('3. API key is correct');
}

console.log('\n' + '='.repeat(50));

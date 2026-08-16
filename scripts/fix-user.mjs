import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUser() {
  const userId = 'd5d9c750-f80e-4363-8a35-24e52b21c430';
  
  console.log("Updating password for test user...");
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: 'DummyPassword123!',
    email_confirm: true
  });

  if (error) {
    console.error("Error updating user:", error.message);
  } else {
    console.log("Successfully updated password for user:", data.user.email);
  }
}

fixUser();

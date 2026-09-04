/**
 * Application Configuration
 * 
 * আপনার Supabase credentials সরাসরি এই ফাইলের ভেতরে সংযুক্ত করা হলো,
 * ফলে Render বা যেকোনো হোস্টিংয়ে ডিপ্লয় করলে আলাদা করে Environment Variable
 * যোগ করার প্রয়োজন হবে না।
 */

export const APP_CONFIG = {
  // আপনার Supabase Project URL
  SUPABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://hiumjuwbamajfdwaxbdg.supabase.co",

  // আপনার Supabase Anon Public Key
  SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdW1qdXdiYW1hamZkd2F4YmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MTQ1MTMsImV4cCI6MjEwNDA5MDUxM30.u6ax4RmsSqfCRyGYavCQGEyXVDGxyoEf8IPky3IOY4g",

  // Supabase Service Role Key
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdW1qdXdiYW1hamZkd2F4YmRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUxNDUxMywiZXhwIjoyMTA0MDkwNTEzfQ.BByXtaACFcoJTicUH28A5g5-dw-FQ9L6u4pGHzIuhUM",

  // Gemini API Key
  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY ||
    "",
};

import { createClient } from "@supabase/supabase-js";

const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q";

// const supabase = createClient("http://demo.aimaker.fr:8000", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeG5vZHR1ZHNtbXJld2J4eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY5NDczMDksImV4cCI6MjAxMjUyMzMwOX0.XEAfII7FWpSrC9Y6abql1-gJPznIlleM4VBOLidS1uQ");
// const supabaseAdmin = createClient("http://demo.aimaker.fr:8000", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeG5vZHR1ZHNtbXJld2J4eXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5Njk0NzMwOSwiZXhwIjoyMDEyNTIzMzA5fQ.2KXoornBK8FIjRfphkz1xrOZfLCK1_KVKAwVpKWuxy0");

const supabase = createClient("http://demo.aimaker.fr:8000", ANON_KEY);
const supabaseAdmin = createClient(
  "http://demo.aimaker.fr:8000",
  SERVICE_ROLE_KEY
);

export function getSupabaseClient() {
  return supabase;
}

export function getSupabaseAdmin() {
  return supabaseAdmin;
}

export async function checkDBUsers() {
  const { data, error } = await supabaseAdmin.from("users").select("*");

  return !error;
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://wdxnodtudsmmrewbxyvy.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeG5vZHR1ZHNtbXJld2J4eXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY5NDczMDksImV4cCI6MjAxMjUyMzMwOX0.XEAfII7FWpSrC9Y6abql1-gJPznIlleM4VBOLidS1uQ");
const supabaseAdmin = createClient("https://wdxnodtudsmmrewbxyvy.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeG5vZHR1ZHNtbXJld2J4eXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5Njk0NzMwOSwiZXhwIjoyMDEyNTIzMzA5fQ.2KXoornBK8FIjRfphkz1xrOZfLCK1_KVKAwVpKWuxy0");

export function getSupabaseClient(){
    return supabase;
}

export function getSupabaseAdmin(){
    return supabaseAdmin;
}

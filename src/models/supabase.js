import { createClient } from "@supabase/supabase-js";
import { bucket_d_id_pictures, bucket_d_id_videos } from "./supabase-constants";

// const ANON_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
// const SERVICE_ROLE_KEY =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q";

const supabase = createClient(
  "https://zuhmdhvkxcjlwkzeeqpr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aG1kaHZreGNqbHdremVlcXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk1NTc3ODcsImV4cCI6MjAxNTEzMzc4N30.V119VgcHJ3fg9KLiPRYWy1kaLBUR6_bl6gRRYqIdvOM"
);
const supabaseAdmin = createClient(
  "https://zuhmdhvkxcjlwkzeeqpr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aG1kaHZreGNqbHdremVlcXByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTU1Nzc4NywiZXhwIjoyMDE1MTMzNzg3fQ.x-bWas-1h25UdBGOYOgSQUExPC9BEG2HNLQbu6-jL7g"
);

// const supabase = createClient("http://demo.aimaker.fr:8000", ANON_KEY);
// const supabaseAdmin = createClient(
//   "http://demo.aimaker.fr:8000",
//   SERVICE_ROLE_KEY
// );

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

export async function getPictureUrl(userId) {
  const { data: pictureList, error: errorPictureList } = await supabase.storage
    .from(bucket_d_id_pictures)
    .list("", { search: userId });

  var photo_url = null;
  if (pictureList && pictureList.length > 0) {
    const { data: dataImage } = supabase.storage
      .from(bucket_d_id_pictures)
      .getPublicUrl(pictureList[0].name);

    photo_url = dataImage.publicUrl;
  }

  return photo_url;
}

export async function getVideoProfileUrl(userId) {
  const { data: videoList, error: errorVideoList } = await supabase.storage
    .from(bucket_d_id_videos)
    .list(userId + "/", { search: "video_profile_" + userId });

  console.log(videoList);

  var video_url = null;
  if (videoList && videoList.length > 0) {
    const { data: dataVideo } = supabase.storage
      .from(bucket_d_id_videos)
      .getPublicUrl("/" + userId + "/" + videoList[0].name);

    video_url = dataVideo.publicUrl;
  }

  return video_url;
}

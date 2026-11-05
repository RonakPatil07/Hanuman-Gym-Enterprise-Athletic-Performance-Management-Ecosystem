/**
 * Copy values into shared/cloud-config.js (or replace null with this object).
 * Website admin data syncs to Supabase Postgres (table gym_cloud_events) — not Supabase Storage.
 *
 * 1. supabase.com → new project → SQL Editor → run repo file supabase/schema.sql
 * 2. Project Settings → API → Project URL + anon public key
 *
 * Do not commit real keys to a public repository.
 */
window.GYM_CLOUD_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_ANON_KEY",
};

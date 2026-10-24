// Vercel Serverless Function: Supabase Keep-Alive
// Triggered on a schedule by Vercel Cron (or external ping services)
// to prevent Supabase Free Tier projects from pausing after 7 days of inactivity.

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(400).json({
      success: false,
      error: 'Supabase credentials missing in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).'
    });
  }

  try {
    const targetUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/attendance_records?select=id&limit=1`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    const status = response.status;
    const ok = response.ok;

    return res.status(200).json({
      success: ok,
      statusCode: status,
      message: ok 
        ? 'Supabase keep-alive ping successful. Inactivity timer reset.' 
        : `Supabase ping responded with status ${status}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}

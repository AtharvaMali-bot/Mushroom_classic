// Application configuration

const AppConfig = {
  supabase: {
    url: "https://rdgibagwcenwthrcsllp.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2liYWd3Y2Vud3RocmNzbGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDE5MTIsImV4cCI6MjA3NjY3NzkxMn0.d5CthwkuclqKk1z7gjwsgaP0P53q2dFya5k5fRNAxAY",
  },
  // For production, use environment variables:
  // url: import.meta.env.VITE_SUPABASE_URL,
  // anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
};

window.AppConfig = AppConfig;

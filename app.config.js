// Expo config – delegates to config/expo for organization
const appJson = require('./config/expo/app.json');

const config = {
  ...appJson,
  expo: {
    ...appJson.expo,
    owner: 'seungjihan',
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: 'eefb636f-5407-4cc3-ab32-4e202a2f2d8f',
      },
      // Local .env (gitignored) overrides app.json — use for new Supabase anon keys
      ...(process.env.EXPO_PUBLIC_SUPABASE_URL && {
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      }),
      ...(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY && {
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      }),
    },
  },
};

// When building for demo (served from /app/), set baseUrl so routing & assets work
if (process.env.DEMO_BUILD === 'true') {
  config.expo.experiments = config.expo.experiments || {};
  config.expo.experiments.baseUrl = '/app';
}

module.exports = config;

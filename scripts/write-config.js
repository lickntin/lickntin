const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

const out = `window.SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)}
};
`;

const target = path.join(__dirname, '..', 'js', 'supabase-config.js');
fs.writeFileSync(target, out, 'utf8');
console.log('Wrote', target, url ? '(URL set)' : '(URL empty — set Netlify env vars)');

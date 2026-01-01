import { Context } from 'https://edge.netlify.com';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Use environment variables with fallback for local development
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://hbsrqbphrugdghyizwcc.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhic3JxYnBocnVnZGdoeWl6d2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMzAzNzgsImV4cCI6MjA4MjgwNjM3OH0.EWWyrwo09lpxa6xXJicywnVvJznXGnbNJKEBGQ7Y1Nc';

// Social media crawler user agents
const CRAWLER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discord',
  'Googlebot',
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_AGENTS.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()));
}

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/^\/view\/([^\/]+)$/);

  // Only process /view/[token] routes
  if (!pathMatch) {
    return context.next();
  }

  const token = pathMatch[1];
  const userAgent = request.headers.get('user-agent');

  // Only intercept for crawlers
  if (!isCrawler(userAgent)) {
    return context.next();
  }

  // Fetch the eulogy from Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: eulogy, error } = await supabase
    .from('eulogies')
    .select(`
      id,
      recipient_name,
      content,
      is_anonymous,
      profiles:author_id (
        display_name
      )
    `)
    .eq('share_token', token)
    .single();

  if (error || !eulogy) {
    // Return default OG tags if eulogy not found
    return new Response(getDefaultHtml(), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const authorName = eulogy.is_anonymous
    ? 'Someone'
    : (eulogy.profiles?.display_name || 'Someone');

  const title = `A message for ${eulogy.recipient_name} | Living Eulogy`;
  const ogDescription = `${authorName} wrote something meaningful for ${eulogy.recipient_name}.`;

  // Truncate content for preview (max 200 chars)
  const contentPreview = eulogy.content.length > 200
    ? eulogy.content.substring(0, 197) + '...'
    : eulogy.content;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>

  <!-- Primary Meta Tags -->
  <meta name="title" content="${escapeHtml(title)}">
  <meta name="description" content="${escapeHtml(ogDescription)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url.href}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:site_name" content="Living Eulogy">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary">
  <meta property="twitter:url" content="${url.href}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(ogDescription)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(ogDescription)}</p>
  <p>"${escapeHtml(contentPreview)}"</p>
  <a href="${url.href}">Read the full message on Living Eulogy</a>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function getDefaultHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Living Eulogy</title>
  <meta name="description" content="Share what matters, while it matters.">
  <meta property="og:title" content="Living Eulogy">
  <meta property="og:description" content="Share what matters, while it matters.">
  <meta property="og:site_name" content="Living Eulogy">
</head>
<body>
  <h1>Living Eulogy</h1>
  <p>Share what matters, while it matters.</p>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const config = {
  path: '/view/*',
};

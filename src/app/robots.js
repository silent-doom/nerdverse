/**
 * Next.js Metadata Route: robots.txt
 * Configures search engine and AI Answer Engine crawlers.
 * Allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and web indexers.
 */

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nerdverse-alpha.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      // Explicitly grant full crawl access to modern Answer Engines and AI bots
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-Web',
          'PerplexityBot',
          'Google-Extended',
          'Applebot',
          'Applebot-Extended',
          'cohere-ai',
          'Bytespider',
          'CCBot',
          'Diffbot',
          'Meta-ExternalAgent',
        ],
        allow: [
          '/',
          '/concepts',
          '/explore',
          '/about',
          '/community',
          '/llms.txt',
          '/llms-full.txt',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { FAQ_DATA, getFaqSchema } from '@/data/faqs';
import { CONCEPTS } from '@/data/concepts';

describe('AEO & SEO Verification', () => {
  describe('robots.js', () => {
    it('generates compliant robots metadata with allowed AI agents and sitemap', () => {
      const config = robots();
      expect(config).toHaveProperty('rules');
      expect(config).toHaveProperty('sitemap');
      expect(config.sitemap).toBe('https://nerdverse-alpha.vercel.app/sitemap.xml');

      const userAgents = Array.isArray(config.rules)
        ? config.rules.flatMap((r) => (Array.isArray(r.userAgent) ? r.userAgent : [r.userAgent]))
        : [config.rules.userAgent];

      expect(userAgents).toContain('*');
      expect(userAgents).toContain('GPTBot');
      expect(userAgents).toContain('ClaudeBot');
      expect(userAgents).toContain('PerplexityBot');
    });
  });

  describe('sitemap.js', () => {
    it('generates sitemap entries for all core pages and 38 concepts', () => {
      const entries = sitemap();
      expect(Array.isArray(entries)).toBe(true);

      // 5 static core pages + 38 concept detail pages = 43 total
      expect(entries.length).toBe(5 + CONCEPTS.length);

      const urls = entries.map((e) => e.url);
      expect(urls).toContain('https://nerdverse-alpha.vercel.app');
      expect(urls).toContain('https://nerdverse-alpha.vercel.app/concepts');
      expect(urls).toContain('https://nerdverse-alpha.vercel.app/explore');
      expect(urls).toContain('https://nerdverse-alpha.vercel.app/about');
      expect(urls).toContain('https://nerdverse-alpha.vercel.app/community');

      // Check concept detail URLs
      CONCEPTS.forEach((concept) => {
        expect(urls).toContain(`https://nerdverse-alpha.vercel.app/concepts/${concept.slug}`);
      });

      // Verify structure of entries
      entries.forEach((entry) => {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
        expect(entry).toHaveProperty('changeFrequency');
        expect(entry).toHaveProperty('priority');
        expect(entry.priority).toBeGreaterThanOrEqual(0.5);
      });
    });
  });

  describe('FAQ Data & JSON-LD Schema', () => {
    it('has comprehensive FAQ entries with non-empty fields', () => {
      expect(FAQ_DATA.length).toBeGreaterThanOrEqual(8);
      FAQ_DATA.forEach((faq) => {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
        expect(faq.category).toBeTruthy();
        // Zero emojis rule
        expect(faq.question).not.toMatch(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u);
      });
    });

    it('generates valid Schema.org FAQPage structured data', () => {
      const schema = getFaqSchema();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(Array.isArray(schema.mainEntity)).toBe(true);
      expect(schema.mainEntity.length).toBe(FAQ_DATA.length);

      schema.mainEntity.forEach((entity) => {
        expect(entity['@type']).toBe('Question');
        expect(entity.name).toBeTruthy();
        expect(entity.acceptedAnswer['@type']).toBe('Answer');
        expect(entity.acceptedAnswer.text).toBeTruthy();
      });
    });
  });

  describe('llms.txt and llms-full.txt', () => {
    it('serves valid llms.txt at project root public folder', () => {
      const llmsPath = path.resolve(process.cwd(), 'public/llms.txt');
      expect(fs.existsSync(llmsPath)).toBe(true);
      const content = fs.readFileSync(llmsPath, 'utf8');
      expect(content).toContain('# NerdVerse');
      expect(content).toContain('https://nerdverse-alpha.vercel.app');
      expect(content).toContain('Galperin');
      expect(content).toContain('llms-full.txt');
    });

    it('serves valid llms-full.txt with extensive mathematical corpus', () => {
      const llmsFullPath = path.resolve(process.cwd(), 'public/llms-full.txt');
      expect(fs.existsSync(llmsFullPath)).toBe(true);
      const content = fs.readFileSync(llmsFullPath, 'utf8');
      expect(content).toContain('# NerdVerse Complete Knowledge Corpus');
      expect(content).toContain('Galperin');
      expect(content).toContain('Euler');
    });
  });
});

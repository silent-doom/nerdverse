import { describe, it, expect } from 'vitest';
import {
  concepts,
  getConceptBySlug,
  getConceptsByCategory,
  getFeaturedConcepts,
  getAllPublishedConcepts,
  getRelatedConcepts,
} from '@/data/concepts';

describe('Concept Data Layer', () => {
  describe('concepts array', () => {
    it('has at least 5 concepts', () => {
      expect(concepts.length).toBeGreaterThanOrEqual(5);
    });

    it('every concept has required fields', () => {
      const requiredFields = [
        'id', 'title', 'slug', 'category', 'difficulty',
        'readTime', 'summary', 'interactiveType', 'content',
        'sources', 'facts', 'relatedSlugs', 'published',
      ];

      concepts.forEach((concept) => {
        requiredFields.forEach((field) => {
          expect(concept).toHaveProperty(field);
        });
      });
    });

    it('every concept has unique slug', () => {
      const slugs = concepts.map((c) => c.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('every concept has unique id', () => {
      const ids = concepts.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('difficulty is one of beginner/intermediate/advanced', () => {
      const valid = ['beginner', 'intermediate', 'advanced'];
      concepts.forEach((c) => {
        expect(valid).toContain(c.difficulty);
      });
    });

    it('every concept has at least 2 sources', () => {
      concepts.forEach((c) => {
        expect(c.sources.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('every concept has at least 2 facts', () => {
      concepts.forEach((c) => {
        expect(c.facts.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('getConceptBySlug', () => {
    it('returns concept for valid slug', () => {
      const result = getConceptBySlug('murphys-law');
      expect(result).toBeDefined();
      expect(result.title).toBe("Murphy's Law");
    });

    it('returns undefined for invalid slug', () => {
      expect(getConceptBySlug('nonexistent')).toBeUndefined();
    });
  });

  describe('getConceptsByCategory', () => {
    it('returns concepts for a valid category', () => {
      const physics = getConceptsByCategory('physics');
      expect(physics.length).toBeGreaterThan(0);
      physics.forEach((c) => {
        expect(c.category).toBe('physics');
      });
    });

    it('returns empty array for category with no concepts', () => {
      const result = getConceptsByCategory('nonexistent');
      expect(result).toEqual([]);
    });

    it('only returns published concepts', () => {
      const allByCategory = getConceptsByCategory('physics');
      allByCategory.forEach((c) => {
        expect(c.published).toBe(true);
      });
    });
  });

  describe('getFeaturedConcepts', () => {
    it('returns only featured and published concepts', () => {
      const featured = getFeaturedConcepts();
      expect(featured.length).toBeGreaterThan(0);
      featured.forEach((c) => {
        expect(c.featured).toBe(true);
        expect(c.published).toBe(true);
      });
    });
  });

  describe('getAllPublishedConcepts', () => {
    it('returns only published concepts', () => {
      const published = getAllPublishedConcepts();
      published.forEach((c) => {
        expect(c.published).toBe(true);
      });
    });

    it('returns all 5 MVP concepts', () => {
      const published = getAllPublishedConcepts();
      expect(published.length).toBe(5);
    });
  });

  describe('getRelatedConcepts', () => {
    it('returns related concepts for valid slug', () => {
      const related = getRelatedConcepts('murphys-law');
      expect(related.length).toBeGreaterThan(0);
      related.forEach((c) => {
        expect(c).toHaveProperty('slug');
        expect(c).toHaveProperty('title');
      });
    });

    it('returns empty array for invalid slug', () => {
      expect(getRelatedConcepts('nonexistent')).toEqual([]);
    });

    it('does not include the concept itself', () => {
      const related = getRelatedConcepts('murphys-law');
      related.forEach((c) => {
        expect(c.slug).not.toBe('murphys-law');
      });
    });
  });
});

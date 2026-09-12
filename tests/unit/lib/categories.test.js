import { describe, it, expect } from 'vitest';
import {
  CATEGORIES,
  getCategoryById,
  getCategoryBySlug,
} from '@/lib/constants/categories';

describe('Categories', () => {
  it('has 7 categories', () => {
    expect(CATEGORIES).toHaveLength(7);
  });

  it('every category has required fields', () => {
    const required = ['id', 'name', 'slug', 'icon', 'color', 'description'];
    CATEGORIES.forEach((cat) => {
      required.forEach((field) => {
        expect(cat).toHaveProperty(field);
        expect(cat[field]).toBeTruthy();
      });
    });
  });

  it('every category has unique id', () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every category has unique slug', () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every category color is a valid hex color', () => {
    CATEGORIES.forEach((cat) => {
      expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('getCategoryById', () => {
    it('returns category for valid id', () => {
      const result = getCategoryById('physics');
      expect(result).toBeDefined();
      expect(result.name).toBe('Physics & Cosmology');
    });

    it('returns undefined for invalid id', () => {
      expect(getCategoryById('invalid')).toBeUndefined();
    });
  });

  describe('getCategoryBySlug', () => {
    it('returns category for valid slug', () => {
      const result = getCategoryBySlug('math');
      expect(result).toBeDefined();
      expect(result.name).toBe('Mathematics');
    });

    it('returns undefined for invalid slug', () => {
      expect(getCategoryBySlug('nope')).toBeUndefined();
    });
  });
});

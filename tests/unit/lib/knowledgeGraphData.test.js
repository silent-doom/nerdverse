import { describe, it, expect } from 'vitest';
import {
  DOMAIN_CLUSTERS,
  GRAPH_NODES,
  GRAPH_LINKS,
  getNodeById,
  getConnectedNodes,
  getNodesByDomain,
  searchGraphNodes,
} from '@/data/knowledgeGraphData';

describe('Knowledge Graph Data Layer', () => {
  describe('DOMAIN_CLUSTERS', () => {
    it('defines the core intellectual domains', () => {
      const domainKeys = Object.keys(DOMAIN_CLUSTERS);
      expect(domainKeys).toContain('physics');
      expect(domainKeys).toContain('math');
      expect(domainKeys).toContain('philosophy');
      expect(domainKeys).toContain('psychology');
      expect(domainKeys).toContain('cs');
      expect(domainKeys).toContain('economics');
      expect(domainKeys).toContain('biology');
    });

    it('each domain has 3D center coordinates, radius, and hex color', () => {
      Object.values(DOMAIN_CLUSTERS).forEach((cluster) => {
        expect(cluster).toHaveProperty('id');
        expect(cluster).toHaveProperty('name');
        expect(cluster.center).toHaveLength(3);
        expect(typeof cluster.radius).toBe('number');
        expect(cluster.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('GRAPH_NODES', () => {
    it('contains all 5 primary interactive concepts plus adjacent domain landmarks', () => {
      expect(GRAPH_NODES.length).toBeGreaterThanOrEqual(15);

      const slugs = GRAPH_NODES.map((n) => n.slug);
      expect(slugs).toContain('monty-hall');
      expect(slugs).toContain('schrodingers-cat');
      expect(slugs).toContain('grandfather-paradox');
      expect(slugs).toContain('trolley-problem');
      expect(slugs).toContain('murphys-law');
    });

    it('every node references a valid domain cluster', () => {
      const validDomainIds = Object.keys(DOMAIN_CLUSTERS);
      GRAPH_NODES.forEach((node) => {
        expect(validDomainIds).toContain(node.domain);
        expect(node.coords).toHaveLength(3);
        expect(typeof node.importance).toBe('number');
        expect(node.summary).toBeDefined();
        expect(node.paradoxCore).toBeDefined();
        expect(node.crossDomainBridge).toBeDefined();
      });
    });

    it('all nodes have unique IDs', () => {
      const ids = GRAPH_NODES.map((n) => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('GRAPH_LINKS', () => {
    it('contains rich semantic connections with weights and rationales', () => {
      expect(GRAPH_LINKS.length).toBeGreaterThanOrEqual(15);

      const nodeIds = new Set(GRAPH_NODES.map((n) => n.id));
      GRAPH_LINKS.forEach((link) => {
        expect(nodeIds.has(link.source)).toBe(true);
        expect(nodeIds.has(link.target)).toBe(true);
        expect(link.weight).toBeGreaterThan(0);
        expect(link.weight).toBeLessThanOrEqual(1.0);
        expect(link.rationale).toBeDefined();
        expect(link.label).toBeDefined();
      });
    });
  });

  describe('Accessors & Search', () => {
    it('getNodeById returns node by id or slug', () => {
      const node = getNodeById('monty-hall');
      expect(node).toBeDefined();
      expect(node.title).toBe('Monty Hall Problem');
      expect(node.hasInteractiveLab).toBe(true);
    });

    it('getConnectedNodes returns ordered connections with rationales', () => {
      const conns = getConnectedNodes('monty-hall');
      expect(conns.length).toBeGreaterThan(0);
      expect(conns[0]).toHaveProperty('node');
      expect(conns[0]).toHaveProperty('weight');
      expect(conns[0]).toHaveProperty('rationale');

      // Verify descending order of weight
      for (let i = 0; i < conns.length - 1; i++) {
        expect(conns[i].weight).toBeGreaterThanOrEqual(conns[i + 1].weight);
      }
    });

    it('getNodesByDomain filters concepts by discipline', () => {
      const physicsNodes = getNodesByDomain('physics');
      expect(physicsNodes.length).toBeGreaterThan(0);
      physicsNodes.forEach((n) => expect(n.domain).toBe('physics'));

      const allNodes = getNodesByDomain('all');
      expect(allNodes.length).toBe(GRAPH_NODES.length);
    });

    it('searchGraphNodes finds matching concepts by query', () => {
      const results = searchGraphNodes('quantum');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((n) => n.slug === 'schrodingers-cat')).toBe(true);
    });
  });
});

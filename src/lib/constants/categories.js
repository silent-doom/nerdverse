/**
 * Category definitions with unified Scholarly Amber & Obsidian accent.
 */
export const CATEGORIES = [
  {
    id: 'physics',
    name: 'Physics & Cosmology',
    slug: 'physics',
    icon: 'atom',
    iconName: 'atom',
    color: '#E5A93C',
    description: 'Quantum mechanics, relativity, astrophysics, and spacetime.',
  },
  {
    id: 'math',
    name: 'Mathematics',
    slug: 'math',
    icon: 'math',
    iconName: 'math',
    color: '#E5A93C',
    description: 'Probability paradoxes, game theory, number theory, and topology.',
  },
  {
    id: 'philosophy',
    name: 'Philosophy & Ethics',
    slug: 'philosophy',
    icon: 'compass',
    iconName: 'compass',
    color: '#E5A93C',
    description: 'Thought experiments, metaphysics, epistemology, and moral dilemmas.',
  },
  {
    id: 'psychology',
    name: 'Psychology & Mind',
    slug: 'psychology',
    icon: 'brain',
    iconName: 'brain',
    color: '#E5A93C',
    description: 'Cognitive biases, perception, consciousness, and behavioral economics.',
  },
  {
    id: 'cs',
    name: 'Computer Science',
    slug: 'cs',
    icon: 'code',
    iconName: 'code',
    color: '#E5A93C',
    description: 'Algorithms, complexity theory, cryptography, and computation.',
  },
  {
    id: 'biology',
    name: 'Biology & Evolution',
    slug: 'biology',
    icon: 'dna',
    iconName: 'dna',
    color: '#E5A93C',
    description: 'Evolutionary theory, genetics, neuroscience, and ecology.',
  },
  {
    id: 'economics',
    name: 'Economics & Systems',
    slug: 'economics',
    icon: 'chart',
    iconName: 'chart',
    color: '#E5A93C',
    description: 'Market dynamics, incentive structures, and complex systems.',
  },
];

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

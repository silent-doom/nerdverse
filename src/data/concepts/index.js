/**
 * Static concept data for the MVP.
 * Each concept includes content, metadata, and the interactive component type.
 */

export const concepts = [
  {
    id: '1',
    title: "Murphy's Law",
    slug: 'murphys-law',
    category: 'psychology',
    difficulty: 'beginner',
    readTime: 5,
    summary: 'Anything that can go wrong will go wrong — but why does it feel that way? Explore the probability behind Murphy\'s famous adage.',
    interactiveType: 'MurphysLaw',
    content: `## What is Murphy's Law?

"Anything that can go wrong will go wrong." This famous adage, attributed to aerospace engineer Edward Murphy, has become one of the most widely cited "laws" in popular culture.

But is it really a law of nature, or just a cognitive bias? The answer lies somewhere in between — and it's more fascinating than you might think.

## The Origin Story

In 1949, Captain Edward Murphy was working on Project MQ-981 at Edwards Air Force Base — a study of the effects of rapid deceleration on the human body. When a technician wired a set of sensors incorrectly, Murphy reportedly said: *"If there's any way to do it wrong, he'll find it."*

The project manager, George Nichols, called this "Murphy's Law" at a press conference, and the phrase entered the public lexicon.

## The Mathematics Behind It

Murphy's Law isn't magic — it's **probability theory** in disguise. Consider:

- If something has a 1% chance of going wrong on any given day
- Over 100 days, the probability of it going wrong **at least once** is: 1 - (0.99)^100 ≈ **63.4%**
- Over a year (365 days): 1 - (0.99)^365 ≈ **97.4%**

Given enough time and enough variables, unlikely events become near-certainties. This is the mathematical backbone of Murphy's Law.

## Why It *Feels* True

**Confirmation bias** amplifies Murphy's Law. We remember the toast that fell butter-side down but forget the hundred times it didn't. Our brains are wired to notice and remember negative outcomes.

## Key Takeaways

- Murphy's Law is a combination of probability theory and cognitive bias
- Given enough trials, even unlikely events become probable
- Our memory disproportionately records negative outcomes
- Understanding this helps us plan better — if something can fail, design for that failure`,
    sources: [
      { title: 'The Origin of Murphy\'s Law', url: 'https://www.history.com/articles/murphys-law' },
      { title: 'Probability Theory Basics', url: 'https://www.khanacademy.org/math/probability' },
      { title: 'Confirmation Bias', url: 'https://en.wikipedia.org/wiki/Confirmation_bias' },
    ],
    facts: [
      "The original Murphy's Law was about a specific rocket sled test at Edwards Air Force Base in 1949.",
      "Mathematically, if an event has a 1% daily chance, it's 97.4% likely to happen within a year.",
      "The British version is called Sod's Law: 'If something can go wrong, it will — at the worst possible time.'",
      "Engineers use Murphy's Law as a design principle: design for failure, because it will happen.",
    ],
    relatedSlugs: ['monty-hall', 'trolley-problem', 'dunning-kruger'],
    published: true,
    featured: true,
  },
  {
    id: '2',
    title: 'Grandfather Paradox',
    slug: 'grandfather-paradox',
    category: 'physics',
    difficulty: 'intermediate',
    readTime: 7,
    summary: 'What happens if you travel back in time and prevent your own birth? Explore the paradox that challenges the very idea of time travel.',
    interactiveType: 'GrandfatherParadox',
    content: `## The Grandfather Paradox

Imagine you build a time machine and travel to the past — before your grandfather met your grandmother. If you prevent them from meeting, your parent is never born, and neither are you. But if you were never born, who traveled back in time?

This is the **Grandfather Paradox**, one of the most famous thought experiments in physics and philosophy.

## Why It Matters

The paradox isn't just a fun puzzle — it strikes at the heart of whether **backwards time travel** is physically possible. If it creates logical contradictions, does that mean the laws of physics must prevent it?

## Resolution Theories

### 1. Novikov Self-Consistency Principle
Events must be self-consistent. If you travel back, something will always prevent you from changing the past. The universe "conspires" to maintain consistency.

### 2. Many-Worlds Interpretation
When you change the past, you create a **new branch** of the timeline. Your original timeline continues unchanged — you just end up in a different one.

### 3. Timeline Protection Conjecture (Hawking)
Stephen Hawking proposed that the laws of physics may inherently prevent backwards time travel, making the paradox moot.

## Key Takeaways

- The paradox reveals potential contradictions in unrestricted time travel
- Multiple resolution theories exist, each with different implications
- It connects to fundamental questions about causality and free will`,
    sources: [
      { title: 'Grandfather Paradox - Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/time-travel/' },
      { title: 'Novikov Self-Consistency Principle', url: 'https://en.wikipedia.org/wiki/Novikov_self-consistency_principle' },
      { title: 'Chronology Protection Conjecture', url: 'https://en.wikipedia.org/wiki/Chronology_protection_conjecture' },
    ],
    facts: [
      "René Barjavel first described this paradox in his 1943 novel 'Le Voyageur Imprudent'.",
      "Stephen Hawking once threw a party for time travelers — invitation sent after the party. Nobody came.",
      "The Novikov principle says the probability of events that cause paradoxes is zero.",
    ],
    relatedSlugs: ['murphys-law', 'trolley-problem', 'schrodingers-cat'],
    published: true,
    featured: true,
  },
  {
    id: '3',
    title: "Schrödinger's Cat",
    slug: 'schrodingers-cat',
    category: 'physics',
    difficulty: 'intermediate',
    readTime: 6,
    summary: 'A cat that is both alive and dead at the same time? Dive into quantum superposition through the most famous thought experiment in physics.',
    interactiveType: 'SchrodingersCat',
    content: `## The Thought Experiment

In 1935, physicist Erwin Schrödinger proposed a thought experiment: A cat is placed in a sealed box with a radioactive atom, a Geiger counter, and a vial of poison. If the atom decays, the Geiger counter triggers the vial, killing the cat.

According to quantum mechanics, until observed, the atom exists in a **superposition** of decayed and not-decayed states. By extension, the cat is simultaneously alive and dead.

## Superposition Explained

Quantum superposition means a particle exists in all possible states simultaneously until measured. It's not that we don't *know* which state it's in — it genuinely occupies all states at once.

## The Measurement Problem

When we open the box and observe the cat, the superposition "collapses" into one definite state. This is known as the **measurement problem** — one of the deepest unsolved questions in physics.

## Key Takeaways

- Schrödinger designed the experiment to show the absurdity of quantum rules at macro scale
- Superposition is real at the quantum level but doesn't apply to cats
- The measurement problem remains one of physics' biggest open questions`,
    sources: [
      { title: 'Schrödinger\'s Cat - Stanford Encyclopedia', url: 'https://plato.stanford.edu/entries/qt-measurement/' },
      { title: 'Quantum Superposition', url: 'https://en.wikipedia.org/wiki/Quantum_superposition' },
    ],
    facts: [
      "Schrödinger created this thought experiment to criticize the Copenhagen interpretation, not to support it.",
      "The cat was never meant to be a real experiment — it was designed to show how absurd quantum rules are at macro scale.",
      "In the Many-Worlds interpretation, the cat is alive in one universe and dead in another.",
    ],
    relatedSlugs: ['grandfather-paradox', 'monty-hall'],
    published: true,
    featured: true,
  },
  {
    id: '4',
    title: 'Trolley Problem',
    slug: 'trolley-problem',
    category: 'philosophy',
    difficulty: 'beginner',
    readTime: 5,
    summary: 'Would you sacrifice one person to save five? The ethical dilemma that divides philosophers and defines our moral intuitions.',
    interactiveType: 'TrolleyProblem',
    content: `## The Dilemma

A runaway trolley is heading toward five people tied to the tracks. You stand next to a lever that can divert the trolley to a side track — but one person is tied to that track. Do you pull the lever?

## Why It Matters

First posed by philosopher Philippa Foot in 1967, the Trolley Problem isn't about trolleys — it's about the foundations of moral reasoning.

## The Ethical Frameworks

### Utilitarianism
Pull the lever. 5 lives > 1 life. The morally right action maximizes total well-being.

### Deontology (Kant)
Don't pull it. Using someone as a means to an end violates their rights, regardless of outcome.

### Virtue Ethics
What would a virtuous person do? The answer depends on character, not calculation.

## The Fat Man Variant

Instead of a lever, you're on a bridge. A large person stands next to you. If you push them onto the tracks, their body will stop the trolley, saving five. Most people who would pull the lever won't push the person — revealing that our moral intuitions aren't purely utilitarian.

## Key Takeaways

- The Trolley Problem tests our moral intuitions against ethical frameworks
- Most people switch but won't push — showing moral reasoning isn't purely outcome-based
- It's directly relevant to autonomous vehicle programming and AI ethics`,
    sources: [
      { title: 'Philippa Foot\'s Original Paper', url: 'https://en.wikipedia.org/wiki/Trolley_problem' },
      { title: 'Moral Machine Experiment', url: 'https://www.nature.com/articles/s41586-018-0637-6' },
    ],
    facts: [
      "Philippa Foot originally posed this problem in 1967, but Judith Thomson made it famous with the 'fat man' variant.",
      "MIT's Moral Machine project collected 40 million decisions from people across 233 countries.",
      "Self-driving car manufacturers must program trolley-problem-like decisions into their AI.",
    ],
    relatedSlugs: ['murphys-law', 'grandfather-paradox'],
    published: true,
    featured: false,
  },
  {
    id: '5',
    title: 'Monty Hall Problem',
    slug: 'monty-hall',
    category: 'math',
    difficulty: 'beginner',
    readTime: 5,
    summary: 'Should you switch doors? The probability puzzle that stumped thousands of PhD holders — now with a playable simulation.',
    interactiveType: 'MontyHall',
    content: `## The Setup

You're on a game show. Three doors: behind one is a car, behind the others are goats. You pick a door. The host, who knows what's behind each door, opens another door revealing a goat. Should you switch to the remaining door?

## The Answer

**Yes, always switch.** Switching wins 2/3 of the time. Staying wins only 1/3.

## Why It's Counterintuitive

Most people think it's 50/50 after a door is opened. But your initial choice had a 1/3 chance of being right. That means there's a 2/3 chance the car is behind one of the other doors. When the host eliminates one wrong door, all 2/3 probability transfers to the remaining door.

## The Math

- P(car behind your door) = 1/3
- P(car behind other doors) = 2/3
- Host opens a losing door → remaining door inherits the 2/3

## Key Takeaways

- Always switch — it doubles your winning probability
- Our intuition about probability is often wrong
- The key insight: the host's action gives you information`,
    sources: [
      { title: 'Monty Hall Problem - Math Explanation', url: 'https://en.wikipedia.org/wiki/Monty_Hall_problem' },
      { title: 'vos Savant\'s Column', url: 'https://web.archive.org/web/20130121183432/http://marilynvossavant.com/game-show-problem/' },
    ],
    facts: [
      "When Marilyn vos Savant published the correct answer in 1990, she received 10,000 letters disagreeing — including nearly 1,000 from PhD holders.",
      "The problem is named after Monty Hall, host of the game show 'Let's Make a Deal'.",
      "Paul Erdős, one of the greatest mathematicians ever, refused to believe the answer until shown a computer simulation.",
    ],
    relatedSlugs: ['murphys-law', 'schrodingers-cat'],
    published: true,
    featured: true,
  },
];

export function getConceptBySlug(slug) {
  return concepts.find((c) => c.slug === slug);
}

export function getConceptsByCategory(categoryId) {
  return concepts.filter((c) => c.category === categoryId && c.published);
}

export function getFeaturedConcepts() {
  return concepts.filter((c) => c.featured && c.published);
}

export function getAllPublishedConcepts() {
  return concepts.filter((c) => c.published);
}

export function getRelatedConcepts(slug) {
  const concept = getConceptBySlug(slug);
  if (!concept) return [];
  return concept.relatedSlugs
    .map((s) => getConceptBySlug(s))
    .filter(Boolean);
}

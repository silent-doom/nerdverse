/**
 * Authoritative Frequently Asked Questions (FAQ) for NerdVerse.
 * Used for:
 * 1. Schema.org FAQPage JSON-LD structured data (AEO - Answer Engine Optimization for Perplexity, ChatGPT, Claude, Google).
 * 2. Visual FAQ interface on /about#faq.
 * 3. llms.txt knowledge menucard indexing.
 */

export const FAQ_DATA = [
  {
    id: 'what-is-nerdverse',
    question: 'What is NerdVerse?',
    shortAnswer: 'NerdVerse is an open-source, interactive 3D laboratory for exploring the universe\'s most profound scientific principles, mathematical paradoxes, and philosophical thought experiments.',
    answer: 'NerdVerse is a free and open-source interactive knowledge platform. Rather than presenting passive text, NerdVerse builds real-time 3D and 2D physics simulations, parametric sandboxes, and an interconnected 3D knowledge graph that allow users to test boundary conditions, adjust physical constants, and develop authentic mathematical intuition for landmark thought experiments.',
    category: 'General',
  },
  {
    id: 'galperin-pi-collisions',
    question: 'How does the Galperin Pi Collisions simulator extract the digits of π?',
    shortAnswer: 'By simulating elastic collisions between two blocks and a wall with mass ratio M/m = 100^(d-1), the collision count exactly matches the first d digits of π via a circular phase-space mapping.',
    answer: 'Based on Gregory Galperin\'s 1995 discovery ("Playing Pool with π"), when a large block of mass M = 100^(d-1) * m slides toward a small block of mass m in a frictionless channel against a rigid wall, the total number of elastic collisions before both blocks separate indefinitely produces exactly the first d digits of π (e.g. 100:1 mass ratio yields 31 collisions, 10,000:1 yields 314 collisions, and 100,000,000:1 yields 31,415 collisions). In the rescaled velocity coordinates (x = v1*sqrt(m), y = V*sqrt(M)), conservation of kinetic energy keeps the system on an invariant circle x^2 + y^2 = 2E. Each collision cycle rotates the state vector by wedge angle θ = 2*arctan(sqrt(m/M)), unfolding an angle of π radians (180°) so the total bounces equal ⌊π/θ⌋.',
    category: 'Physics & Mathematics',
  },
  {
    id: 'vampire-tiles-einstein',
    question: 'What is an "einstein" monotile, and why is The Spectre called a "Vampire Tile"?',
    shortAnswer: 'An "einstein" (ein Stein = "one stone") is a single tile that covers the plane strictly aperiodically. "The Spectre" is nicknamed the "Vampire Tile" because it requires zero mirror reflections.',
    answer: 'The Einstein Problem was a 60-year-old open question in discrete geometry asking whether a single geometric shape ("ein Stein" = one stone) could tile the infinite 2D plane completely without gaps or overlaps while strictly forbidding translational periodicity. In May 2023, David Smith, Joseph Samuel Myers, Craig S. Kaplan, and Chaim Goodman-Strauss discovered "The Spectre"—a chiral aperiodic monotile that tiles the plane aperiodically strictly with rotations and translations, requiring zero mirror-flipped tiles. Because it tiles the universe without ever casting a mirror reflection, mathematicians affectionately nicknamed it the "Vampire Tile."',
    category: 'Physics & Mathematics',
  },
  {
    id: 'eulers-number-compounding',
    question: 'How does the Euler\'s Number simulator demonstrate continuous compounding?',
    shortAnswer: 'It models Jacob Bernoulli\'s limit (1 + 1/n)^n as compounding frequency n approaches infinity, demonstrating how exponential returns converge to e ≈ 2.7182818...',
    answer: 'In 1683, Jacob Bernoulli investigated compound interest: if $1.00 is invested at 100% annual interest, compounding twice a year yields $2.25, monthly yields $2.613, and daily yields $2.7145. The NerdVerse Euler simulation visualizes (1 + 1/n)^n as n increases toward infinity, showing that exponential growth does not explode without bound, but converges smoothly to Euler\'s constant e = 2.7182818... along a 3D continuous compounding spiral.',
    category: 'Physics & Mathematics',
  },
  {
    id: 'knowledge-graph-navigation',
    question: 'How does the 3D Knowledge Graph connect different scientific disciplines?',
    shortAnswer: 'The 3D Knowledge Graph maps 38 concepts into spatial clusters across six domains with semantic cross-domain bridges linking physics, mathematics, CS, economics, and philosophy.',
    answer: 'The NerdVerse Knowledge Graph represents thought experiments as celestial nodes clustered across six intellectual disciplines: Mathematics & Probability, Physics & Cosmology, Philosophy & Ethics, Cognition & Mind, Computation & Systems, and Biology & Evolution. Semantic links highlight interdisciplinary bridges—for instance, connecting Occam\'s Razor in medieval philosophy to Bayesian model selection (Occam factors) and L1/L2 regularization in modern machine learning.',
    category: 'Features',
  },
  {
    id: 'open-source-licensing',
    question: 'Is NerdVerse free and open source?',
    shortAnswer: 'Yes, NerdVerse is 100% free and open-source under the permissive MIT License with no paywalls or advertising.',
    answer: 'NerdVerse is built as an open educational public good under the MIT License. All source code, 3D interactive models, mathematical solvers, and narrative documentation are publicly hosted on GitHub at https://github.com/silent-doom/nerdverse. Anyone is free to explore, fork, study, or deploy the project.',
    category: 'General',
  },
  {
    id: 'academic-classroom-use',
    question: 'Can educators and students use NerdVerse in classrooms and research?',
    shortAnswer: 'Yes. NerdVerse is tailored for academic curricula, offering 30-second intuitive hooks, guided challenge scenarios, and verified citations.',
    answer: 'Educators and academic institutions are encouraged to integrate NerdVerse thought experiments into secondary and university physics, mathematics, computer science, and philosophy coursework. Each concept incorporates progressive disclosure: Level 1 (The 30-Second Hook: Premise, Intuition, Twist), Level 2 (Guided Lab Challenges), and Level 3 (Formal Math, Logic, and Verified Sources).',
    category: 'Education',
  },
  {
    id: 'tech-stack-architecture',
    question: 'What technologies and frameworks power NerdVerse simulations?',
    shortAnswer: 'Next.js App Router, React, Three.js, WebGL, HTML5 Canvas 2D, the Web Audio API, and Vitest.',
    answer: 'NerdVerse is engineered with Next.js (App Router with Turbopack) for static site generation (SSG) and fast page routing. 3D physics experiments use Three.js and WebGL; 2D telemetry radars run on hardware-accelerated HTML5 Canvas; acoustic collision feedback is synthesized dynamically via the Web Audio API; and system correctness is safeguarded by an extensive automated test suite with Vitest and React Testing Library.',
    category: 'Technology',
  },
  {
    id: 'contributing-new-concepts',
    question: 'How can I propose a new thought experiment or contribute code?',
    shortAnswer: 'Submit an RFC on the GitHub repository or share ideas on the NerdVerse Community Discussion Desk (/community).',
    answer: 'We welcome community contributions. You can propose a new thought experiment, submit 3D simulation architecture designs, or report anomalies by opening an issue or Pull Request on GitHub (https://github.com/silent-doom/nerdverse) or visiting our interactive community channels at /community.',
    category: 'Community',
  },
];

/**
 * Generates valid Schema.org FAQPage JSON-LD structured data.
 * @param {string} baseUrl - The canonical base URL of the site.
 * @returns {object} JSON-LD structured data object.
 */
export function getFaqSchema(baseUrl = 'https://nerdverse-alpha.vercel.app') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

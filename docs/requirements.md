# 📋 NerdVerse — Project Requirements

> **Project**: NerdVerse — Interactive Knowledge Platform for the Curious Mind
> **Version**: 1.0.0
> **Last Updated**: 2026-09-11
> **Status**: Planning

---

## 1. Product Vision

Build a community-driven, interactive knowledge platform that transforms complex concepts — paradoxes, theories, scientific laws, philosophical ideas — into visually explorable, engaging experiences. A place where curiosity meets interactivity, and where nerds build knowledge together.

**Tagline**: *"Explore the universe, one concept at a time."*

---

## 2. Target Audience

### Primary Users
| Persona | Description | Needs |
|---|---|---|
| **The Curious Explorer** | 16-35, loves learning but hates textbooks | Visual, bite-sized, interactive explanations |
| **The Deep Diver** | 20-45, already knowledgeable, wants depth | Comprehensive content, community discussion, concept connections |
| **The Contributor** | 22-40, educators/enthusiasts who want to share | Tools to create explainers, recognition, community |
| **The Student** | 14-25, uses it for supplementary learning | Structured topics, clear explanations, bookmarking |

### Secondary Users
- Educators looking for teaching supplements
- Content creators seeking embeddable interactives
- Researchers exploring concept relationships

---

## 3. Functional Requirements

### FR-01: Interactive Explainer System

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-01.1 | Each concept must have a dedicated page with interactive visual(s) | P0 | Core value prop |
| FR-01.2 | Interactives must respond to user input (click, drag, slider, toggle) | P0 | Not just animations — explorable |
| FR-01.3 | Each explainer has: title, category, difficulty, interactive widget, written explanation, sources | P0 | Structured content |
| FR-01.4 | Explainers support multiple visualization types: 2D canvas, 3D WebGL, SVG, data viz, simulations | P0 | Different concepts need different approaches |
| FR-01.5 | Each explainer has a "Try it yourself" or "Playground" section | P1 | Hands-on experimentation |
| FR-01.6 | Explainers can embed code snippets with live preview | P2 | For CS/math concepts |
| FR-01.7 | Each explainer shows estimated reading/exploration time | P2 | UX nicety |
| FR-01.8 | Explainers support step-by-step guided walkthroughs | P1 | For complex concepts |

### FR-02: Content Organization & Discovery

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-02.1 | Topics organized into categories (Physics, Math, Philosophy, Psychology, CS, Biology, Economics) | P0 | Primary navigation |
| FR-02.2 | Each topic has tags for cross-category discovery | P0 | e.g., "paradox", "cognitive bias", "quantum" |
| FR-02.3 | Full-text search across all explainers | P0 | Instant search with preview |
| FR-02.4 | "Related concepts" shown on every explainer page | P0 | Drives exploration |
| FR-02.5 | Knowledge graph visualization — interactive concept map | P1 | Visual exploration of connections |
| FR-02.6 | "Rabbit Hole" mode — auto-suggest next concept based on reading history | P1 | Engagement driver |
| FR-02.7 | Difficulty filtering (Beginner / Intermediate / Advanced) | P1 | Accessibility |
| FR-02.8 | "Random concept" button | P2 | Serendipity feature |
| FR-02.9 | Curated collections/playlists (e.g., "10 Mind-Bending Paradoxes") | P1 | Editorial curation |

### FR-03: Community & Social

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-03.1 | User registration and authentication (email + OAuth) | P0 | Foundation for community |
| FR-03.2 | Threaded comments on every explainer | P0 | Core community feature |
| FR-03.3 | Upvote/downvote system on comments | P0 | Quality surfacing |
| FR-03.4 | User profiles with activity history, badges, stats | P1 | Identity & reputation |
| FR-03.5 | "Explain it your way" — users can submit alternative explanations | P1 | Community content |
| FR-03.6 | Discussion forums organized by topic category | P2 | Reddit-like discussions |
| FR-03.7 | Follow users and topics | P2 | Personalized feed |
| FR-03.8 | Share explainers to social media with OG preview cards | P0 | Viral growth |
| FR-03.9 | Report/flag inappropriate content | P0 | Moderation |
| FR-03.10 | @mentions and notifications | P2 | Community engagement |

### FR-04: User Engagement & Gamification

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-04.1 | "Concepts explored" counter on profile | P1 | Progress tracking |
| FR-04.2 | Daily streak system | P2 | Retention mechanic |
| FR-04.3 | Achievement badges (first comment, 10 concepts explored, etc.) | P2 | Recognition |
| FR-04.4 | XP system for reading, commenting, contributing | P2 | Gamification |
| FR-04.5 | Leaderboard for top contributors | P2 | Competition |
| FR-04.6 | Bookmarks / "Save for later" | P1 | Personal library |
| FR-04.7 | Reading history | P1 | Resume exploration |

### FR-05: Content Management

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-05.1 | Admin dashboard for managing explainers | P1 | Content ops |
| FR-05.2 | Markdown + custom component authoring for explainers | P1 | Scalable content creation |
| FR-05.3 | Content versioning and edit history | P2 | Wikipedia-like |
| FR-05.4 | Community submission pipeline with review/approval | P2 | Quality control |
| FR-05.5 | Source citation system — every claim must link to a source | P0 | Credibility |
| FR-05.6 | Content scheduling and drafts | P2 | Editorial workflow |

---

## 4. Non-Functional Requirements

### NFR-01: Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-01.1 | First Contentful Paint (FCP) | < 1.5s |
| NFR-01.2 | Largest Contentful Paint (LCP) | < 2.5s |
| NFR-01.3 | Time to Interactive (TTI) | < 3.5s |
| NFR-01.4 | Interactive widgets load time | < 2s after page load |
| NFR-01.5 | Interactive animations run at | ≥ 60fps |
| NFR-01.6 | Search results return in | < 200ms |
| NFR-01.7 | Page size (initial load) | < 500KB gzipped |

### NFR-02: Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-02.1 | Support concurrent users | 10,000+ |
| NFR-02.2 | Content pages supported | 10,000+ |
| NFR-02.3 | Comments per explainer | 100,000+ |
| NFR-02.4 | Database query response time | < 100ms (p95) |

### NFR-03: Accessibility

| ID | Requirement | Target |
|---|---|---|
| NFR-03.1 | WCAG compliance level | AA |
| NFR-03.2 | Keyboard navigation | Full support |
| NFR-03.3 | Screen reader support | All text content |
| NFR-03.4 | Color contrast ratio | ≥ 4.5:1 |
| NFR-03.5 | Interactive fallbacks | Text alternatives for all visuals |

### NFR-04: SEO

| ID | Requirement | Target |
|---|---|---|
| NFR-04.1 | Server-side rendering | All content pages |
| NFR-04.2 | Structured data (JSON-LD) | All explainer pages |
| NFR-04.3 | Dynamic OG meta tags | Per page |
| NFR-04.4 | Sitemap generation | Automated |
| NFR-04.5 | Core Web Vitals | All green |

### NFR-05: Security

| ID | Requirement | Target |
|---|---|---|
| NFR-05.1 | Authentication | OAuth 2.0 + JWT |
| NFR-05.2 | Input sanitization | All user inputs |
| NFR-05.3 | Rate limiting | API endpoints |
| NFR-05.4 | CSRF protection | All forms |
| NFR-05.5 | Content Security Policy | Strict |
| NFR-05.6 | HTTPS | Enforced |

---

## 5. User Stories

### Epic 1: Exploring Content

```
US-01: As a curious user, I want to browse concepts by category
       so I can discover topics that interest me.

US-02: As a user, I want to interact with visual simulations
       so I can understand complex concepts intuitively.

US-03: As a user, I want to search for specific concepts
       so I can quickly find what I'm looking for.

US-04: As a user, I want to see related concepts on each page
       so I can go down rabbit holes naturally.

US-05: As a user, I want to filter concepts by difficulty
       so I can find content at my knowledge level.
```

### Epic 2: Community Participation

```
US-06: As a user, I want to create an account
       so I can participate in the community.

US-07: As a user, I want to comment on explainers
       so I can ask questions and share insights.

US-08: As a user, I want to upvote helpful comments
       so the best explanations rise to the top.

US-09: As a contributor, I want to submit my own explanations
       so I can share knowledge with the community.

US-10: As a user, I want to share explainers on social media
       so my friends can discover NerdVerse.
```

### Epic 3: Personal Experience

```
US-11: As a user, I want to bookmark concepts
       so I can build a personal reading list.

US-12: As a user, I want to track my exploration history
       so I can see how much I've learned.

US-13: As a user, I want to earn badges
       so I feel recognized for my engagement.

US-14: As a user, I want to see my profile stats
       so I can measure my learning journey.
```

---

## 6. Content Requirements

### Flagship Explainers (MVP)

Each flagship explainer must include:
1. **Hero visual** — eye-catching animated/interactive header
2. **Interactive widget** — the core explorable element
3. **Written explanation** — 800-1500 words, layered (intro → deep dive)
4. **"Did you know?"** — 3-5 surprising facts
5. **Sources** — minimum 3 credible references
6. **Related concepts** — minimum 3 linked concepts

### MVP Concept List

| # | Concept | Category | Interactive Type |
|---|---|---|---|
| 1 | Murphy's Law | Psychology / Philosophy | Probability simulator |
| 2 | Grandfather Paradox | Physics / Time | Timeline manipulator |
| 3 | Schrödinger's Cat | Quantum Physics | Quantum state visualizer |
| 4 | Trolley Problem | Philosophy / Ethics | Decision tree explorer |
| 5 | Prisoner's Dilemma | Game Theory | Strategy simulator |
| 6 | Butterfly Effect | Chaos Theory | Chaotic system visualizer |
| 7 | Dunning-Kruger Effect | Psychology | Self-assessment quiz + graph |
| 8 | Fermi Paradox | Astronomy / Philosophy | Drake equation calculator |
| 9 | Ship of Theseus | Philosophy | Visual part-replacement tool |
| 10 | Monty Hall Problem | Mathematics / Probability | Game simulator with stats |

---

## 7. Technical Constraints

| Constraint | Details |
|---|---|
| **Framework** | Next.js (App Router) — SSR/SSG for SEO, React for interactivity |
| **Styling** | Vanilla CSS with CSS custom properties (design tokens) |
| **Animation** | Framer Motion + Canvas API + GSAP for complex animations |
| **3D** | Three.js / React Three Fiber (only where needed) |
| **Data Viz** | D3.js for charts and graph visualizations |
| **Database** | Supabase (PostgreSQL + Auth + Realtime) |
| **Deployment** | Vercel (optimized for Next.js) |
| **CDN** | Vercel Edge Network |
| **Monitoring** | Vercel Analytics + custom event tracking |
| **Testing** | Vitest + Playwright |

---

## 8. Acceptance Criteria (MVP)

- [ ] Landing page loads in < 2s and communicates the value proposition clearly
- [ ] At least 5 interactive explainers are fully functional
- [ ] Each explainer has working interactive visuals that respond to user input
- [ ] Users can browse concepts by category
- [ ] Search returns relevant results in < 200ms
- [ ] Users can create accounts and log in
- [ ] Users can comment on explainers
- [ ] Comments support upvote/downvote
- [ ] Related concepts are shown on each page
- [ ] All pages are server-side rendered for SEO
- [ ] Site scores 90+ on Lighthouse (Performance, Accessibility, SEO)
- [ ] Mobile responsive across all pages
- [ ] Social sharing with proper OG meta tags

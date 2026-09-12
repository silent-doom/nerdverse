# 🧭 NerdVerse — Project Context (Agent Handoff Document)

> **Purpose**: This document provides complete context for any agent, model, or developer to understand and continue work on this project without searching the codebase.
>
> **Last Updated**: 2026-09-11
> **Project Status**: Phase 0 — Foundation

---

## What Is This Project?

**NerdVerse** is an interactive, community-driven knowledge platform that makes complex concepts (paradoxes, theories, scientific laws, philosophical ideas) visually explorable. Think "Brilliant.org meets Reddit meets Explorable Explanations."

**Core differentiator**: Nobody currently combines **interactive visual explainers** with a **community discussion layer**. Competitors are either interactive-but-solo (Brilliant) or community-driven-but-passive (Reddit).

### Example Use Case
A user discovers the **Grandfather Paradox**. Instead of reading a Wikipedia article, they:
1. See an animated timeline visualization
2. **Interact** with it — drag a time traveler back, make changes, see branching timelines
3. Toggle between resolution theories (Novikov self-consistency, Many Worlds)
4. Read a concise, well-sourced written explanation
5. Join a discussion in the comments
6. Click a related concept → "Butterfly Effect" → continue exploring

---

## Key Documents

| Document | Path | Purpose |
|---|---|---|
| **Requirements** | `docs/requirements.md` | All functional & non-functional requirements, user stories |
| **Phases** | `docs/phases.md` | Phase-by-phase implementation plan with features & success criteria |
| **Architecture** | `docs/architecture.md` | Tech stack, folder structure, data models, API design |
| **This File** | `docs/context.md` | Quick-start context for agents and handoffs |
| **Competitive Analysis** | External artifact | Market analysis and positioning |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | SSR/SSG for SEO, React for interactivity, API routes for backend |
| **Language** | TypeScript | Type safety across the stack |
| **Styling** | Vanilla CSS with CSS Custom Properties | Maximum control, no framework overhead, design token system |
| **Animations** | Framer Motion + GSAP + Canvas API | Framer for UI transitions, GSAP for complex timelines, Canvas for simulations |
| **3D** | Three.js / React Three Fiber | Only where needed (quantum visualizations, etc.) |
| **Data Visualization** | D3.js | Knowledge graph, probability charts, statistical visualizations |
| **Database** | Supabase (PostgreSQL) | Relational data, auth, realtime subscriptions |
| **Auth** | Supabase Auth | OAuth (Google, GitHub), email/password, JWT sessions |
| **File Storage** | Supabase Storage | User avatars, community content images |
| **Deployment** | Vercel | Optimized for Next.js, edge network, preview deployments |
| **Testing** | Vitest + Playwright | Unit/component testing + E2E browser testing |
| **Linting** | ESLint + Prettier | Code quality and consistency |

---

## Design Philosophy

### Visual Identity
- **Theme**: Dark-mode-first, deep space aesthetic
- **Primary palette**: Navy (#0a0e27) → Indigo (#6366f1) gradient
- **Accents**: Neon cyan (#06b6d4), Amber (#f59e0b), Emerald (#10b981)
- **Surfaces**: Glassmorphic panels with `backdrop-filter: blur()` and subtle borders
- **Typography**: Inter (body), Outfit (headings), JetBrains Mono (code)
- **Interactions**: Every element has hover/focus feedback, smooth 200-300ms transitions
- **Animations**: Scroll reveals, page transitions, micro-interactions on all interactive elements

### UX Principles
1. **Exploration over instruction** — let users discover, don't lecture
2. **Interactivity is not optional** — every concept must have something to *play with*
3. **Connected knowledge** — always show where to go next
4. **Community is first-class** — comments and contributions are part of the experience, not bolted on
5. **Mobile is not an afterthought** — interactives must work on touch

---

## Data Model (Core Entities)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Category   │────<│   Concept    │>────│     Tag      │
│              │     │              │     │              │
│ id           │     │ id           │     │ id           │
│ name         │     │ title        │     │ name         │
│ slug         │     │ slug         │     │ slug         │
│ description  │     │ category_id  │     └──────────────┘
│ icon         │     │ difficulty   │
│ color        │     │ read_time    │     ┌──────────────┐
└──────────────┘     │ content_md   │────<│   Comment    │
                     │ interactive_ │     │              │
                     │   type       │     │ id           │
                     │ sources[]    │     │ concept_id   │
                     │ facts[]      │     │ user_id      │
                     │ created_at   │     │ parent_id    │
                     │ updated_at   │     │ body         │
                     │ published    │     │ upvotes      │
                     └──────────────┘     │ downvotes    │
                            │             │ created_at   │
                            │             └──────────────┘
                     ┌──────┴───────┐
                     │  Concept     │     ┌──────────────┐
                     │  Relation    │     │    User      │
                     │              │     │              │
                     │ concept_a_id │     │ id           │
                     │ concept_b_id │     │ email        │
                     │ relation_type│     │ display_name │
                     └──────────────┘     │ avatar_url   │
                                          │ bio          │
                     ┌──────────────┐     │ xp           │
                     │   Bookmark   │     │ level        │
                     │              │     │ badges[]     │
                     │ user_id      │     │ created_at   │
                     │ concept_id   │     └──────────────┘
                     │ created_at   │
                     └──────────────┘     ┌──────────────┐
                                          │    Vote      │
                                          │              │
                                          │ user_id      │
                                          │ comment_id   │
                                          │ value (+1/-1)│
                                          └──────────────┘
```

---

## Folder Structure

```
nerd_website/
├── docs/                          # Project documentation
│   ├── requirements.md
│   ├── phases.md
│   ├── context.md                 # ← YOU ARE HERE
│   └── architecture.md
│
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── layout.js              # Root layout (header, footer, providers)
│   │   ├── page.js                # Landing page
│   │   ├── globals.css            # Global styles + design tokens
│   │   ├── concepts/
│   │   │   ├── page.js            # Concept browser (/concepts)
│   │   │   └── [slug]/
│   │   │       └── page.js        # Individual concept page (/concepts/murphys-law)
│   │   ├── explore/
│   │   │   └── page.js            # Knowledge graph (/explore)
│   │   ├── auth/
│   │   │   ├── login/page.js
│   │   │   └── signup/page.js
│   │   ├── profile/
│   │   │   └── [username]/page.js
│   │   └── api/                   # API routes
│   │       ├── concepts/
│   │       ├── comments/
│   │       ├── votes/
│   │       └── search/
│   │
│   ├── components/
│   │   ├── layout/                # Header, Footer, Navigation, Sidebar
│   │   ├── ui/                    # Design system primitives (Button, Card, Badge, etc.)
│   │   ├── concepts/              # Concept-specific components (ConceptCard, ConceptGrid)
│   │   ├── community/             # Comments, VoteButton, UserAvatar
│   │   ├── interactive/           # Interactive explainer components
│   │   │   ├── MurphysLaw.js
│   │   │   ├── GrandfatherParadox.js
│   │   │   ├── SchrodingersCat.js
│   │   │   ├── TrolleyProblem.js
│   │   │   └── MontyHall.js
│   │   ├── search/                # SearchBar, SearchResults
│   │   └── common/                # Shared utility components
│   │
│   ├── lib/                       # Utility functions and configurations
│   │   ├── supabase/              # Supabase client, auth helpers
│   │   ├── utils/                 # General utilities (formatting, dates, etc.)
│   │   └── hooks/                 # Custom React hooks
│   │
│   ├── data/                      # Static content data
│   │   ├── concepts/              # Concept content files (MDX or JSON)
│   │   ├── categories.js          # Category definitions
│   │   └── tags.js                # Tag definitions
│   │
│   └── styles/                    # Additional style files
│       ├── tokens.css             # Design tokens (colors, spacing, typography)
│       ├── animations.css         # Reusable animation keyframes
│       └── components/            # Component-specific styles
│
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tests/                         # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── next.config.js
├── package.json
├── tsconfig.json (or jsconfig.json)
└── .env.local                     # Environment variables (not committed)
```

---

## Current State & What's Done

| Item | Status |
|---|---|
| Competitive analysis | ✅ Complete |
| Requirements document | ✅ Complete |
| Phase plan | ✅ Complete |
| Context document | ✅ Complete (this file) |
| Architecture document | ✅ Complete |
| Project initialization (Next.js) | ⬜ Not started |
| Design system | ⬜ Not started |
| Landing page | ⬜ Not started |
| First interactive explainer | ⬜ Not started |

---

## Important Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router) | SSR for SEO, React ecosystem, Vercel deployment |
| Styling approach | Vanilla CSS + custom properties | Maximum control, no dependency overhead, design tokens |
| Database | Supabase (PostgreSQL) | Free tier, built-in auth, realtime, familiar SQL |
| Auth strategy | Supabase Auth (OAuth + email) | Integrated with DB, handles JWT, Google/GitHub OAuth |
| Content storage | Static data files + DB | Concepts start as static files (fast SSG), community content in DB |
| Dark mode first | Yes | Target audience prefers dark mode, more visually striking |
| Interactive approach | Custom per-concept | Each concept is unique, no one-size-fits-all template works for MVP |

---

## Conventions & Rules

### Code Style
- **Components**: PascalCase, one component per file
- **Files**: camelCase for utilities, PascalCase for components
- **CSS**: BEM-like naming within component scope
- **Imports**: Absolute imports using `@/` prefix
- **Comments**: JSDoc for functions, inline for complex logic only

### Git
- **Branch naming**: `phase-X/feature-name` (e.g., `phase-1/landing-page`)
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`)
- **PR scope**: One feature per PR

### Content
- **Slugs**: kebab-case (e.g., `murphys-law`, `grandfather-paradox`)
- **Sources**: Every fact must cite a source
- **Difficulty**: One of `beginner`, `intermediate`, `advanced`

---

## How to Continue Work

### For any agent picking this up:

1. **Read the docs** in this order:
   - `context.md` (this file) — understand the project
   - `requirements.md` — understand what to build
   - `phases.md` — understand the sequence
   - `architecture.md` — understand the technical approach

2. **Check current state** in the table above

3. **Follow the phase plan** — don't skip ahead

4. **Key principle**: Every concept page must have a **working interactive visual**. This is the core differentiator. If the interactive doesn't work, the page is not done.

5. **Design quality matters**: This is a "wow the user" product. Bland designs are a failure. Use the design tokens, add animations, make it feel premium.

---

## Environment Setup

```bash
# Clone and install
cd nerd_website
npm install

# Set up environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Key Contacts & Resources

| Resource | Link |
|---|---|
| Next.js Docs | https://nextjs.org/docs |
| Supabase Docs | https://supabase.com/docs |
| Framer Motion | https://www.framer.com/motion/ |
| D3.js | https://d3js.org/ |
| Three.js | https://threejs.org/ |
| GSAP | https://greensock.com/gsap/ |
| Vercel Deployment | https://vercel.com/docs |

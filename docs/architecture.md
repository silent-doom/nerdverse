# 🏗️ NerdVerse — Architecture & Technical Design

> **Project**: NerdVerse — Interactive Knowledge Platform
> **Version**: 1.0.0
> **Last Updated**: 2026-09-11

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│                                                         │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐ │
│  │ Next.js │  │ Interactive│  │  Community │  │ Search │ │
│  │  Pages  │  │  Widgets  │  │   Layer   │  │  Modal │ │
│  │ (SSR)   │  │(Canvas/GL)│  │(Comments) │  │        │ │
│  └────┬────┘  └─────┬─────┘  └─────┬─────┘  └───┬────┘ │
│       │             │              │             │      │
│  ┌────┴─────────────┴──────────────┴─────────────┴────┐ │
│  │              React Component Tree                   │ │
│  │         (App Router / Client Components)            │ │
│  └────────────────────────┬────────────────────────────┘ │
└───────────────────────────┼──────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │  Next.js Server  │
                   │   (API Routes)   │
                   │   + SSR Engine   │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
     ┌────────┴───┐  ┌─────┴──────┐  ┌───┴────────┐
     │  Supabase  │  │  Supabase  │  │  Supabase  │
     │  Database  │  │    Auth    │  │  Storage   │
     │ (PostgreSQL)│  │  (OAuth)  │  │  (Files)   │
     └────────────┘  └────────────┘  └────────────┘
              │
     ┌────────┴────────┐
     │     Vercel       │
     │   Edge Network   │
     │   (CDN + SSR)    │
     └─────────────────┘
```

---

## Tech Stack Details

### Frontend

| Technology | Version | Purpose | Notes |
|---|---|---|---|
| **Next.js** | 15.x | Framework (App Router) | SSR, SSG, ISR, API routes, file-based routing |
| **React** | 19.x | UI library | Comes with Next.js 15 |
| **CSS (Vanilla)** | — | Styling | Custom properties for design tokens, no Tailwind |
| **Framer Motion** | 11.x | UI animations | Page transitions, scroll reveals, component animations |
| **GSAP** | 3.x | Complex animations | Timeline-based animations for interactive explainers |
| **D3.js** | 7.x | Data visualization | Knowledge graph, probability charts, statistical displays |
| **Three.js** | r170+ | 3D graphics | Quantum visualizations, 3D concept illustrations |
| **React Three Fiber** | 8.x | React wrapper for Three.js | Declarative 3D in React |
| **Canvas API** | Native | 2D simulations | Murphy's Law simulator, Butterfly Effect, particle systems |

### Backend

| Technology | Version | Purpose | Notes |
|---|---|---|---|
| **Next.js API Routes** | 15.x | REST API | Server-side logic, data fetching |
| **Supabase** | Latest | BaaS (Backend as a Service) | PostgreSQL, Auth, Realtime, Storage |
| **Supabase Auth** | — | Authentication | Email/password, Google OAuth, GitHub OAuth |
| **PostgreSQL** | 15.x | Database | Via Supabase, with Row Level Security (RLS) |

### DevOps & Tooling

| Technology | Purpose |
|---|---|
| **Vercel** | Hosting, CI/CD, preview deployments |
| **GitHub** | Source control |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vitest** | Unit & component testing |
| **Playwright** | End-to-end testing |
| **Husky + lint-staged** | Pre-commit hooks |

---

## Folder Structure (Detailed)

```
nerd_website/
│
├── docs/                              # 📚 Project documentation
│   ├── requirements.md                #    Functional & non-functional requirements
│   ├── phases.md                      #    Phase-by-phase implementation plan
│   ├── context.md                     #    Agent handoff context document
│   └── architecture.md               #    This file — tech design & architecture
│
├── src/                               # 📦 Source code root
│   │
│   ├── app/                           # 🗂️ Next.js App Router (pages + API)
│   │   ├── layout.js                  #    Root layout — html, body, providers, header/footer
│   │   ├── page.js                    #    Landing page (/)
│   │   ├── page.module.css            #    Landing page styles
│   │   ├── globals.css                #    Global styles + CSS reset
│   │   ├── not-found.js               #    Custom 404 page
│   │   ├── error.js                   #    Custom error boundary
│   │   ├── loading.js                 #    Root loading state
│   │   │
│   │   ├── concepts/                  #    Concept pages
│   │   │   ├── page.js               #    Concept browser (/concepts)
│   │   │   ├── page.module.css        #    Browser page styles
│   │   │   └── [slug]/               #    Dynamic concept pages
│   │   │       ├── page.js           #    Concept detail (/concepts/murphys-law)
│   │   │       └── page.module.css    #    Concept detail styles
│   │   │
│   │   ├── explore/                   #    Knowledge graph
│   │   │   ├── page.js               #    Graph view (/explore)
│   │   │   └── page.module.css
│   │   │
│   │   ├── auth/                      #    Authentication pages
│   │   │   ├── login/
│   │   │   │   ├── page.js
│   │   │   │   └── page.module.css
│   │   │   ├── signup/
│   │   │   │   ├── page.js
│   │   │   │   └── page.module.css
│   │   │   └── callback/
│   │   │       └── route.js           #    OAuth callback handler
│   │   │
│   │   ├── profile/                   #    User profiles
│   │   │   └── [username]/
│   │   │       ├── page.js
│   │   │       └── page.module.css
│   │   │
│   │   ├── settings/                  #    User settings
│   │   │   ├── page.js
│   │   │   └── page.module.css
│   │   │
│   │   ├── library/                   #    Personal bookmarks
│   │   │   ├── page.js
│   │   │   └── page.module.css
│   │   │
│   │   └── api/                       #    API routes (REST)
│   │       ├── concepts/
│   │       │   ├── route.js           #    GET /api/concepts (list, search, filter)
│   │       │   └── [slug]/
│   │       │       └── route.js       #    GET /api/concepts/:slug
│   │       ├── comments/
│   │       │   ├── route.js           #    GET, POST /api/comments
│   │       │   └── [id]/
│   │       │       └── route.js       #    PATCH, DELETE /api/comments/:id
│   │       ├── votes/
│   │       │   └── route.js           #    POST /api/votes
│   │       ├── bookmarks/
│   │       │   └── route.js           #    GET, POST, DELETE /api/bookmarks
│   │       ├── search/
│   │       │   └── route.js           #    GET /api/search?q=
│   │       └── users/
│   │           └── [username]/
│   │               └── route.js       #    GET /api/users/:username
│   │
│   ├── components/                    # 🧩 React components
│   │   │
│   │   ├── layout/                    #    Layout components
│   │   │   ├── Header/
│   │   │   │   ├── Header.js
│   │   │   │   └── Header.module.css
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.js
│   │   │   │   └── Footer.module.css
│   │   │   ├── Navigation/
│   │   │   │   ├── Navigation.js
│   │   │   │   └── Navigation.module.css
│   │   │   ├── MobileMenu/
│   │   │   │   ├── MobileMenu.js
│   │   │   │   └── MobileMenu.module.css
│   │   │   └── Sidebar/
│   │   │       ├── Sidebar.js
│   │   │       └── Sidebar.module.css
│   │   │
│   │   ├── ui/                        #    Design system primitives
│   │   │   ├── Button/
│   │   │   │   ├── Button.js
│   │   │   │   └── Button.module.css
│   │   │   ├── Card/
│   │   │   │   ├── Card.js
│   │   │   │   └── Card.module.css
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.js
│   │   │   │   └── Badge.module.css
│   │   │   ├── Tag/
│   │   │   │   ├── Tag.js
│   │   │   │   └── Tag.module.css
│   │   │   ├── Input/
│   │   │   │   ├── Input.js
│   │   │   │   └── Input.module.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.js
│   │   │   │   └── Modal.module.css
│   │   │   ├── Tooltip/
│   │   │   │   ├── Tooltip.js
│   │   │   │   └── Tooltip.module.css
│   │   │   ├── Skeleton/
│   │   │   │   ├── Skeleton.js
│   │   │   │   └── Skeleton.module.css
│   │   │   ├── Avatar/
│   │   │   │   ├── Avatar.js
│   │   │   │   └── Avatar.module.css
│   │   │   └── ScrollReveal/
│   │   │       ├── ScrollReveal.js
│   │   │       └── ScrollReveal.module.css
│   │   │
│   │   ├── concepts/                  #    Concept-related components
│   │   │   ├── ConceptCard/
│   │   │   │   ├── ConceptCard.js
│   │   │   │   └── ConceptCard.module.css
│   │   │   ├── ConceptGrid/
│   │   │   │   ├── ConceptGrid.js
│   │   │   │   └── ConceptGrid.module.css
│   │   │   ├── ConceptHero/
│   │   │   │   ├── ConceptHero.js
│   │   │   │   └── ConceptHero.module.css
│   │   │   ├── RelatedConcepts/
│   │   │   │   ├── RelatedConcepts.js
│   │   │   │   └── RelatedConcepts.module.css
│   │   │   ├── DifficultyBadge/
│   │   │   │   ├── DifficultyBadge.js
│   │   │   │   └── DifficultyBadge.module.css
│   │   │   └── TableOfContents/
│   │   │       ├── TableOfContents.js
│   │   │       └── TableOfContents.module.css
│   │   │
│   │   ├── interactive/               #    Interactive explainer widgets
│   │   │   ├── MurphysLaw/
│   │   │   │   ├── MurphysLaw.js              # Main component
│   │   │   │   ├── MurphysLaw.module.css
│   │   │   │   ├── ProbabilitySimulator.js     # Canvas-based simulator
│   │   │   │   └── StatsChart.js               # Real-time probability graph
│   │   │   ├── GrandfatherParadox/
│   │   │   │   ├── GrandfatherParadox.js
│   │   │   │   ├── GrandfatherParadox.module.css
│   │   │   │   ├── Timeline.js                 # SVG timeline visualization
│   │   │   │   └── BranchingView.js            # Branching timelines
│   │   │   ├── SchrodingersCat/
│   │   │   │   ├── SchrodingersCat.js
│   │   │   │   ├── SchrodingersCat.module.css
│   │   │   │   ├── QuantumBox.js               # Interactive box component
│   │   │   │   └── WaveFunction.js             # Wave function animation
│   │   │   ├── TrolleyProblem/
│   │   │   │   ├── TrolleyProblem.js
│   │   │   │   ├── TrolleyProblem.module.css
│   │   │   │   ├── ScenarioView.js             # Visual scenario
│   │   │   │   └── DecisionTree.js             # Branching decisions
│   │   │   ├── MontyHall/
│   │   │   │   ├── MontyHall.js
│   │   │   │   ├── MontyHall.module.css
│   │   │   │   ├── DoorGame.js                 # 3-door interactive game
│   │   │   │   └── StatsTracker.js             # Win rate statistics
│   │   │   └── shared/                         # Shared interactive utilities
│   │   │       ├── InteractiveContainer.js     # Wrapper with controls
│   │   │       ├── ControlPanel.js             # Sliders, toggles, buttons
│   │   │       ├── AnimationCanvas.js          # Reusable canvas component
│   │   │       └── ChartBase.js                # Base chart component
│   │   │
│   │   ├── community/                 #    Community components
│   │   │   ├── CommentSection/
│   │   │   │   ├── CommentSection.js
│   │   │   │   └── CommentSection.module.css
│   │   │   ├── CommentThread/
│   │   │   │   ├── CommentThread.js
│   │   │   │   └── CommentThread.module.css
│   │   │   ├── CommentInput/
│   │   │   │   ├── CommentInput.js
│   │   │   │   └── CommentInput.module.css
│   │   │   ├── VoteButton/
│   │   │   │   ├── VoteButton.js
│   │   │   │   └── VoteButton.module.css
│   │   │   └── UserAvatar/
│   │   │       ├── UserAvatar.js
│   │   │       └── UserAvatar.module.css
│   │   │
│   │   ├── search/                    #    Search components
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.js
│   │   │   │   └── SearchBar.module.css
│   │   │   ├── SearchModal/
│   │   │   │   ├── SearchModal.js
│   │   │   │   └── SearchModal.module.css
│   │   │   └── SearchResults/
│   │   │       ├── SearchResults.js
│   │   │       └── SearchResults.module.css
│   │   │
│   │   └── common/                    #    Shared utility components
│   │       ├── SEO/
│   │       │   └── SEO.js             # Meta tags, OG, structured data
│   │       ├── ShareButtons/
│   │       │   ├── ShareButtons.js
│   │       │   └── ShareButtons.module.css
│   │       ├── BookmarkButton/
│   │       │   ├── BookmarkButton.js
│   │       │   └── BookmarkButton.module.css
│   │       └── SourcesList/
│   │           ├── SourcesList.js
│   │           └── SourcesList.module.css
│   │
│   ├── lib/                           # 🔧 Utilities & configurations
│   │   ├── supabase/
│   │   │   ├── client.js              # Browser Supabase client
│   │   │   ├── server.js              # Server-side Supabase client
│   │   │   ├── middleware.js           # Auth middleware for protected routes
│   │   │   └── queries/               # Database query functions
│   │   │       ├── concepts.js        # getConcepts, getConceptBySlug, etc.
│   │   │       ├── comments.js        # getComments, createComment, etc.
│   │   │       ├── votes.js           # castVote, getVotes, etc.
│   │   │       ├── bookmarks.js       # getBookmarks, toggleBookmark, etc.
│   │   │       └── users.js           # getUser, updateProfile, etc.
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js          # Date formatting, number formatting
│   │   │   ├── validators.js          # Input validation helpers
│   │   │   ├── slugify.js             # String → slug conversion
│   │   │   ├── debounce.js            # Debounce utility
│   │   │   └── cn.js                  # CSS class name merge utility
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.js             # Authentication state hook
│   │   │   ├── useSearch.js           # Search with debounce
│   │   │   ├── useBookmark.js         # Bookmark toggle
│   │   │   ├── useVote.js             # Vote casting
│   │   │   ├── useMediaQuery.js       # Responsive breakpoint detection
│   │   │   ├── useIntersection.js     # Intersection Observer for scroll reveals
│   │   │   ├── useKeyboard.js         # Keyboard shortcut handler
│   │   │   └── useLocalStorage.js     # Persistent local state
│   │   │
│   │   └── constants/
│   │       ├── categories.js          # Category definitions with metadata
│   │       ├── difficulties.js        # Difficulty level definitions
│   │       └── routes.js              # Route path constants
│   │
│   ├── data/                          # 📄 Static content
│   │   └── concepts/                  # One file per concept
│   │       ├── murphys-law.js
│   │       ├── grandfather-paradox.js
│   │       ├── schrodingers-cat.js
│   │       ├── trolley-problem.js
│   │       ├── monty-hall.js
│   │       └── index.js               # Barrel file exporting all concepts
│   │
│   └── styles/                        # 🎨 Style system
│       ├── tokens.css                 # Design tokens (CSS custom properties)
│       ├── reset.css                  # CSS reset / normalize
│       ├── animations.css             # Global keyframe animations
│       ├── typography.css             # Font imports and type scale
│       └── utilities.css              # Utility classes (sr-only, etc.)
│
├── public/                            # 🌐 Static public assets
│   ├── images/
│   │   ├── hero/                      # Landing page hero images
│   │   ├── concepts/                  # Concept thumbnail images
│   │   └── og/                        # Open Graph preview images
│   ├── icons/
│   │   ├── categories/                # Category icons (SVG)
│   │   └── badges/                    # Achievement badge icons (SVG)
│   ├── fonts/                         # Self-hosted fonts (if needed)
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── manifest.json                  # PWA manifest
│   └── robots.txt
│
├── tests/                             # 🧪 Tests
│   ├── unit/                          # Vitest unit tests
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   ├── integration/                   # Integration tests
│   │   └── api/
│   └── e2e/                           # Playwright E2E tests
│       ├── landing.spec.js
│       ├── concepts.spec.js
│       └── auth.spec.js
│
├── supabase/                          # 🗄️ Supabase configuration
│   ├── migrations/                    # Database migration files
│   │   ├── 001_create_categories.sql
│   │   ├── 002_create_concepts.sql
│   │   ├── 003_create_users.sql
│   │   ├── 004_create_comments.sql
│   │   ├── 005_create_votes.sql
│   │   ├── 006_create_bookmarks.sql
│   │   └── 007_create_concept_relations.sql
│   ├── seed.sql                       # Seed data for development
│   └── policies.sql                   # Row Level Security policies
│
├── .env.example                       # Environment variable template
├── .env.local                         # Local env vars (git-ignored)
├── .eslintrc.json                     # ESLint configuration
├── .prettierrc                        # Prettier configuration
├── .gitignore
├── next.config.js                     # Next.js configuration
├── jsconfig.json                      # Path aliases (@/ imports)
├── package.json
├── vercel.json                        # Vercel deployment config
└── README.md                          # Project README
```

---

## Database Schema

### Tables

#### `categories`
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,                    -- SVG icon name or emoji
  color TEXT,                   -- Hex color for the category
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `concepts`
```sql
CREATE TABLE concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  read_time INTEGER,            -- Estimated minutes
  summary TEXT,                 -- Short description for cards
  content_md TEXT,              -- Full markdown content
  interactive_type TEXT,        -- Which interactive widget to render
  sources JSONB DEFAULT '[]',   -- Array of {title, url}
  facts JSONB DEFAULT '[]',     -- Array of "Did you know?" strings
  meta_title TEXT,              -- SEO title
  meta_description TEXT,        -- SEO description
  og_image TEXT,                -- Open Graph image URL
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_concepts_slug ON concepts(slug);
CREATE INDEX idx_concepts_category ON concepts(category_id);
CREATE INDEX idx_concepts_published ON concepts(published);
```

#### `concept_tags`
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE concept_tags (
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (concept_id, tag_id)
);
```

#### `concept_relations`
```sql
CREATE TABLE concept_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_a_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  concept_b_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'related',  -- 'related', 'prerequisite', 'extends'
  UNIQUE (concept_a_id, concept_b_id)
);
```

#### `profiles` (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  xp INTEGER DEFAULT 0,
  level TEXT DEFAULT 'novice',
  badges JSONB DEFAULT '[]',
  concepts_explored JSONB DEFAULT '[]',  -- Array of concept IDs
  streak_current INTEGER DEFAULT 0,
  streak_best INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);
```

#### `comments`
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,  -- For threading
  body TEXT NOT NULL,
  is_highlighted BOOLEAN DEFAULT false,  -- Author's pick
  is_deleted BOOLEAN DEFAULT false,      -- Soft delete
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_concept ON comments(concept_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

#### `votes`
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  value SMALLINT CHECK (value IN (-1, 1)),  -- Upvote or downvote
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, comment_id)             -- One vote per user per comment
);

CREATE INDEX idx_votes_comment ON votes(comment_id);
```

#### `bookmarks`
```sql
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES concepts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, concept_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
```

---

## API Design

### REST Endpoints

#### Concepts
```
GET    /api/concepts              → List concepts (supports ?category, ?difficulty, ?tag, ?sort, ?page)
GET    /api/concepts/:slug        → Get single concept with relations
```

#### Comments
```
GET    /api/comments?concept_id=  → List comments for a concept (?sort=top|newest|oldest)
POST   /api/comments              → Create comment { concept_id, body, parent_id? }
PATCH  /api/comments/:id          → Update comment { body }
DELETE /api/comments/:id          → Soft delete comment
```

#### Votes
```
POST   /api/votes                 → Cast vote { comment_id, value }
```

#### Bookmarks
```
GET    /api/bookmarks             → List user's bookmarks
POST   /api/bookmarks             → Toggle bookmark { concept_id }
```

#### Search
```
GET    /api/search?q=             → Full-text search across concepts
```

#### Users
```
GET    /api/users/:username       → Get public profile
PATCH  /api/users/:username       → Update profile { display_name, bio, avatar_url }
```

### Authentication Flow

```
1. User clicks "Sign In"
2. Auth modal opens (no page redirect)
3. User chooses: Email/Password OR Google OR GitHub
4. For OAuth: Redirect to provider → callback to /auth/callback
5. Supabase creates session, sets JWT cookie
6. Client reads session via useAuth() hook
7. Protected routes check session server-side via middleware
```

---

## Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Landing page (`/`) | SSG | Static content, rebuild on deploy |
| Concept browser (`/concepts`) | SSG + ISR | List page, revalidate every 60s |
| Concept detail (`/concepts/:slug`) | SSG | Each concept is a static page, rebuild on content change |
| Knowledge graph (`/explore`) | CSR | Heavy client-side interaction |
| Auth pages (`/auth/*`) | CSR | Client-side only |
| Profile (`/profile/:username`) | SSR | Dynamic user data |
| Settings (`/settings`) | CSR | Protected, client-side |
| API routes (`/api/*`) | Server | Dynamic data |

---

## Performance Strategy

### Code Splitting
- Interactive widgets loaded with `next/dynamic` (lazy import)
- Each explainer is its own chunk — only loads when the concept page is visited
- D3.js and Three.js loaded only on pages that need them

### Caching
- Static pages cached at CDN edge (Vercel)
- ISR for concept list (revalidate: 60s)
- API responses cached with `Cache-Control` headers
- Client-side caching with React Query or SWR (if adopted later)

### Assets
- Images: `next/image` with automatic WebP/AVIF optimization
- Fonts: Self-hosted or `next/font` for zero layout shift
- Icons: Inline SVG for categories, CSS-only for UI icons

### Bundle Size Targets
- Main bundle: < 150KB gzipped
- Per-interactive widget: < 80KB gzipped
- Total page weight (first load): < 500KB gzipped

---

## Security Model

### Row Level Security (Supabase RLS)

```sql
-- Anyone can read published concepts
CREATE POLICY "Public read concepts" ON concepts
  FOR SELECT USING (published = true);

-- Anyone can read comments
CREATE POLICY "Public read comments" ON comments
  FOR SELECT USING (is_deleted = false);

-- Authenticated users can create comments
CREATE POLICY "Auth create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only edit their own comments
CREATE POLICY "Own update comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own comments
CREATE POLICY "Own delete comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (is_deleted = true);

-- Authenticated users can vote
CREATE POLICY "Auth create votes" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only manage their own bookmarks
CREATE POLICY "Own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Users can only edit their own profile
CREATE POLICY "Own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Input Sanitization
- All user-generated content (comments, bio) sanitized with DOMPurify
- SQL injection prevented by Supabase parameterized queries
- XSS prevented by React's default escaping + CSP headers
- Rate limiting on API routes (10 req/min for writes, 60 req/min for reads)

---

## Monitoring & Analytics

| Metric | Tool | Purpose |
|---|---|---|
| Core Web Vitals | Vercel Analytics | Performance monitoring |
| Page views & sessions | Vercel Analytics | Traffic analysis |
| Error tracking | Vercel (built-in) | Bug detection |
| API latency | Custom logging | Performance debugging |
| Search queries | Custom events | Content gap analysis |
| Interactive engagement | Custom events | Which widgets get used most |

---

## Development Workflow

```
1. Create feature branch: phase-X/feature-name
2. Develop locally: npm run dev
3. Write tests: npm test
4. Push → Vercel creates preview deployment
5. Review preview URL
6. Merge to main → Auto-deploy to production
```

### Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-only, never expose

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=NerdVerse

# Analytics (Phase 3+)
NEXT_PUBLIC_ANALYTICS_ID=
```

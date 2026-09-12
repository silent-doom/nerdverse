# NerdVerse 🌌

> **An interactive digital laboratory of the universe's most mind-bending paradoxes, thought experiments, and physical laws.**

NerdVerse is a scholarly, highly interactive WebGL-powered web platform that elevates famous scientific, philosophical, and mathematical thought experiments out of dry textbooks and into playable 3D simulations. Built with **Next.js (Turbopack)**, **Three.js**, and custom **Web Audio synthesis**, every concept is paired with deeply humanized narrative essays, historical anecdotes, and mathematical proofs.

---

## ✨ The Interactive 3D Laboratories

### 1. 🍞 Murphy's Law: Matthews Rotational Dynamics Lab
*Based on Robert Matthews' 1995 Ig Nobel-winning paper "Tumbling toast, Murphy's Law and the fundamental constants".*
* **Rigid-Body Rotational Physics:** Models gravitational edge torque ($\tau = mg(L/2)\cos\theta$), moment of inertia, slip angle velocity, and gravitational free-fall time ($t = \sqrt{2h/g} \approx 0.39\text{s}$).
* **Tabletop Height Invariant:** Explains why standard $0.75\text{m}$ dining tables guarantee a $180^\circ$ half-rotation (butter-side down landing), and shows how elevating to $2.6\text{m}$ allows a full $360^\circ$ revolution to land butter-side up.
* **Dynamic 3D Environment:** Fine-grained Blender-modeled breakfast table, plate, coffee mug, and calibrated physical metric scale with un-stretched centimeter ticks.
* **Impact Settling & Butter Splash:** Damped collision micro-bounce prevents vertical edge-sticking, generating an expanding golden butter puddle with 24 radial splash droplet particles and synthesized acoustic squelch.
* **100-Drop Monte Carlo Batch Engine:** Runs 100 stochastic trials to compute empirical probability distributions.

### 2. 🐱 Schrödinger's Cat: Quantum Decoherence 3D Vault
*Based on Erwin Schrödinger's 1935 paper mocking the Copenhagen Interpretation.*
* **Authentic 1935 Apparatus:** Heavy obsidian vault with gold frame trim, articulated cat mesh with breathing animations, radioactive core with animated quantum sparks, electromechanical trip hammer, and Erlenmeyer cyanide flask.
* **Quantum X-Ray View:** Renders the sealed vault translucent to observe quantum superposition ($|\Psi\rangle = \alpha|\text{Alive}\rangle + \beta|\text{Dead}\rangle$) without causing wave function decoherence.
* **Decay Probability Tuning:** Configures radioactive exposure time ($t$ vs $t_{1/2} = 30\text{m}$) to alter decay odds from $10\%$ to $87\%$.
* **Wave Collapse Observation:** Click to measure or press `[Space]` to force thermodynamic decoherence into an eigenstate ($|1\rangle$ Alive or $|0\rangle$ Collapsed).
* **Multiverse Divergence:** Explores Hugh Everett III's Many-Worlds parallel timeline branches ($\alpha$ vs $\beta$).

### 3. ⏳ Grandfather Paradox: Spacetime Causality Lab
*Visualizing retrocausality across General Relativity and Quantum Mechanics.*
* **Mode A: Causal Lineage Engine (Barjavel / McFly Generational Model):**
  * 3D Minkowski coordinate stage with three generational nodes: Grandfather ($1950$), Parent ($1975$), and Traveler ($2026$), connected by luminous worldline geodesics and a retrocausal wormhole conduit.
  * **Classical Paradox (Temporal Limit-Cycle):** Grandfather elimination wipes parent and fades traveler to $15\%$ opacity $\to$ without traveler, shot never occurs $\to$ timeline resets in an infinite oscillation loop ($0\%$ stability).
  * **Novikov Self-Consistency:** Intervention is deflected or inadvertently causes the grandparents' meeting; locks into an unbroken golden **Möbius Causal Loop** ($100\%$ stability).
  * **Everett Many-Worlds:** Spacetime bifurcates into Timeline $\alpha$ (origin) and Timeline $\beta$ (divergent branch where traveler is an orphan).
  * **Hawking Chronology Protection:** Virtual vacuum fluctuations explode ($T_{\mu\nu} \to \infty$), violently collapsing the wormhole throat before arrival.
* **Mode B: Polchinski's Billiard Wormhole (The Thorne-Novikov Model):**
  * 3D physics pool table with Mouth A (past exit) and Mouth B (future entrance).
  * Demonstrates the landmark **Novikov Grazing Collision** ($2.5^\circ$ glancing deflection that self-consistently sends the younger ball into Mouth B) vs **Head-On Paradoxical Collision**.

### 4. 🚪 Monty Hall Problem: Bayesian Probability Engine
*The probability puzzle that stumped 1,000 PhD mathematicians when Marilyn vos Savant answered it in 1990.*
* **Interactive 3-Door Game Show:** Pick an initial door ($33.3\%$ probability), observe the host eliminate a goat door, and choose whether to Switch or Stay.
* **Bayesian Information Transfer:** Visually illustrates why the host's privileged knowledge concentrates the entire $66.7\%$ probability mass onto the remaining unchosen door.
* **Live Empirical Convergence:** Real-time tracking of win rates across successive rounds.

### 5. 🚃 Trolley Problem: Moral Machine & Conscience Lab
*Philippa Foot's 1967 dilemma and Judith Jarvis Thomson's 1976 Footbridge variation.*
* **Ethical Framework Comparison:** Utilitarianism vs Deontology (Kant) vs Virtue Ethics.
* **fMRI Neuroimaging Data:** Illustrates the neurological split between prefrontal cortex cost-benefit tabulation (Switch case) and amygdala emotional revulsion (Footbridge case).
* **Modern Relevance:** Autonomous vehicle decision-making algorithms and MIT's 40-million-decision *Moral Machine* study.

---

## 🎨 Design System: Scholarly Amber & Obsidian

NerdVerse is crafted with a bespoke design system engineered for visual immersion and clarity:
* **Palette:**
  * Obsidian Void: `#08090C`
  * Deep Slate: `#13151C`
  * Scholarly Amber: `#E5A93C`
  * Slate Border: `#262A36`
  * Pure Text: `#F9FAFB`
* **On-Canvas Experiment Guide HUDs:** Collapsible glassmorphic cards with step-by-step guidance and keyboard shortcuts (`Space` to trigger, `R` to reset, `1-4` for theory select).
* **Synthesized Web Audio:** Zero external audio files; all Geiger counter clicks, mechanical vault latch clinks, wormhole whooshes, billiard clacks, and paradox alarms are synthesized mathematically via the Web Audio API.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/silent-doom/nerdverse.git
   cd nerdverse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
# Build optimized static and server pages
npm run build

# Start production server
npm run start
```

---

## 📁 Repository Structure

```text
nerd_website/
├── public/                     # Static assets (3D GLTF models, icons)
│   ├── models/
│   │   ├── buttered_toast.glb  # High-poly toast with butter layer
│   │   └── table_setting.glb   # Table, ceramic plate, mug
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.jsx            # Homepage with 3D Spacetime Hero & Categories
│   │   ├── explore/page.jsx    # Constellation Knowledge Graph
│   │   └── concepts/[slug]/    # Dynamic concept pages with SSR/SSG
│   ├── components/
│   │   ├── 3d/                 # Three.js WebGL Simulators
│   │   │   ├── MurphysLaw3DPhysics.jsx      # Robert Matthews 3D physics lab
│   │   │   ├── SchrodingersCat3DLab.jsx     # 3D articulated cat vault & HUD
│   │   │   ├── GrandfatherSpacetime3D.jsx   # Lineage & Polchinski wormhole lab
│   │   │   └── SpacetimeHeroCanvas.jsx      # Interactive homepage 3D canvas
│   │   ├── interactive/        # 2D/Interactive Simulators
│   │   │   ├── MontyHallSimulator.jsx       # Bayesian door puzzle
│   │   │   └── ConceptSimulatorResolver.jsx # Dynamic client-side resolver
│   │   └── ui/                 # Reusable design system primitives
│   └── data/
│       └── concepts/index.js   # Humanized essays, mathematical proofs & metadata
├── .gitignore                  # Git ignore rules
├── package.json
└── README.md
```

---

## 📜 License

MIT License. Designed and engineered for inquisitive minds.

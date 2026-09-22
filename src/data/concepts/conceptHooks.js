/**
 * Pedagogical Hooks & Guided Challenges for all 36 concepts.
 * Designed for Progressive Disclosure:
 * - Level 1: The 30-Second Hook (Premise, Intuition, Twist)
 * - Level 2: Guided Interactive Challenges
 * - Mental Model takeaway
 */

export const CONCEPT_HOOKS = {
  'murphys-law': {
    hook: {
      premise: 'A slice of buttered toast slips from your breakfast table. Will it land butter-side down on your clean floor?',
      intuition: 'Common sense says it is a 50/50 coin toss—or that the universe has a malicious sense of humor targeting your rug.',
      twist: 'In 1995, physicist Robert Matthews proved that dining table height (~0.75m) and Earth gravity limit toast rotation to exactly 120°–180°. It physically runs out of height before completing a full rotation!',
    },
    takeaway: 'If failure is physically possible, scale and time make it inevitable. Engineer fail-safes into the physics of your system.',
    challenges: [
      {
        id: 'toast-physics',
        title: 'Challenge 1: The Giant Table Test',
        prompt: 'Slide the table height slider above 2.5 meters. Does the toast finally have enough air time to rotate back to butter-up?',
        actionLabel: 'Increase Table Height',
      },
      {
        id: 'push-force',
        title: 'Challenge 2: Overcoming Gravity with Velocity',
        prompt: 'Increase the horizontal push speed. Can you give the toast enough forward momentum to land safely?',
        actionLabel: 'Boost Push Speed',
      },
    ],
  },

  'grandfather-paradox': {
    hook: {
      premise: 'You build a time machine, travel back to 1920, and eliminate your biological grandfather before your parents are conceived.',
      intuition: 'Either history changes and your family vanishes, or you create a new future where you were never born.',
      twist: 'If you were never born, who built the time machine to pull the trigger in the first place? Spacetime demands either quantum branch multiverses or Novikov self-consistency loops where your action inadvertently causes the past!',
    },
    takeaway: 'Causality is not a loose thread you can snip; it is either a self-healing closed loop or a branching multiverse.',
    challenges: [
      {
        id: 'closed-loop',
        title: 'Challenge 1: The Novikov Shield',
        prompt: 'Activate the timeline distortion. Watch how spacetime enforces chronology protection to prevent paradoxical loops.',
        actionLabel: 'Test Novikov Protection',
      },
      {
        id: 'multiverse-branch',
        title: 'Challenge 2: Many-Worlds Branching',
        prompt: 'Switch to the Everett Multiverse mode to see how quantum branching avoids paradoxes by spawning alternate timelines.',
        actionLabel: 'Branch Timeline',
      },
    ],
  },

  'schrodingers-cat': {
    hook: {
      premise: 'A cat is sealed inside a steel chamber with a single radioactive atom, a Geiger counter, and a vial of poison hydrocyanic acid.',
      intuition: 'Inside the box, the cat is either already dead or still alive right now; opening the lid merely reveals which is true.',
      twist: 'According to the Copenhagen interpretation of quantum mechanics, until the box is measured, the system exists in a physical linear superposition: the cat is genuinely both alive and dead simultaneously!',
    },
    takeaway: 'Reality at the microscopic level does not possess definite properties until an interaction forces decoherence.',
    challenges: [
      {
        id: 'decay-half-life',
        title: 'Challenge 1: Half-Life Superposition',
        prompt: 'Set the decay time to exactly 1 half-life (50% probability). Observe the quantum wave function oscillating between both states.',
        actionLabel: 'Set 1 Half-Life',
      },
      {
        id: 'collapse-wave',
        title: 'Challenge 2: Measure & Collapse',
        prompt: 'Click "Open Observation Hatch" to force quantum decoherence into a single definite eigenstate.',
        actionLabel: 'Open Hatch',
      },
    ],
  },

  'monty-hall': {
    hook: {
      premise: 'You are on a game show with 3 doors. Behind one is a sports car; behind the others are goats. You pick Door 1. The host (who knows what is behind each door) opens Door 3 to reveal a goat, then asks: "Do you want to switch to Door 2?"',
      intuition: 'There are two unopened doors left. It feels like a 50/50 coin flip, so switching shouldn\'t matter.',
      twist: 'Switching doubles your odds from 33.3% to 66.7%! Because Monty always picks an unchosen goat door, all the probability mass of the unchosen doors concentrates into the single door left standing!',
    },
    takeaway: 'New information that eliminates alternative hypotheses does not divide probability equally—it concentrates it on surviving alternatives.',
    challenges: [
      {
        id: 'gut-check',
        title: 'Challenge 1: Test Your Gut Instinct',
        prompt: 'Pick Door 1, wait for Monty to reveal a goat, and choose to STAY. Do this for 10 rounds to track your win rate.',
        actionLabel: 'Play Stay Strategy',
      },
      {
        id: 'switch-1000',
        title: 'Challenge 2: The Empirical Proof',
        prompt: 'Run the 1,000-trial batch simulator with the Switch strategy. Watch the empirical line converge directly onto 66.7%.',
        actionLabel: 'Run 1,000 Switches',
      },
    ],
  },

  'trolley-problem': {
    hook: {
      premise: 'A runaway trolley hurtles down the tracks toward five tied-up workers. You stand beside a lever that can divert it onto a sidetrack where only one worker is tied.',
      intuition: 'Most people pull the lever (saving 5 by sacrificing 1). But when asked to push a large bystander off a footbridge to stop the trolley, most refuse—even though the math (5 vs 1) is identical.',
      twist: 'Our moral intuition separates utilitarian calculus (minimizing net harm) from deontological duty (a visceral prohibition against using a human being as a physical instrument of sacrifice).',
    },
    takeaway: 'Human morality is governed by competing cognitive systems: cold aggregate calculation vs hot emotional prohibitions.',
    challenges: [
      {
        id: 'divert-lever',
        title: 'Challenge 1: The Switch Dilemma',
        prompt: 'Pull the mechanical switch to redirect the runaway trolley onto the spur line and examine the ethical trade-off.',
        actionLabel: 'Pull Track Lever',
      },
      {
        id: 'loop-variant',
        title: 'Challenge 2: The Footbridge Asymmetry',
        prompt: 'Toggle between the Switch and Footbridge variants to compare how your emotional certainty shifts.',
        actionLabel: 'Compare Variants',
      },
    ],
  },

  'bayes-theorem': {
    hook: {
      premise: 'A rare disease affects 1 in 1,000 people. A diagnostic test is 99% accurate. You test positive. What is the probability you actually have the disease?',
      intuition: 'Since the test is 99% accurate, your gut screams that you have a 99% chance of being sick.',
      twist: 'Your actual probability is only about 9%! In a population of 100,000, 100 people are truly sick (99 test positive), while 99,900 are healthy (999 test false-positive). True positives are vastly outnumbered by false alarms!',
    },
    takeaway: 'Never evaluate new evidence in a vacuum. Always update from the base-rate prior probability.',
    challenges: [
      {
        id: 'base-rate-test',
        title: 'Challenge 1: The Base Rate Fallacy',
        prompt: 'Slide the disease prevalence from 0.1% to 10%. Watch how the posterior probability surges from 9% to over 90%.',
        actionLabel: 'Adjust Prevalence',
      },
      {
        id: 'test-accuracy',
        title: 'Challenge 2: Precision vs False Positives',
        prompt: 'Increase the specificity to 99.9% to see what accuracy is required to overcome rare base rates.',
        actionLabel: 'Boost Specificity',
      },
    ],
  },

  'simpsons-paradox': {
    hook: {
      premise: 'A hospital tests two kidney stone treatments. Treatment A has a higher success rate than Treatment B on small stones, AND Treatment A has a higher success rate on large stones.',
      intuition: 'If Treatment A wins in every single subgroup, it must obviously win overall when all patients are combined.',
      twist: 'When combined, Treatment B has a higher overall success rate! Because doctors assigned the invasive Treatment A primarily to severe, high-risk cases, the aggregate data completely flips!',
    },
    takeaway: 'Lumping disparate groups together hides lurking confounders. Aggregating data without controlling for sub-populations can invert reality.',
    challenges: [
      {
        id: 'flip-view',
        title: 'Challenge 1: The Aggregate Illusion',
        prompt: 'Toggle from the combined Aggregate View to the Subgroup Breakdown. Watch the winner flip right before your eyes!',
        actionLabel: 'Toggle Subgroups',
      },
      {
        id: 'berkeley-data',
        title: 'Challenge 2: The 1973 Berkeley Case',
        prompt: 'Switch to the famous UC Berkeley admissions preset to see how department choice inverted a perceived institutional bias.',
        actionLabel: 'Load Berkeley Case',
      },
    ],
  },

  'st-petersburg-paradox': {
    hook: {
      premise: 'A casino offers a coin-toss game: you start with $2. Every time heads lands, the pot doubles ($4, $8, $16...). The game ends on the first tails. How much would you pay to play once?',
      intuition: 'Most people wouldn\'t pay more than $20 or $30 for a single ticket.',
      twist: 'The mathematical expected value is literally infinite (½·$2 + ¼·$4 + ⅛·$8... = $1 + $1 + $1... = ∞)! Yet no rational person would wager their life savings, because 50% of the time you walk away with just $2.',
    },
    takeaway: 'Expected value is not equal to expected utility. Human wealth has diminishing marginal returns, and risk of ruin matters.',
    challenges: [
      {
        id: 'bankroll-test',
        title: 'Challenge 1: Flip Until Tails',
        prompt: 'Play 5 consecutive rounds at a $25 ticket price. Notice how quickly a streak of bad flips bankrupts your initial wallet.',
        actionLabel: 'Play 5 Rounds',
      },
      {
        id: 'utility-curve',
        title: 'Challenge 2: Bernoulli Logarithmic Utility',
        prompt: 'Switch to the Expected Utility mode to see why Daniel Bernoulli solved this paradox in 1738 using logarithmic wealth.',
        actionLabel: 'View Utility Curve',
      },
    ],
  },

  'maxwells-demon': {
    hook: {
      premise: 'A sealed box of gas is split in half with a frictionless trapdoor operated by a microscopic demon who lets fast (hot) particles into one side and slow (cold) particles into the other.',
      intuition: 'The demon generates free energy and hot/cold gradients without doing mechanical work, violating the Second Law of Thermodynamics!',
      twist: 'The Second Law is saved by information physics! In 1961, Rolf Landauer proved that the demon must store information about particle velocities—and erasing that information generates heat that exactly balances the entropy ledger!',
    },
    takeaway: 'Information is physical. Erasing a single bit of memory produces a fundamental minimum amount of heat ($kT \\ln 2$).',
    challenges: [
      {
        id: 'sort-molecules',
        title: 'Challenge 1: Sorting Molecules',
        prompt: 'Operate the trapdoor to sort fast molecules into Chamber A. Watch the temperature differential climb.',
        actionLabel: 'Open Trapdoor',
      },
      {
        id: 'landauer-cost',
        title: 'Challenge 2: The Landauer Erasure Penalty',
        prompt: 'Observe the demon\'s memory register fill up. Trigger a memory erase and watch the thermal entropy release.',
        actionLabel: 'Erase Memory',
      },
    ],
  },

  'fermi-paradox': {
    hook: {
      premise: 'Our galaxy contains roughly 100–400 billion stars, many billions of years older than our Sun. Even at sub-light speeds, an interstellar civilization could colonize the entire Milky Way in just 10–50 million years.',
      intuition: 'The universe should be teeming with signs of alien civilizations, Dyson spheres, or radio beacons.',
      twist: 'As physicist Enrico Fermi famously asked in 1950: "Where is everybody?" Decades of deep space listening have detected only deafening, eerie silence.',
    },
    takeaway: 'Either intelligent life is extraordinarily rare (The Great Filter lies behind us), or technology inevitably self-destructs (The Filter lies ahead).',
    challenges: [
      {
        id: 'drake-sliders',
        title: 'Challenge 1: The Drake Equation',
        prompt: 'Adjust the probability of abiogenesis and technological longevity ($L$) to see how many communicating civs are predicted.',
        actionLabel: 'Tune Drake Sliders',
      },
      {
        id: 'great-filter',
        title: 'Challenge 2: The Great Filter Test',
        prompt: 'Test different filter bottlenecks (eukaryote evolution vs nuclear/AI self-destruction) on galactic civilizational survival.',
        actionLabel: 'Test Great Filter',
      },
    ],
  },

  'laplaces-demon': {
    hook: {
      premise: 'If a supreme intellect knew the exact position and momentum of every atom in the universe at this moment, could it predict all future history with 100% certainty?',
      intuition: 'In classical Newtonian physics, every collision is deterministic like pool balls on a table—so future history must already be fixed.',
      twist: 'Quantum mechanics (Heisenberg Uncertainty Principle) proves position and momentum cannot be simultaneously known, while chaos theory (butterfly effect) renders long-term calculation impossible even for infinite computers!',
    },
    takeaway: 'Determinism does not equal predictability. Quantum uncertainty and non-linear dynamics keep the future open.',
    challenges: [
      {
        id: 'double-pendulum',
        title: 'Challenge 1: Deterministic Chaos',
        prompt: 'Release two double pendulums with a 0.0001mm initial difference. Watch them diverge wildly after just a few swings.',
        actionLabel: 'Release Pendulums',
      },
      {
        id: 'quantum-blur',
        title: 'Challenge 2: Heisenberg Uncertainty',
        prompt: 'Increase measurement precision of particle position and watch momentum uncertainty explode into pure quantum noise.',
        actionLabel: 'Measure Position',
      },
    ],
  },

  'ship-of-theseus': {
    hook: {
      premise: 'Theseus returns from Crete in a wooden ship. Over centuries, decaying planks are replaced one by one until not a single original sliver of timber remains. Is it still the same ship?',
      intuition: 'If you replace a nail or plank, it is clearly the same boat. But if all pieces are replaced, how can it be identical?',
      twist: 'What if someone collected every discarded rotted plank, restored them, and assembled a second ship in drydock? Which one is the true Ship of Theseus: the one with continuous history, or the one with original atoms?',
    },
    takeaway: 'Identity is not an intrinsic physical essence inside objects; it is a human mental category tracking functional continuity.',
    challenges: [
      {
        id: 'replace-all',
        title: 'Challenge 1: The 100% Replacement',
        prompt: 'Slide the maintenance timeline to replace 100% of the timber planks. Decide at what threshold identity was broken.',
        actionLabel: 'Replace All Planks',
      },
      {
        id: 'reconstructed-drydock',
        title: 'Challenge 2: The Drydock Clone Paradox',
        prompt: 'Reassemble the discarded original planks into Ship B and compare the continuity vs physical substance arguments.',
        actionLabel: 'Assemble Ship B',
      },
    ],
  },

  'cognitive-dissonance': {
    hook: {
      premise: 'You are forced to perform a mind-numbing, boring task for an hour (turning wooden pegs). The researcher then pays you either $1 or $20 to tell the next participant the task was delightful.',
      intuition: 'People paid $20 would say they enjoyed it more because they got a much bigger financial reward.',
      twist: 'In Leon Festinger\'s 1959 experiment, subjects paid only $1 rated the boring task as genuinely fun! The $20 group had an external excuse ("I did it for $20"), but the $1 group had to warp their own internal beliefs to avoid feeling like a liar for pocket change!',
    },
    takeaway: 'When our actions contradict our beliefs without external justification, our brain changes our beliefs to preserve our self-image.',
    challenges: [
      {
        id: 'compare-bribes',
        title: 'Challenge 1: $1 vs $20 Justification',
        prompt: 'Toggle between the $1 and $20 bribe conditions. Notice how the internal dissonance gauge spikes when external reward is tiny!',
        actionLabel: 'Compare Bribe Conditions',
      },
      {
        id: 'prophecy-fails',
        title: 'Challenge 2: When Prophecy Fails',
        prompt: 'Switch to the 1954 UFO cult mode. See why disconfirmation caused believers to become more fanatical, not less.',
        actionLabel: 'Test Sunk Cost Cult',
      },
    ],
  },

  'halting-problem': {
    hook: {
      premise: 'Can you write a master debugging computer program that inspects any given code and determines with 100% reliability whether it will eventually stop or loop forever?',
      intuition: 'Computers are pure formal logic engines; given enough memory and compute power, analyzing code structure should be solvable.',
      twist: 'Alan Turing proved in 1936 that no such master program can ever exist! If you feed the program an adversarial function that halts if and only if the master predicts it loops, the universe crashes into a logical self-contradiction.',
    },
    takeaway: 'There are fundamental, mathematical limits to computation. Some truths cannot be decided by any algorithm.',
    challenges: [
      {
        id: 'turing-tape',
        title: 'Challenge 1: The Infinite Loop Machine',
        prompt: 'Run the Turing tape on a recursive self-inverting function. Watch the paradox detector lock up in contradiction.',
        actionLabel: 'Run Turing Machine',
      },
      {
        id: 'busy-beaver',
        title: 'Challenge 2: The Busy Beaver Frontier',
        prompt: 'Step through a 4-state Busy Beaver machine to see how simple rules explode into non-computable execution lengths.',
        actionLabel: 'Step Busy Beaver',
      },
    ],
  },

  'conways-game-of-life': {
    hook: {
      premise: 'A grid of cells where each cell is alive or dead based on 4 simple rules counting its 8 neighbors. No goals, no players.',
      intuition: 'Such simple deterministic neighbor rules should produce either static static blocks or quickly die out into empty space.',
      twist: 'From these 4 trivial rules emerge self-replicating gliders, logic gates, self-constructing factories, and universal Turing machines capable of running Life inside Life!',
    },
    takeaway: 'Extreme complexity, emergent life-like behavior, and computation emerge spontaneously from simple local interactions.',
    challenges: [
      {
        id: 'spawn-glider',
        title: 'Challenge 1: Glider Locomotion',
        prompt: 'Spawn a 5-cell Glider and press Play. Watch how local neighbor rules produce self-sustaining diagonal movement!',
        actionLabel: 'Spawn Glider Gun',
      },
      {
        id: 'pulsar-oscillator',
        title: 'Challenge 2: The Pulsar Clock',
        prompt: 'Load a period-3 Pulsar oscillator to observe perfectly stable cyclical kinetic balance in 3D voxels.',
        actionLabel: 'Load Pulsar',
      },
    ],
  },

  'chinese-room': {
    hook: {
      premise: 'A person who speaks zero Chinese sits inside a room with a giant rulebook in English. People slip Chinese questions under the door; the person follows the rules to look up symbols and slips back flawless Chinese answers.',
      intuition: 'From the outside, the room passes the Turing Test with flying colors. It appears to fully understand Chinese.',
      twist: 'Philosopher John Searle noted: the person inside doesn\'t understand a single word of Chinese! Syntax (symbol manipulation) does not equal Semantics (intentional understanding). Does AI actually understand or just manipulate tokens?',
    },
    takeaway: 'Flawless mimicry of language is not proof of consciousness or comprehension. Syntax does not produce semantics.',
    challenges: [
      {
        id: 'pass-symbol',
        title: 'Challenge 1: Look Up the Rulebook',
        prompt: 'Receive an incoming Chinese symbol through the slot, match it in the English lookup index, and return the output.',
        actionLabel: 'Process Token',
      },
      {
        id: 'systems-reply',
        title: 'Challenge 2: The Systems Reply',
        prompt: 'Toggle the Systems View: does the whole room understand, even if the human inside does not?',
        actionLabel: 'Toggle Systems View',
      },
    ],
  },

  'red-queen-hypothesis': {
    hook: {
      premise: 'In Alice in Wonderland, the Red Queen tells Alice: "Now, here, you see, it takes all the running you can do, to keep in the same place."',
      intuition: 'If a species evolves to run faster, develop thicker shells, or produce deadlier venom, its survival advantage should increase over time.',
      twist: 'Every adaptation in a predator forces a matching co-adaptation in prey, parasites, and competitors! In an evolutionary arms race, species run as fast as they can just to avoid extinction—relative fitness remains frozen!',
    },
    takeaway: 'In competitive, co-evolving ecosystems, standing still means falling behind. You must innovate continuously just to survive.',
    challenges: [
      {
        id: 'predator-speed',
        title: 'Challenge 1: Accelerate the Leopard',
        prompt: 'Boost leopard running speed by +20%. Watch the gazelle population plummet until natural selection drives gazelle speed to match!',
        actionLabel: 'Boost Leopard Speed',
      },
      {
        id: 'parasite-drift',
        title: 'Challenge 2: The Sexual Selection Shield',
        prompt: 'Enable parasite evolution. See why sexual reproduction reshuffles genes constantly to stop parasites cracking immune locks.',
        actionLabel: 'Enable Parasite Drift',
      },
    ],
  },

  'prisoners-dilemma': {
    hook: {
      premise: 'Two criminal suspects (Alice and Bob) are arrested and interrogated in separate rooms. If both stay silent, they get 1 year. If both confess (betray), they get 5 years. But if one betrays while the other stays silent, the betrayer walks free (0 years) while the silent partner gets 10 years.',
      intuition: 'Both suspects obviously want the best outcome (1 year each), so staying silent is the rational choice.',
      twist: 'Regardless of what Bob does, Alice is strictly better off betraying (0 < 1 if Bob is silent, 5 < 10 if Bob betrays). Bob has the exact same incentive. Individual rational self-interest inexorably forces both into mutual catastrophe (5 years each)!',
    },
    takeaway: 'When individuals pursue pure local self-interest without binding agreements, the collective outcome is worse for everyone (Nash Equilibrium).',
    challenges: [
      {
        id: 'test-betrayal',
        title: 'Challenge 1: The Temptation to Defect',
        prompt: 'Test what happens when you defect while Bob stays silent: you go free, but Bob gets 10 years in solitary.',
        actionLabel: 'Play Defect vs Silent',
      },
      {
        id: 'tit-for-tat',
        title: 'Challenge 2: Axelrod\'s Repeated Tournament',
        prompt: 'Switch to the Tournament tab and test Tit-for-Tat against a Hawk. See how reciprocal retaliation restores mutual cooperation!',
        actionLabel: 'Run Tit-for-Tat',
      },
    ],
  },

  'tragedy-of-the-commons': {
    hook: {
      premise: 'A village shares a public pasture open to all. Any herder can add another sheep to graze. Each extra sheep gives that herder +100% of the meat and wool.',
      intuition: 'Herders know the pasture has a carrying capacity, so they will naturally restrain their herd sizes to protect the grass.',
      twist: 'The herder reaps 100% of the private benefit of an extra sheep, but the cost of overgrazing is shared among all villagers (fractional cost). Individual rational incentives compel every herder to add sheep until the common pasture collapses into dust!',
    },
    takeaway: 'Shared open-access resources without property rights, community rules, or quotas inevitably suffer catastrophic depletion.',
    challenges: [
      {
        id: 'add-sheep-collapse',
        title: 'Challenge 1: The Overgrazing Tipping Point',
        prompt: 'Add sheep until grazing rate exceeds grass regeneration. Watch the vibrant green pasture turn barren in real time.',
        actionLabel: 'Add More Sheep',
      },
      {
        id: 'ostrom-rules',
        title: 'Challenge 2: Elinor Ostrom\'s Governance',
        prompt: 'Apply community monitoring quotas and shared sanctions to stabilize the ecosystem at sustainable maximum yield.',
        actionLabel: 'Enforce Common Quota',
      },
    ],
  },

  'braess-paradox': {
    hook: {
      premise: 'Traffic between two cities crawls along two parallel highway routes. Engineers spend millions building a super-fast new bypass bridge connecting the routes to relieve congestion.',
      intuition: 'Adding a new high-speed shortcut between two bottlenecks can only improve travel times or keep them the same.',
      twist: 'When the new road opens, EVERY driver rationally switches to use the attractive shortcut, creating a single massive bottleneck that makes average commute times worse for everyone!',
    },
    takeaway: 'Adding capacity to a network can degrade overall performance when individual actors make selfish routing decisions.',
    challenges: [
      {
        id: 'open-bypass',
        title: 'Challenge 1: The Congestion Surge',
        prompt: 'Open the cross-connecting highway bypass. Watch all 4,000 simulated commuters switch to it, increasing travel time from 65m to 80m!',
        actionLabel: 'Open Bypass Route',
      },
      {
        id: 'close-bypass',
        title: 'Challenge 2: Closing Roads to Speed Up Traffic',
        prompt: 'Close the bypass route. Observe how removing a road restores equilibrium and cuts travel times across the network.',
        actionLabel: 'Close Shortcut Road',
      },
    ],
  },

  'pi-collisions': {
    hook: {
      premise: 'Two frictionless blocks sit in front of a rigid wall. A large block collides with a smaller block between it and the wall.',
      intuition: 'The number of bounces should depend on messy initial velocities or fizzle out randomly.',
      twist: 'If the large block has mass 100^N times the small block, the total number of elastic collisions (between blocks and wall) counts the exact first N+1 digits of π: 3, 31, 314, 3,141, and so on! Kinetic energy conservation maps elastic bounces onto a circle in velocity space.',
    },
    takeaway: 'Hidden symmetries connect seemingly unrelated universes: Newtonian block mechanics computes π through the geometry of energy conservation.',
    challenges: [
      {
        id: 'ratio-100',
        title: 'Challenge 1: The 100:1 Digit Extraction',
        prompt: 'Slide the mass ratio to 100:1. Verify that exactly 31 collisions occur before the large block escapes forever.',
        actionLabel: 'Test 100:1 Ratio',
      },
      {
        id: 'ratio-10000',
        title: 'Challenge 2: Scaling to 10,000:1',
        prompt: 'Scale mass ratio to 10,000:1 to extract 314 collisions and witness phase space circle geometry.',
        actionLabel: 'Test 10,000:1 Ratio',
      },
    ],
  },

  'eulers-number': {
    hook: {
      premise: 'You invest $1 at a 100% annual interest rate. If interest is compounded continuously every microsecond, do you become infinitely rich?',
      intuition: 'Compounding more and more frequently should cause your money to explode toward infinity.',
      twist: 'The returns hit a strict, immutable ceiling discovered by Jacob Bernoulli and Leonhard Euler: lim (1 + 1/n)^n = e ≈ 2.71828. Nature\'s ultimate constant of continuous growth and decay.',
    },
    takeaway: 'Exponential growth is bound by fundamental limits: e is the unique mathematical scale where rate of change equals state of being.',
    challenges: [
      {
        id: 'continuous-compounding',
        title: 'Challenge 1: The Continuous Limit',
        prompt: 'Increase compounding intervals from annual to continuous. Observe how returns converge strictly on e.',
        actionLabel: 'Maximize Compounding',
      },
      {
        id: 'derangements',
        title: 'Challenge 2: The Derangement Paradox',
        prompt: 'Test the hat-check permutation problem: the probability that 100 people pick someone else\'s hat converges precisely to 1/e ≈ 36.8%.',
        actionLabel: 'Test Derangements',
      },
    ],
  },

  'cap-theorem': {
    hook: {
      premise: 'You are architecting a planetary distributed database spanning servers across North America, Europe, and Asia.',
      intuition: 'With enough redundant fiber cables, modern engineering can guarantee instant consistency, 100% uptime, and fault tolerance simultaneously.',
      twist: 'Eric Brewer proved you can only pick two out of three: Consistency, Availability, and Partition Tolerance. Because physical networks invariably drop packets, you must choose between stale data or failed requests!',
    },
    takeaway: 'Physics enforces trade-offs in distributed systems: when networks partition, you must sacrifice either absolute truth (Consistency) or universal response (Availability).',
    challenges: [
      {
        id: 'split-brain',
        title: 'Challenge 1: The Split-Brain Crucible',
        prompt: 'Sever the transatlantic fiber link. Decide whether your cluster refuses writes (CP) or serves conflicting data (AP).',
        actionLabel: 'Trigger Partition',
      },
      {
        id: 'consensus-latency',
        title: 'Challenge 2: Linearizability vs Latency',
        prompt: 'Enable strict synchronous consensus (Paxos/Raft) and measure the unavoidable latency penalty.',
        actionLabel: 'Enforce Strict CP',
      },
    ],
  },

  'teslers-law': {
    hook: {
      premise: 'You are redesigning a convoluted enterprise software tool into a sleek, 1-click consumer application.',
      intuition: 'Brilliant design can eliminate all the inherent complexity from the problem domain.',
      twist: 'Larry Tesler proved that every application possesses an irreducible baseline complexity. You cannot eliminate it; you only shift who suffers from it—the end user, or the software engineer writing millions of lines of code behind the scenes.',
    },
    takeaway: 'Complexity is conserved like energy: simplifying user workflows inevitably pushes immense engineering burden under the hood.',
    challenges: [
      {
        id: 'shift-burden',
        title: 'Challenge 1: The 1-Click Illusion',
        prompt: 'Increase user simplification from 20% to 90%. Watch the behind-the-scenes edge cases and compiler heuristics explode.',
        actionLabel: 'Simplify User UI',
      },
      {
        id: 'complexity-debt',
        title: 'Challenge 2: Shifting the Burden',
        prompt: 'Evaluate the maintenance overhead when supporting magical user abstractions over legacy APIs.',
        actionLabel: 'Audit Complexity Debt',
      },
    ],
  },

  'brouwers-fixed-point-theorem': {
    hook: {
      premise: 'You gently stir a cup of coffee with a spoon, swirling every drop of liquid without splashing.',
      intuition: 'Every single molecule of coffee has been moved to a brand new position in the cup.',
      twist: 'Topologist L.E.J. Brouwer proved that in any continuous deformation of a compact convex space, at least one point must remain in its exact original coordinates! Similarly, crumple a city map and drop it on the sidewalk: one point on the map sits directly above its real-world twin.',
    },
    takeaway: 'Continuity enforces invariance: no matter how complex the transformation, fixed points are topological inevitabilities.',
    challenges: [
      {
        id: 'coffee-stir',
        title: 'Challenge 1: The Coffee Cup Stir',
        prompt: 'Stir the liquid medium across varying speeds. Trace the continuous vector field to locate the invariant stationary molecule.',
        actionLabel: 'Stir Fluid Grid',
      },
      {
        id: 'crumpled-map',
        title: 'Challenge 2: The Crumpled Map Invariant',
        prompt: 'Deform a 2D topographical map. Locate the exact coordinate that sits directly over its identical un-crumpled position.',
        actionLabel: 'Crumple Coordinate Map',
      },
    ],
  },

  'parkinsons-law': {
    hook: {
      premise: 'Your engineering team has an estimated 2 weeks of work. Management gives you a generous 8-week deadline to guarantee high quality.',
      intuition: 'With 6 extra weeks of buffer, the project will finish early and be thoroughly polished.',
      twist: 'Cyril Parkinson showed that work expands to fill the exact time allotted for its completion. Extra time spawns bloated specifications, bikeshedding, and unnecessary redesigns, finishing at the deadline with equal or worse quality!',
    },
    takeaway: 'Deadlines dictate effort density: unbounded schedules breed bureaucracy, overengineering, and artificial complexity.',
    challenges: [
      {
        id: 'deadline-dilation',
        title: 'Challenge 1: The Deadline Dilation Test',
        prompt: 'Double the schedule buffer from 4 weeks to 8 weeks. Watch scope creep and administrative meetings consume the surplus.',
        actionLabel: 'Expand Schedule',
      },
      {
        id: 'tight-constraints',
        title: 'Challenge 2: Tight Constraint Velocity',
        prompt: 'Compress the project horizon to 2 weeks. Observe how artificial gold-plating falls away while core essentials ship.',
        actionLabel: 'Enforce Tight Deadline',
      },
    ],
  },

  'hofstadters-law': {
    hook: {
      premise: 'You break an engineering project into fine-grained tasks and calculate a completion time of exactly 3 weeks.',
      intuition: 'Accounting for unexpected delays and adding contingency buffers should guarantee an accurate delivery date.',
      twist: 'Douglas Hofstadter formulated the recursive law: "It always takes longer than you expect, even when you take into account Hofstadter\'s Law." Every subtask contains recursive unknown-unknowns.',
    },
    takeaway: 'Engineering estimation is fractally recursive: complex systems conceal emergent dependencies that cannot be foreseen from the blueprint.',
    challenges: [
      {
        id: 'fractal-subtasks',
        title: 'Challenge 1: The Fractal Subtask Trap',
        prompt: 'Decompose a feature into 5 subtasks. Watch each subtask spawn 2 unexpected hidden dependency branches.',
        actionLabel: 'Decompose Tasks',
      },
      {
        id: 'recursive-recursion',
        title: 'Challenge 2: Applying Hofstadter Recursion',
        prompt: 'Apply recursive compensation multipliers. Discover why the estimate still fails to converge without scope reduction.',
        actionLabel: 'Apply Recursive Multiplier',
      },
    ],
  },

  'hanlons-razor': {
    hook: {
      premise: 'A cloud provider deployment breaks your production server on a Friday afternoon right before a major launch.',
      intuition: 'Someone in the vendor\'s operations team must have intentionally sabotaged you or disregarded your account out of malice.',
      twist: 'Robert J. Hanlon advised: "Never attribute to malice that which is adequately explained by stupidity or incompetence." Human minds are prone to hostile attribution bias, fabricating conspiracies when tired humans simply made an honest blunder.',
    },
    takeaway: 'Filter for systemic noise before assuming conspiracy: incompetence, cognitive overload, and poor communication cause 99% of organizational catastrophes.',
    challenges: [
      {
        id: 'attribution-filter',
        title: 'Challenge 1: The Attribution Filter',
        prompt: 'Toggle an outage scenario from malicious attack to configuration fatigue. Calculate the Bayesian posterior likelihood of malice vs noise.',
        actionLabel: 'Evaluate Attribution',
      },
      {
        id: 'defuse-paranoia',
        title: 'Challenge 2: Defusing Organizational Paranoia',
        prompt: 'Simulate a communication breakdown between cross-functional teams and trace how innocent blunders morph into toxic feuds.',
        actionLabel: 'Simulate Blunder Spiral',
      },
    ],
  },

  'pareto-principle': {
    hook: {
      premise: 'You are analyzing 10,000 customer bug reports submitted to an operating system development team.',
      intuition: 'Bugs should be evenly distributed across thousands of separate files and engineering teams.',
      twist: 'Vilfredo Pareto and Joseph Juran demonstrated that roughly 80% of system crashes stem from just 20% of code defects. Power-law distributions govern wealth, network hubs, language word frequencies, and software failures.',
    },
    takeaway: 'Complex systems are fundamentally non-linear: focusing relentless attention on the vital 20% yields 80% of all real-world impact.',
    challenges: [
      {
        id: 'patch-vital',
        title: 'Challenge 1: The 80/20 Crash Resolution',
        prompt: 'Fix the top 20% of root-cause bugs. Measure the disproportionate 80% plunge in customer crashes.',
        actionLabel: 'Patch Vital 20% Bugs',
      },
      {
        id: 'diminishing-returns',
        title: 'Challenge 2: The Power-Law Tail',
        prompt: 'Examine the remaining 80% long-tail edge cases to understand the law of diminishing returns in perfectionism.',
        actionLabel: 'Audit Diminishing Returns',
      },
    ],
  },

  'peter-principle': {
    hook: {
      premise: 'A stellar software engineer with peerless architectural skills is promoted to engineering manager.',
      intuition: 'People who excel in their current role will naturally excel in the next level up the corporate hierarchy.',
      twist: 'Laurence J. Peter observed that employees are promoted based on competence in their current job until they reach a role they are incompetent at—where they remain permanently stuck.',
    },
    takeaway: 'Competence in one domain does not generalize: organizations naturally fill leadership posts with people who have reached their terminal incompetence ceiling.',
    challenges: [
      {
        id: 'promotion-ladder',
        title: 'Challenge 1: The Promotion Simulation',
        prompt: 'Promote top individual contributors up the corporate ladder. Observe how competence scores plateau across management tiers.',
        actionLabel: 'Simulate Promotions',
      },
      {
        id: 'dual-tracks',
        title: 'Challenge 2: Dual Career Ladders',
        prompt: 'Implement dual IC / Management tracks to keep stellar talent thriving in their zone of genius without forced management promotions.',
        actionLabel: 'Enable Dual Track',
      },
    ],
  },

  'hicks-law': {
    hook: {
      premise: 'You land on an e-commerce checkout page with 30 different navigation links, discount buttons, and upsell menus.',
      intuition: 'Giving users maximum choice and flexibility empowers them to find what they want faster.',
      twist: 'William Hick and Ray Hyman proved cognitive reaction time scales logarithmically with choice count: T = b · log₂(n + 1). Too many options paralyzes decision-making and spikes abandonment.',
    },
    takeaway: 'Every added choice imposes an information-theoretic tax: simplicity is not an aesthetic choice, but a cognitive performance imperative.',
    challenges: [
      {
        id: 'decision-latency',
        title: 'Challenge 1: The Decision Latency Curve',
        prompt: 'Increase menu choices from 3 to 24 options. Watch cognitive reaction latency surge logarithmically.',
        actionLabel: 'Add Menu Options',
      },
      {
        id: 'progressive-tiers',
        title: 'Challenge 2: Progressive Disclosure Reduction',
        prompt: 'Group options into categorical progressive disclosure tiers. Measure the reduction in user hesitation time.',
        actionLabel: 'Group into Tiers',
      },
    ],
  },

  'goodharts-law': {
    hook: {
      premise: 'A software company evaluates and bonuses engineers based on the exact number of pull requests and lines of code they commit.',
      intuition: 'Tying financial rewards directly to measurable productivity metrics will produce more software output.',
      twist: 'Charles Goodhart showed that the moment a measure becomes an explicit target, it ceases to be a good measure. Engineers split simple fixes into 20 bloated pull requests, corrupting the metric while degrading code quality!',
    },
    takeaway: 'Optimization pressure distorts proxies: any metric tied to rewards will be gamed at the direct expense of underlying truth.',
    challenges: [
      {
        id: 'cobra-effect',
        title: 'Challenge 1: The Cobra Effect Incentive',
        prompt: 'Tie compensation to test code coverage percentages. Watch developers commit vacuous assertions without tests.',
        actionLabel: 'Enforce 100% Coverage Target',
      },
      {
        id: 'balancing-metrics',
        title: 'Challenge 2: Counter-Gaming Balancing Metrics',
        prompt: 'Pair quantity targets with adversarial quality checks (e.g., bug regression rates) to mitigate metric degradation.',
        actionLabel: 'Add Balancing Metric',
      },
    ],
  },

  'dunning-kruger-effect': {
    hook: {
      premise: 'A novice coder finishes a 2-hour tutorial and confidently declares they are ready to build a distributed banking platform.',
      intuition: 'People who know the least should naturally be the most aware of their vast ignorance.',
      twist: 'David Dunning and Justin Kruger discovered that the skills needed to produce correct answers are the exact same skills needed to evaluate competence! Novices suffer a double curse: they make mistakes, and lack the metacognition to know it.',
    },
    takeaway: 'Ignorance breeds confidence more frequently than knowledge: the early slope of learning creates an illusion of complete mastery.',
    challenges: [
      {
        id: 'mount-stupid',
        title: 'Challenge 1: Mount Stupid to Valley of Despair',
        prompt: 'Increase domain knowledge from beginner to intermediate. Observe confidence plunge as the vastness of the field is revealed.',
        actionLabel: 'Advance Knowledge Level',
      },
      {
        id: 'calibrate-competence',
        title: 'Challenge 2: Calibrating Competence',
        prompt: 'Track how true experts tend to underestimate their relative ability, assuming tasks easy for them are easy for everyone.',
        actionLabel: 'Benchmark Expertise',
      },
    ],
  },

  'occams-razor': {
    hook: {
      premise: 'You hear strange scratching noises in your kitchen wall at midnight.',
      intuition: 'It could be tiny mice, or a sophisticated foreign surveillance drone equipped with claw sensors, or an interdimensional rodent ghost.',
      twist: 'William of Ockham established: entities should not be multiplied beyond necessity. Among competing explanations that account for the evidence, the hypothesis with the fewest unproven assumptions is overwhelmingly more likely to be true.',
    },
    takeaway: 'Parsimony protects against epistemic overfitting: penalize models and theories that require multiplying extraordinary assumptions.',
    challenges: [
      {
        id: 'parameter-penalty',
        title: 'Challenge 1: Model Parameter Penalization',
        prompt: 'Add free parameters to a curve-fitting model. Watch Bayesian Occam factors penalize overfit models that lack generalizability.',
        actionLabel: 'Add Free Parameters',
      },
      {
        id: 'competing-theories',
        title: 'Challenge 2: Evaluating Competing Theories',
        prompt: 'Compare medical diagnostic hypotheses: test when a single common ailment explains 3 symptoms vs invoking 3 rare diseases.',
        actionLabel: 'Compare Diagnostic Priors',
      },
    ],
  },

  'chestertons-fence': {
    hook: {
      premise: 'A newly hired software engineer finds an obscure 50-millisecond sleep loop inside a database connection pool and deletes it because it looks redundant.',
      intuition: 'Removing apparently useless or poorly commented legacy code makes the system cleaner and faster.',
      twist: 'G.K. Chesterton formulated the rule of reform: Never tear down a fence until you know why it was built in the first place. Deleting the sleep loop immediately caused race-condition deadlocks under peak load!',
    },
    takeaway: 'Respect unseen constraints: apparent inefficiencies in surviving systems often conceal hard-won defenses against catastrophic second-order failure.',
    challenges: [
      {
        id: 'deletion-trap',
        title: 'Challenge 1: The Deletion Trap',
        prompt: 'Delete an un-commented rate-limiter gate. Run high concurrency telemetry to witness the latent cascade failure it was built to prevent.',
        actionLabel: 'Remove Legacy Constraint',
      },
      {
        id: 'git-blame-arch',
        title: 'Challenge 2: Archeological Git Blame',
        prompt: 'Perform git history archeology to uncover the historical incident that necessitated the constraint before attempting refactoring.',
        actionLabel: 'Audit Historical PR',
      },
    ],
  },

  'brooks-law': {
    hook: {
      premise: 'A flagship software project is 2 months behind schedule. Management hires 10 new senior engineers to get back on track.',
      intuition: 'Adding more workforce to a project with clear specifications should divide the remaining work and accelerate delivery.',
      twist: 'Fred Brooks demonstrated that adding manpower to a late software project makes it later! New hires require onboarding from existing seniors, while communication channels scale quadratically: n(n - 1)/2.',
    },
    takeaway: 'Engineering throughput is communication-bound, not headcount-bound: complex cognitive work cannot be divided linearly across human bodies.',
    challenges: [
      {
        id: 'quadratic-drag',
        title: 'Challenge 1: The Quadratic Communication Drag',
        prompt: 'Increase team headcount from 4 to 12 engineers. Watch pairwise communication channels explode from 6 to 66 links.',
        actionLabel: 'Add 8 Engineers',
      },
      {
        id: 'onboarding-drag',
        title: 'Challenge 2: Onboarding Drag vs Task Partitioning',
        prompt: 'Measure senior developer coding hours lost to training newcomers during the critical late-stage crunch.',
        actionLabel: 'Calculate Onboarding Penalty',
      },
    ],
  },

  'mobius-strip': {
    hook: {
      premise: 'Take a paper strip, give one end a half-twist of 180°, and tape the two ends together into a loop. How many sides and edges does it possess?',
      intuition: 'A standard paper loop has two distinct surfaces (an inside and an outside) and two separate boundary rims.',
      twist: 'An ant crawling along the centerline traverses the entire loop—covering both "front" and "back"—without ever crossing an edge! It has strictly ONE side, ONE boundary, and cutting down the center produces a single longer loop with 4 half-twists!',
    },
    takeaway: 'Twisting geometry changes global topology: local two-sidedness can invert into global non-orientability.',
    challenges: [
      {
        id: 'ant-traversal',
        title: 'Challenge 1: The 4π Ant Traversal',
        prompt: 'Trace the path of the ant across the surface. Verify that a continuous 4π (720°) circuit is required to return right-side up.',
        actionLabel: 'Trace Ant Traversal',
      },
      {
        id: 'midline-scissors',
        title: 'Challenge 2: The Midline Scissors Paradox',
        prompt: 'Bisect the strip along its center line. Observe how one continuous loop with 4 half-twists emerges instead of two separate loops.',
        actionLabel: 'Simulate Midline Cut',
      },
    ],
  },

  'vampire-tiles': {
    hook: {
      premise: 'Can a single geometric puzzle piece tile an infinite floor completely without gaps, but NEVER repeat its pattern periodically?',
      intuition: 'If you have only one identical tile shape, tiling a floor inevitably forces repeating grid rows, hexagons, or bricks.',
      twist: 'In 2023, mathematicians discovered "The Spectre"—an aperiodic monotile ("ein stein") that tiles an infinite plane strictly without repeating, and without needing its mirror reflection—earning it the title "The Vampire Tile"!',
    },
    takeaway: 'Deterministic local geometry can dictate infinite non-repeating order across the continuum without global periodic symmetry.',
    challenges: [
      {
        id: 'chiral-mirror-ban',
        title: 'Challenge 1: The Chiral Mirror Ban',
        prompt: 'Test the tiling constraints to verify that zero mirror-flipped tiles are needed to tile the infinite plane (the Vampire property).',
        actionLabel: 'Verify Zero Reflections',
      },
      {
        id: 'hierarchical-inflation',
        title: 'Challenge 2: Hierarchical Super-Tile Inflation',
        prompt: 'Zoom out through successive hierarchical inflation levels to observe the non-repeating quasicrystal lattice order.',
        actionLabel: 'Expand Inflation Depth',
      },
    ],
  },
};

/**
 * Returns pedagogical hook, challenges, and takeaway for a given concept slug.
 * Always returns a valid object even if slug is unknown.
 */
export function getConceptHook(slug) {
  if (CONCEPT_HOOKS[slug]) {
    return CONCEPT_HOOKS[slug];
  }

  // Sane default fallback
  return {
    hook: {
      premise: 'An intriguing thought experiment testing the boundaries of human intuition, logic, and physical reality.',
      intuition: 'Our common-sense assumptions usually predict a simple, straightforward linear outcome.',
      twist: 'Deeper mathematical, physical, or philosophical analysis reveals a surprising counter-intuitive truth.',
    },
    takeaway: 'Test your assumptions with empirical rigor; our cognitive shortcuts are often blind to systemic paradoxes.',
    challenges: [
      {
        id: 'explore-default',
        title: 'Explore the Interactive Lab',
        prompt: 'Interact with the simulator controls to observe the systemic trade-offs in real time.',
        actionLabel: 'Run Simulation',
      },
    ],
  };
}

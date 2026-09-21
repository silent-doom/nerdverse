/**
 * Pedagogical Hooks & Guided Challenges for all 20 concepts.
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

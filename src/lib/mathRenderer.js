/**
 * Math Formula Renderer for NerdVerse
 * Converts LaTeX mathematical expressions into clean, semantic, accessible HTML formulas.
 */

// Greek letter dictionary (lowercase & uppercase)
const GREEK_LETTERS = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\Gamma': 'Γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\epsilon': 'ε',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\vartheta': 'θ',
  '\\Theta': 'Θ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\Lambda': 'Λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\Xi': 'Ξ',
  '\\pi': 'π',
  '\\varpi': 'ϖ',
  '\\Pi': 'Π',
  '\\rho': 'ρ',
  '\\varrho': 'ϱ',
  '\\sigma': 'σ',
  '\\varsigma': 'ς',
  '\\Sigma': 'Σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\Upsilon': 'Υ',
  '\\phi': 'φ',
  '\\varphi': 'ϕ',
  '\\Phi': 'Φ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\Psi': 'Ψ',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
};

// Blackboard Bold Dictionary (R, C, Z, N, Q, etc.)
const BLACKBOARD_BOLD = {
  '\\mathbb{R}': 'ℝ',
  '\\mathbb{C}': 'ℂ',
  '\\mathbb{Z}': 'ℤ',
  '\\mathbb{N}': 'ℕ',
  '\\mathbb{Q}': 'ℚ',
  '\\mathbb{E}': '𝔼',
  '\\mathbb{P}': 'ℙ',
  '\\mathbb{H}': 'ℍ',
  '\\mathbb{F}': '𝔽',
};

// Math symbols & operators dictionary
const MATH_SYMBOLS = {
  '\\hbar': 'ℏ',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\infty': '∞',
  '\\approx': '≈',
  '\\sim': '∼',
  '\\propto': '∝',
  '\\ne': '≠',
  '\\neq': '≠',
  '\\le': '≤',
  '\\leq': '≤',
  '\\ge': '≥',
  '\\geq': '≥',
  '\\ll': '≪',
  '\\gg': '≫',
  '\\pm': '±',
  '\\mp': '∓',
  '\\times': '×',
  '\\cdot': '·',
  '\\circ': '∘',
  '\\bullet': '•',
  '\\to': '→',
  '\\leftarrow': '←',
  '\\rightarrow': '→',
  '\\leftrightarrow': '↔',
  '\\implies': '⟹',
  '\\iff': '⟺',
  '\\neg': '¬',
  '\\land': '∧',
  '\\lor': '∨',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\lfloor': '⌊',
  '\\rfloor': '⌋',
  '\\lceil': '⌈',
  '\\rceil': '⌉',
  '\\dots': '…',
  '\\cdots': '⋯',
  '\\ldots': '…',
  '\\quad': '&emsp;',
  '\\qquad': '&emsp;&emsp;',
  '\\,': '&thinsp;',
  '\\;': '&ensp;',
  '\\!': '',
};

/**
 * Format mathematical formula content into HTML.
 * @param {string} formula - LaTeX or math formula string.
 * @returns {string} HTML string representing the styled formula.
 */
export function formatFormula(formula) {
  if (!formula) return '';

  let out = formula;

  // 0. Delimiters first (\left(, \right), etc.) before symbol substitutions
  out = out.replace(/\\left\(/g, '<span class="math-delim">(</span>').replace(/\\right\)/g, '<span class="math-delim">)</span>');
  out = out.replace(/\\left\[/g, '<span class="math-delim">[</span>').replace(/\\right\]/g, '<span class="math-delim">]</span>');
  out = out.replace(/\\left\\\{/g, '<span class="math-delim">{</span>').replace(/\\right\\\}/g, '<span class="math-delim">}</span>');
  out = out.replace(/\\\{/g, '{').replace(/\\\}/g, '}');

  // 1a. Blackboard bold (\mathbb{R}, \mathbb{C}, etc.)
  out = out.replace(/\\mathbb\{([A-Za-z0-9]+)\}/g, (match, char) => {
    return BLACKBOARD_BOLD[`\\mathbb{${char}}`] || `<span class="math-bb">${char}</span>`;
  });

  // 1b. Vector and Hat notation (\vec{n}, \hat{n})
  out = out.replace(/\\vec\{([^{}]+)\}/g, '$1&#x20D7;');
  out = out.replace(/\\hat\{([^{}]+)\}/g, '$1&#x0302;');

  // 1c. Degree notation (^\circ, ^{\circ})
  out = out.replace(/\^\{\\circ\}/g, '°');
  out = out.replace(/\^\\circ/g, '°');

  // 1d. Text wrappers (\text{...}, \mathrm{...}, \mathbf{...}, \mathcal{...})
  out = out.replace(/\\mathbf\{([^}]+)\}/g, '<strong>$1</strong>');
  out = out.replace(/\\text\{([^}]+)\}/g, '<span class="math-text">$1</span>');
  out = out.replace(/\\mathrm\{([^}]+)\}/g, '<span class="math-text">$1</span>');
  out = out.replace(/\\mathcal\{([^}]+)\}/g, '<span class="math-cal">$1</span>');
  out = out.replace(/\\operatorname\{([^}]+)\}/g, '<span class="math-op">$1</span>');

  // 2. Fractions: \frac{num}{den} -> <span class="math-frac"><span class="math-num">num</span><span class="math-denom">den</span></span>
  let prev;
  let fracSafety = 0;
  while (out.includes('\\frac') && fracSafety < 5) {
    prev = out;
    out = out.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (match, num, den) => {
      return `<span class="math-frac"><span class="math-num">${num.trim()}</span><span class="math-denom">${den.trim()}</span></span>`;
    });
    if (out === prev) break;
    fracSafety++;
  }

  // 3. Square roots: \sqrt{...} or \sqrt[n]{...}
  let sqrtSafety = 0;
  while (out.includes('\\sqrt') && sqrtSafety < 5) {
    prev = out;
    out = out.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, (match, n, radicand) => {
      return `<span class="math-sqrt"><sup class="math-root-n">${n}</sup><span class="math-radicand">${radicand}</span></span>`;
    });
    out = out.replace(/\\sqrt\{([^{}]+)\}/g, (match, radicand) => {
      return `<span class="math-sqrt"><span class="math-radicand">${radicand}</span></span>`;
    });
    if (out === prev) break;
    sqrtSafety++;
  }

  // 4. Large Operators with Sub/Superscripts (Limits, Sums, Integrals)
  out = out.replace(/\\sum_\{([^{}]+)\}\^(\\{0,1}[a-zA-Z0-9]+|\{[^{}]+\})/g, (match, sub, sup) => {
    let cleanSup = sup.startsWith('{') ? sup.slice(1, -1) : sup;
    if (cleanSup === '\\infty') cleanSup = '∞';
    return `<span class="math-big-op"><span class="math-op-sup">${cleanSup}</span><span class="math-op-sym">Σ</span><span class="math-op-sub">${sub}</span></span>`;
  });
  out = out.replace(/\\sum_\{([^{}]+)\}/g, (match, sub) => {
    return `<span class="math-big-op"><span class="math-op-sym">Σ</span><span class="math-op-sub">${sub}</span></span>`;
  });
  out = out.replace(/\\sum(?![a-zA-Z])/g, '<span class="math-symbol">Σ</span>');

  out = out.replace(/\\int_\{([^{}]+)\}\^(\\{0,1}[a-zA-Z0-9]+|\{[^{}]+\})/g, (match, sub, sup) => {
    let cleanSup = sup.startsWith('{') ? sup.slice(1, -1) : sup;
    if (cleanSup === '\\infty') cleanSup = '∞';
    return `<span class="math-big-op"><span class="math-op-sup">${cleanSup}</span><span class="math-op-sym">∫</span><span class="math-op-sub">${sub}</span></span>`;
  });
  out = out.replace(/\\int(?![a-zA-Z])/g, '<span class="math-symbol">∫</span>');

  out = out.replace(/\\lim_\{([^{}]+)\}/g, (match, sub) => {
    const cleanSub = sub.replace(/\\to/g, '→').replace(/\\infty/g, '∞');
    return `<span class="math-big-op"><span class="math-op-text">lim</span><span class="math-op-sub">${cleanSub}</span></span>`;
  });

  // 5. Greek Letters (word boundary protected)
  const sortedGreek = Object.entries(GREEK_LETTERS).sort((a, b) => b[0].length - a[0].length);
  for (const [tex, sym] of sortedGreek) {
    const escaped = tex.replace('\\', '\\\\');
    out = out.replace(new RegExp(escaped + '(?![a-zA-Z])', 'g'), `<span class="math-symbol">${sym}</span>`);
  }

  // 6. Math Symbols & Operators (sorted by length to prevent partial prefix replacements)
  const sortedSymbols = Object.entries(MATH_SYMBOLS).sort((a, b) => b[0].length - a[0].length);
  for (const [tex, sym] of sortedSymbols) {
    const escaped = tex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = /^[a-zA-Z\\]+$/.test(tex) ? escaped + '(?![a-zA-Z])' : escaped;
    out = out.replace(new RegExp(pattern, 'g'), `<span class="math-operator">${sym}</span>`);
  }

  // 7. Math functions (\sin, \cos, \tan, \ln, \log, \det, \exp, \max, \min)
  out = out.replace(/\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|ln|log|exp|det|max|min)(?![a-zA-Z])/g, '<span class="math-func">$1</span>');

  // 8. Exponents and Subscripts
  let expSafety = 0;
  while (out.includes('^{') && expSafety < 5) {
    prev = out;
    out = out.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
    if (out === prev) break;
    expSafety++;
  }
  out = out.replace(/\^([0-9a-zA-Z+-]+)(?![^<]*>)/g, '<sup>$1</sup>');

  let subSafety = 0;
  while (out.includes('_{') && subSafety < 5) {
    prev = out;
    out = out.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
    if (out === prev) break;
    subSafety++;
  }
  out = out.replace(/_([0-9a-zA-Z+-]+)(?![^<]*>)/g, '<sub>$1</sub>');

  out = out.replace(/\\\\/g, ' ');

  return out;
}

/**
 * Parses markdown text and processes mathematical formulas and leaked LaTeX notation.
 * @param {string} text - The input markdown text.
 * @returns {string} Processed HTML string.
 */
export function renderMathInMarkdown(text) {
  if (!text) return '';

  let res = text;

  // 1. Process Display Math: $$ ... $$
  res = res.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    return `<div class="math-display">${formatFormula(formula.trim())}</div>`;
  });

  // 2. Protect standalone currency amounts (e.g. $1.00, $50, $1,000) so they don't pair up as math
  res = res.replace(/(^|\s)\$(\d+(?:,\d+)*(?:\.\d+)?)(?=\s|[.,;:!)]|$)/g, '$1__CURRENCY_DOLLAR__$2');

  // 3. Process Inline Math: $ ... $
  res = res.replace(/(^|[^\\])\$([^\$\n]+?)\$(?!\$)/g, (match, prefix, formula) => {
    return `${prefix}<span class="math-inline">${formatFormula(formula.trim())}</span>`;
  });

  // Restore protected currency amounts
  res = res.replace(/__CURRENCY_DOLLAR__/g, '$');

  // 3. Catch raw leaked LaTeX commands that appear outside of $ ... $
  res = res.replace(/\\mathbb\{([A-Za-z0-9]+)\}/g, (match, char) => {
    return BLACKBOARD_BOLD[`\\mathbb{${char}}`] || `<span class="math-bb">${char}</span>`;
  });

  res = res.replace(/\\vec\{([^{}]+)\}/g, '$1&#x20D7;');
  res = res.replace(/\\hat\{([^{}]+)\}/g, '$1&#x0302;');
  res = res.replace(/\^\{\\circ\}/g, '°');
  res = res.replace(/\^\\circ/g, '°');
  res = res.replace(/\\circ(?![a-zA-Z])/g, '°');

  for (const [tex, sym] of Object.entries(GREEK_LETTERS)) {
    const escaped = tex.replace('\\', '\\\\');
    res = res.replace(new RegExp(escaped + '(?![a-zA-Z])', 'g'), `<span class="math-symbol">${sym}</span>`);
  }

  for (const [tex, sym] of Object.entries(MATH_SYMBOLS)) {
    if (['\\hbar', '\\infty', '\\approx', '\\ge', '\\le', '\\cdot', '\\times', '\\to', '\\pm', '\\in', '\\subset', '\\subseteq', '\\chi'].includes(tex)) {
      const escaped = tex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      res = res.replace(new RegExp(escaped, 'g'), `<span class="math-operator">${sym}</span>`);
    }
  }

  // 4. Standard Markdown formatting
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  res = res.replace(/`([^`]+)`/g, '<code>$1</code>');

  return res;
}

/**
 * Format display formula text for the "Formal Math & Logic" tab.
 * @param {string} raw - Raw formula block text.
 * @returns {string} Rendered formula HTML.
 */
export function cleanDisplayFormula(raw) {
  if (!raw) return '';
  const stripped = raw.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '').trim();
  return formatFormula(stripped);
}

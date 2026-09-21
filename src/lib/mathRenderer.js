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

  // 1. Text wrappers (\text{...}, \mathrm{...}, \mathbf{...})
  out = out.replace(/\\mathbf\{([^}]+)\}/g, '<strong>$1</strong>');
  out = out.replace(/\\text\{([^}]+)\}/g, '<span class="math-text">$1</span>');
  out = out.replace(/\\mathrm\{([^}]+)\}/g, '<span class="math-text">$1</span>');
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
  out = out.replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, '<span class="math-big-op">Σ<sub class="math-limits">$1</sub><sup class="math-limits">$2</sup></span>');
  out = out.replace(/\\sum_\{([^{}]+)\}/g, '<span class="math-big-op">Σ<sub class="math-limits">$1</sub></span>');
  out = out.replace(/\\sum/g, '<span class="math-symbol">Σ</span>');

  out = out.replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, '<span class="math-big-op">∫<sub class="math-limits">$1</sub><sup class="math-limits">$2</sup></span>');
  out = out.replace(/\\int/g, '<span class="math-symbol">∫</span>');

  out = out.replace(/\\lim_\{([^{}]+)\}/g, '<span class="math-big-op">lim<sub class="math-limits">$1</sub></span>');

  // 5. Greek Letters
  for (const [tex, sym] of Object.entries(GREEK_LETTERS)) {
    const escaped = tex.replace('\\', '\\\\');
    out = out.replace(new RegExp(escaped + '(?![a-zA-Z])', 'g'), `<span class="math-symbol">${sym}</span>`);
  }

  // 6. Math Symbols & Operators
  for (const [tex, sym] of Object.entries(MATH_SYMBOLS)) {
    const escaped = tex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'g'), `<span class="math-operator">${sym}</span>`);
  }

  // 7. Math functions (\sin, \cos, \tan, \ln, \log, \det, \exp, \max, \min)
  out = out.replace(/\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|ln|log|exp|det|max|min)(?![a-zA-Z])/g, '<span class="math-func">$1</span>');

  // 8. Delimiters (\left(, \right), etc.)
  out = out.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  out = out.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  out = out.replace(/\\left\\\{/g, '{').replace(/\\right\\\}/g, '}');
  out = out.replace(/\\\{/g, '{').replace(/\\\}/g, '}');

  // 9. Exponents and Subscripts
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
  for (const [tex, sym] of Object.entries(GREEK_LETTERS)) {
    const escaped = tex.replace('\\', '\\\\');
    res = res.replace(new RegExp(escaped + '(?![a-zA-Z])', 'g'), `<span class="math-symbol">${sym}</span>`);
  }

  for (const [tex, sym] of Object.entries(MATH_SYMBOLS)) {
    if (['\\hbar', '\\infty', '\\approx', '\\ge', '\\le', '\\cdot', '\\times', '\\to', '\\pm'].includes(tex)) {
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

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
  '\\supset': '⊃',
  '\\supseteq': '⊇',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\lfloor': '⌊',
  '\\rfloor': '⌋',
  '\\lceil': '⌈',
  '\\rceil': '⌉',
  '\\dots': '…',
  '\\cdots': '⋯',
  '\\ldots': '…',
  '\\vdots': '⋮',
  '\\ddots': '⋱',
  '\\quad': '&emsp;',
  '\\qquad': '&emsp;&emsp;',
  '\\,': '&thinsp;',
  '\\;': '&ensp;',
  '\\!': '',
};

/**
 * Extracts balanced curly brace group content: { ... }
 */
function extractBraceArg(str, startIndex) {
  if (startIndex >= str.length || str[startIndex] !== '{') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(startIndex + 1, i),
          endIndex: i,
        };
      }
    }
  }
  return null;
}

/**
 * Extracts balanced square bracket group content: [ ... ]
 */
function extractBracketArg(str, startIndex) {
  if (startIndex >= str.length || str[startIndex] !== '[') return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '[') depth++;
    else if (str[i] === ']') {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(startIndex + 1, i),
          endIndex: i,
        };
      }
    }
  }
  return null;
}

/**
 * Parses LaTeX \frac{num}{den} supporting arbitrary nesting
 */
function parseFractions(str) {
  let out = str;
  let idx = 0;
  while ((idx = out.indexOf('\\frac')) !== -1) {
    let b1 = idx + 5;
    while (b1 < out.length && out[b1] === ' ') b1++;
    const arg1 = extractBraceArg(out, b1);
    if (!arg1) break;
    let b2 = arg1.endIndex + 1;
    while (b2 < out.length && out[b2] === ' ') b2++;
    const arg2 = extractBraceArg(out, b2);
    if (!arg2) break;

    const formattedNum = formatFormula(arg1.content);
    const formattedDen = formatFormula(arg2.content);
    const replacement = `<span class="math-frac"><span class="math-num">${formattedNum}</span><span class="math-denom">${formattedDen}</span></span>`;
    out = out.slice(0, idx) + replacement + out.slice(arg2.endIndex + 1);
  }
  return out;
}

/**
 * Parses LaTeX \sqrt{radicand} and \sqrt[n]{radicand} supporting nesting
 */
function parseSquareRoots(str) {
  let out = str;
  let idx = 0;
  while ((idx = out.indexOf('\\sqrt')) !== -1) {
    let nextIdx = idx + 5;
    while (nextIdx < out.length && out[nextIdx] === ' ') nextIdx++;
    let rootN = null;
    if (out[nextIdx] === '[') {
      const opt = extractBracketArg(out, nextIdx);
      if (opt) {
        rootN = opt.content;
        nextIdx = opt.endIndex + 1;
        while (nextIdx < out.length && out[nextIdx] === ' ') nextIdx++;
      }
    }
    const arg = extractBraceArg(out, nextIdx);
    if (!arg) break;

    const formattedRad = formatFormula(arg.content);
    const replacement = rootN
      ? `<span class="math-sqrt"><sup class="math-root-n">${rootN}</sup><span class="math-radicand">${formattedRad}</span></span>`
      : `<span class="math-sqrt"><span class="math-radicand">${formattedRad}</span></span>`;
    out = out.slice(0, idx) + replacement + out.slice(arg.endIndex + 1);
  }
  return out;
}

/**
 * Format mathematical formula content into HTML.
 * @param {string} formula - LaTeX or math formula string.
 * @returns {string} HTML string representing the styled formula.
 */
export function formatFormula(formula) {
  if (!formula) return '';

  let out = formula;

  // Unescape \$ to $
  out = out.replace(/\\\$/g, '$');

  // Normalize any double-escaped backslashes before commands
  out = out.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  // Delimiters: floor, ceil, parens, brackets, braces, norm
  out = out
    .replace(/\\left\\lfloor/g, '<span class="math-delim">⌊</span>')
    .replace(/\\right\\rfloor/g, '<span class="math-delim">⌋</span>')
    .replace(/\\left\\lceil/g, '<span class="math-delim">⌈</span>')
    .replace(/\\right\\rceil/g, '<span class="math-delim">⌉</span>')
    .replace(/\\left\(/g, '<span class="math-delim">(</span>')
    .replace(/\\right\)/g, '<span class="math-delim">)</span>')
    .replace(/\\left\[/g, '<span class="math-delim">[</span>')
    .replace(/\\right\]/g, '<span class="math-delim">]</span>')
    .replace(/\\left\|/g, '<span class="math-delim">|</span>')
    .replace(/\\right\|/g, '<span class="math-delim">|</span>')
    .replace(/\\left\\\{/g, '<span class="math-delim">{</span>')
    .replace(/\\right\\\}/g, '<span class="math-delim">}</span>')
    .replace(/\\left\{/g, '<span class="math-delim">{</span>')
    .replace(/\\right\}/g, '<span class="math-delim">}</span>')
    .replace(/\\left\./g, '')
    .replace(/\\right\./g, '')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\left(?![a-zA-Z])/g, '')
    .replace(/\\right(?![a-zA-Z])/g, '');

  // Blackboard bold (\mathbb{R}, \mathbb{C}, etc.)
  out = out.replace(/\\mathbb\{([A-Za-z0-9]+)\}/g, (match, char) => {
    return BLACKBOARD_BOLD[`\\mathbb{${char}}`] || `<span class="math-bb">${char}</span>`;
  });

  // Vector and Hat notation (\vec{n}, \hat{n})
  out = out.replace(/\\vec\{([^{}]+)\}/g, '$1&#x20D7;');
  out = out.replace(/\\hat\{([^{}]+)\}/g, '$1&#x0302;');

  // Degree notation (^\circ, ^{\circ})
  out = out.replace(/\^\{\\circ\}/g, '°').replace(/\^\\circ/g, '°');

  // Text commands
  out = out.replace(/\\mathbf\{([^}]+)\}/g, '<strong>$1</strong>');
  out = out.replace(/\\text\{([^}]+)\}/g, '<span class="math-text">$1</span>');
  out = out.replace(/\\mathrm\{([^}]+)\}/g, '<span class="math-text">$1</span>');
  out = out.replace(/\\mathcal\{([^}]+)\}/g, '<span class="math-cal">$1</span>');
  out = out.replace(/\\operatorname\{([^}]+)\}/g, '<span class="math-op">$1</span>');

  // Fractions with balanced braces
  out = parseFractions(out);

  // Square roots with balanced braces
  out = parseSquareRoots(out);

  // Large Operators with Sub/Superscripts (Limits, Sums, Integrals)
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

  // Greek Letters (word boundary protected)
  const sortedGreek = Object.entries(GREEK_LETTERS).sort((a, b) => b[0].length - a[0].length);
  for (const [tex, sym] of sortedGreek) {
    const escaped = tex.replace('\\', '\\\\');
    out = out.replace(new RegExp(escaped + '(?![a-zA-Z])', 'g'), `<span class="math-symbol">${sym}</span>`);
  }

  // Math Symbols & Operators (word boundary protected for alphanumeric words)
  const sortedSymbols = Object.entries(MATH_SYMBOLS).sort((a, b) => b[0].length - a[0].length);
  for (const [tex, sym] of sortedSymbols) {
    const escaped = tex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = /^[a-zA-Z\\]+$/.test(tex) ? escaped + '(?![a-zA-Z])' : escaped;
    out = out.replace(new RegExp(pattern, 'g'), `<span class="math-operator">${sym}</span>`);
  }

  // Math functions (\sin, \cos, \tan, \ln, \log, \det, \exp, \max, \min)
  out = out.replace(/\\(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|ln|log|exp|det|max|min)(?![a-zA-Z])/g, '<span class="math-func">$1</span>');

  // Exponents and Subscripts
  let expSafety = 0;
  while (out.includes('^{') && expSafety < 5) {
    let prev = out;
    out = out.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
    if (out === prev) break;
    expSafety++;
  }
  out = out.replace(/\^([0-9a-zA-Z+-]+)(?![^<]*>)/g, '<sup>$1</sup>');

  let subSafety = 0;
  while (out.includes('_{') && subSafety < 5) {
    let prev = out;
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

  // 1. Deliberately protect literal currency amounts (e.g. $1.00, $50, $1,000) using unicode private area
  res = res.replace(/(^|\s)\$(\d+(?:,\d+)*(?:\.\d+)?)(?=\s|[.,;:!)]|$)/g, '$1\uE000$2');
  // Also protect escaped dollar \$
  res = res.replace(/\\\$/g, '\uE001');

  // 2. Process Display Math: $$ ... $$
  res = res.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    return `<div class="math-display">${formatFormula(formula.trim())}</div>`;
  });

  // 3. Process Inline Math: $ ... $
  res = res.replace(/(^|[^\\])\$([^\$\n]+?)\$(?!\$)/g, (match, prefix, formula) => {
    return `${prefix}<span class="math-inline">${formatFormula(formula.trim())}</span>`;
  });

  // 4. Restore protected currency amounts
  res = res.replace(/\uE000/g, '$');
  res = res.replace(/\uE001/g, '$');

  // 5. Catch raw leaked LaTeX commands that appear outside of $ ... $
  res = parseFractions(res);
  res = parseSquareRoots(res);

  res = res.replace(/\\mathbb\{([A-Za-z0-9]+)\}/g, (match, char) => {
    return BLACKBOARD_BOLD[`\\mathbb{${char}}`] || `<span class="math-bb">${char}</span>`;
  });

  res = res.replace(/\\vec\{([^{}]+)\}/g, '$1&#x20D7;');
  res = res.replace(/\\hat\{([^{}]+)\}/g, '$1&#x0302;');
  res = res.replace(/\^\{\\circ\}/g, '°').replace(/\^\\circ/g, '°').replace(/\\circ(?![a-zA-Z])/g, '°');

  for (const [tex, sym] of Object.entries(GREEK_LETTERS)) {
    const escaped = tex.replace('\\', '\\\\');
    res = res.replace(new RegExp(escaped + '(?![a-zA-Z])', 'g'), `<span class="math-symbol">${sym}</span>`);
  }

  for (const [tex, sym] of Object.entries(MATH_SYMBOLS)) {
    if (['\\hbar', '\\infty', '\\approx', '\\ge', '\\leq', '\\le', '\\geq', '\\cdot', '\\times', '\\to', '\\pm', '\\in', '\\notin', '\\subset', '\\subseteq', '\\chi'].includes(tex)) {
      const escaped = tex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = /^[a-zA-Z\\]+$/.test(tex) ? escaped + '(?![a-zA-Z])' : escaped;
      res = res.replace(new RegExp(pattern, 'g'), `<span class="math-operator">${sym}</span>`);
    }
  }

  // Clean up any remaining stray \left / \right
  res = res.replace(/\\left(?![a-zA-Z])/g, '').replace(/\\right(?![a-zA-Z])/g, '');

  // 6. Standard Markdown formatting
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

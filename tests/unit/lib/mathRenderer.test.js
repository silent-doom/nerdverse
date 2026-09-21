import { describe, it, expect } from 'vitest';
import { formatFormula, renderMathInMarkdown, cleanDisplayFormula } from '@/lib/mathRenderer';

describe('mathRenderer', () => {
  describe('formatFormula', () => {
    it('converts Greek letters to symbols', () => {
      expect(formatFormula('\\pi')).toContain('π');
      expect(formatFormula('\\theta')).toContain('θ');
      expect(formatFormula('\\sigma')).toContain('σ');
      expect(formatFormula('\\mu')).toContain('μ');
      expect(formatFormula('\\Delta')).toContain('Δ');
      expect(formatFormula('\\alpha + \\beta = \\gamma')).toContain('α');
      expect(formatFormula('\\alpha + \\beta = \\gamma')).toContain('β');
      expect(formatFormula('\\alpha + \\beta = \\gamma')).toContain('γ');
    });

    it('formats fractions into semantic fractions', () => {
      const result = formatFormula('\\frac{1}{2}');
      expect(result).toContain('math-frac');
      expect(result).toContain('1');
      expect(result).toContain('2');
    });

    it('formats square roots with radicands', () => {
      const result = formatFormula('\\sqrt{L/g}');
      expect(result).toContain('math-sqrt');
      expect(result).toContain('L/g');
    });

    it('formats exponents and subscripts', () => {
      expect(formatFormula('e^{i\\pi}')).toContain('<sup>');
      expect(formatFormula('e^{i\\pi}')).toContain('π');
      expect(formatFormula('x^2 + y^2 = 2E')).toContain('<sup>2</sup>');
      expect(formatFormula('x_1 + x_2')).toContain('<sub>1</sub>');
      expect(formatFormula('x_1 + x_2')).toContain('<sub>2</sub>');
    });

    it('formats comparison and arithmetic operators', () => {
      expect(formatFormula('\\Delta x \\Delta p \\ge \\hbar / 2')).toContain('Δ');
      expect(formatFormula('\\Delta x \\Delta p \\ge \\hbar / 2')).toContain('≥');
      expect(formatFormula('\\Delta x \\Delta p \\ge \\hbar / 2')).toContain('ℏ');
      expect(formatFormula('a \\le b \\approx c \\ne d')).toContain('≤');
      expect(formatFormula('a \\le b \\approx c \\ne d')).toContain('≈');
      expect(formatFormula('a \\le b \\approx c \\ne d')).toContain('≠');
    });

    it('formats mathematical functions without slashes', () => {
      expect(formatFormula('\\cos(x) + i \\sin(x)')).toContain('cos');
      expect(formatFormula('\\cos(x) + i \\sin(x)')).toContain('sin');
      expect(formatFormula('\\cos(x) + i \\sin(x)')).not.toContain('\\cos');
      expect(formatFormula('\\cos(x) + i \\sin(x)')).not.toContain('\\sin');
    });

    it('formats sums and limits with limits', () => {
      const sumResult = formatFormula('\\sum_{k=0}^{\\infty} \\frac{1}{k!}');
      expect(sumResult).toContain('Σ');
      expect(sumResult).toContain('∞');
      expect(sumResult).toContain('k=0');

      const limResult = formatFormula('\\lim_{n \\to \\infty}');
      expect(limResult).toContain('lim');
      expect(limResult).toContain('→');
      expect(limResult).toContain('∞');
    });
  });

  describe('renderMathInMarkdown', () => {
    it('converts display math blocks $$ ... $$ into math-display containers', () => {
      const text = '$$\\frac{1}{2} M V^2 + \\frac{1}{2} m v^2 = E$$';
      const rendered = renderMathInMarkdown(text);
      expect(rendered).toContain('class="math-display"');
      expect(rendered).toContain('math-frac');
    });

    it('converts inline math $ ... $ into math-inline containers', () => {
      const text = 'Formula ($T = 2\\pi \\sqrt{L/g}$) governs pendulums.';
      const rendered = renderMathInMarkdown(text);
      expect(rendered).toContain('class="math-inline"');
      expect(rendered).toContain('π');
      expect(rendered).toContain('math-sqrt');
      expect(rendered).not.toContain('\\pi');
      expect(rendered).not.toContain('\\sqrt');
    });

    it('catches leaked LaTeX Greek symbols in headings and body text outside of $', () => {
      const heading = 'The Revolution of \\pi: The Universal Nexus';
      const rendered = renderMathInMarkdown(heading);
      expect(rendered).toContain('π');
      expect(rendered).not.toContain('\\pi');
    });

    it('preserves plain currency amounts with single dollar signs', () => {
      const text = 'Deposit $1.00 into a bank account with $50 bonus.';
      const rendered = renderMathInMarkdown(text);
      expect(rendered).toContain('$1.00');
      expect(rendered).toContain('$50');
      expect(rendered).not.toContain('class="math-inline"');
    });

    it('renders complex Euler and normal distribution equations cleanly', () => {
      const euler = '$e^{i\\pi} + 1 = 0$';
      const renderedEuler = renderMathInMarkdown(euler);
      expect(renderedEuler).toContain('class="math-inline"');
      expect(renderedEuler).toContain('π');
      expect(renderedEuler).toContain('<sup>');

      const normalDist = 'Distribution $\\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-(x-\\mu)^2/2\\sigma^2}$';
      const renderedNormal = renderMathInMarkdown(normalDist);
      expect(renderedNormal).toContain('σ');
      expect(renderedNormal).toContain('μ');
      expect(renderedNormal).toContain('π');
      expect(renderedNormal).toContain('math-sqrt');
      expect(renderedNormal).not.toContain('\\sigma');
      expect(renderedNormal).not.toContain('\\mu');
    });
  });

  describe('cleanDisplayFormula', () => {
    it('strips $$ wrappers and formats formula cleanly', () => {
      const raw = '$$e^{i\\pi} + 1 = 0$$';
      const cleaned = cleanDisplayFormula(raw);
      expect(cleaned).not.toContain('$$');
      expect(cleaned).toContain('π');
      expect(cleaned).toContain('<sup>');
    });
  });
});

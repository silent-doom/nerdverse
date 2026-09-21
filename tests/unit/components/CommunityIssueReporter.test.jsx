import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityPage from '@/app/community/page';

describe('Community Issue Desk & RFC Builder', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    window.open = vi.fn();
  });

  it('renders the Issue Desk workspace by default', () => {
    render(<CommunityPage />);

    expect(screen.getByText(/NerdVerse Issue Desk: Raise a GitHub Issue/i)).toBeInTheDocument();
    expect(screen.getByTestId('issue-category-select')).toBeInTheDocument();
    expect(screen.getByTestId('issue-page-select')).toBeInTheDocument();
    expect(screen.getByTestId('issue-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-github-issue-btn')).toBeInTheDocument();
    expect(screen.getByTestId('copy-issue-btn')).toBeInTheDocument();
  });

  it('allows switching categories and pages', () => {
    render(<CommunityPage />);

    const categorySelect = screen.getByTestId('issue-category-select');
    fireEvent.change(categorySelect, { target: { value: 'bug' } });
    expect(categorySelect.value).toBe('bug');

    const pageSelect = screen.getByTestId('issue-page-select');
    fireEvent.change(pageSelect, { target: { value: '/explore' } });
    expect(pageSelect.value).toBe('/explore');
  });

  it('supports custom page URL input when custom is selected', () => {
    render(<CommunityPage />);

    const pageSelect = screen.getByTestId('issue-page-select');
    fireEvent.change(pageSelect, { target: { value: 'custom' } });

    const customInput = screen.getByPlaceholderText(/e\.g\. \/concepts\/your-concept/i);
    expect(customInput).toBeInTheDocument();
    fireEvent.change(customInput, { target: { value: '/concepts/quantum-entanglement' } });
    expect(customInput.value).toBe('/concepts/quantum-entanglement');
  });

  it('copies formatted issue markdown template to clipboard', async () => {
    render(<CommunityPage />);

    const titleInput = screen.getByTestId('issue-title-input');
    fireEvent.change(titleInput, { target: { value: 'Formula symbol pi leaking as raw LaTeX' } });

    const copyBtn = screen.getByTestId('copy-issue-btn');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('Formula symbol pi leaking as raw LaTeX');
    expect(copiedText).toContain('Steps to Reproduce');
    expect(copiedText).toContain('Expected Behavior');
  });

  it('opens GitHub issue creation URL with pre-populated parameters', () => {
    render(<CommunityPage />);

    const titleInput = screen.getByTestId('issue-title-input');
    fireEvent.change(titleInput, { target: { value: 'Typo in Euler Proof' } });

    const submitBtn = screen.getByTestId('submit-github-issue-btn');
    fireEvent.click(submitBtn);

    expect(window.open).toHaveBeenCalled();
    const openedUrl = window.open.mock.calls[0][0];
    expect(openedUrl).toContain('https://github.com/silent-doom/nerdverse/issues/new');
    expect(openedUrl).toContain('title=');
    expect(openedUrl).toContain('body=');
  });

  it('allows toggling between Issue Desk and Concept RFC Builder', () => {
    render(<CommunityPage />);

    const rfcTabBtn = screen.getByRole('tab', { name: /Propose New Concept/i });
    fireEvent.click(rfcTabBtn);

    expect(screen.getByText(/Propose a New Thought Experiment \(RFC Builder\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Levinthal's Paradox/i)).toBeInTheDocument();

    const issueTabBtn = screen.getByRole('tab', { name: /Report an Issue/i });
    fireEvent.click(issueTabBtn);

    expect(screen.getByText(/NerdVerse Issue Desk: Raise a GitHub Issue/i)).toBeInTheDocument();
  });
});

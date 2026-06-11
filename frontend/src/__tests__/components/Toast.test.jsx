import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from '../../components/Toast';

describe('Toast', () => {
  it('renders success message', () => {
    render(<Toast message="Sucesso!" type="success" onClose={() => {}} />);
    expect(screen.getByText('Sucesso!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Toast message="Erro!" type="error" onClose={() => {}} />);
    expect(screen.getByText('Erro!')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('calls onClose after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Auto close" type="success" onClose={onClose} duration={2000} />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast message="Manual close" type="success" onClose={onClose} />);
    screen.getByText('×').click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

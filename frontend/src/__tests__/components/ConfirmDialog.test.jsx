import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDialog from '../../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders title and message', () => {
    render(<ConfirmDialog title="Título" message="Mensagem" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Mensagem')).toBeInTheDocument();
  });

  it('calls onConfirm when Confirmar is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog title="Título" message="Mensagem" onConfirm={onConfirm} onCancel={onCancel} />);
    screen.getByText('Confirmar').click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancelar is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog title="Título" message="Mensagem" onConfirm={onConfirm} onCancel={onCancel} />);
    screen.getByText('Cancelar').click();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onCancel when overlay is clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog title="Título" message="Mensagem" onConfirm={() => {}} onCancel={onCancel} />);
    screen.getByText('Mensagem').parentElement.parentElement.click();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

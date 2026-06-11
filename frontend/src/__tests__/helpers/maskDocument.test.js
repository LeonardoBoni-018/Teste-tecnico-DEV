import { describe, it, expect } from 'vitest';

function maskDocument(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 11) {
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  }
  return cleaned
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18);
}

describe('maskDocument', () => {
  it('formats raw CPF digits', () => {
    expect(maskDocument('52998224725')).toBe('529.982.247-25');
  });

  it('formats CPF with partial input', () => {
    expect(maskDocument('529')).toBe('529');
    expect(maskDocument('5299')).toBe('529.9');
    expect(maskDocument('529982')).toBe('529.982');
    expect(maskDocument('5299822')).toBe('529.982.2');
  });

  it('formats raw CNPJ digits', () => {
    expect(maskDocument('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('formats CNPJ with partial input (uses CPF branch until > 11 chars)', () => {
    expect(maskDocument('11')).toBe('11');
    expect(maskDocument('11222')).toBe('112.22');
    expect(maskDocument('11222333')).toBe('112.223.33');
    expect(maskDocument('112223330001')).toBe('11.222.333/0001');
  });

  it('strips non-digit characters', () => {
    expect(maskDocument('529.982.247-25')).toBe('529.982.247-25');
    expect(maskDocument('11.222.333/0001-81')).toBe('11.222.333/0001-81');
  });

  it('applies CNPJ mask when input exceeds 11 digits', () => {
    expect(maskDocument('11222333000181')).toBe('11.222.333/0001-81');
  });
});

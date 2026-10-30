export const parseProductPrice = (value: string | null | undefined): number | null => {
  const normalized = String(value ?? '')
    .trim()
    .replace(',', '.');
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
};

export const toProductPriceInput = (value: number | string | null | undefined): string => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toFixed(2);
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return '';
};

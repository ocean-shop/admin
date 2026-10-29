import { SHOPS_TEXTS } from '../constants/shops.constants';
import {
  extractShopItems,
  formatShopCreatedBadge,
  mapShop,
  mapShopOptions,
  mapShopsResponse,
  mapShopToCard,
} from './shop-mapping.helper';

describe('shop-mapping.helper', () => {
  it('extracts items from every known envelope and from bare arrays', () => {
    const item = { id: '1' };

    expect(extractShopItems([item])).toEqual([item]);
    expect(extractShopItems({ items: [item] })).toEqual([item]);
    expect(extractShopItems({ shops: [item] })).toEqual([item]);
    expect(extractShopItems({ data: [item] })).toEqual([item]);
    expect(extractShopItems({})).toEqual([]);
  });

  it('maps a shop with trimmed values and fallbacks', () => {
    expect(mapShop({ id: 5, name: ' Ocean ', created: '2026-01-01T10:00:00Z' })).toEqual({
      id: '5',
      name: 'Ocean',
      description: '',
      url: '',
      createdAt: '2026-01-01T10:00:00Z',
    });
    expect(mapShop({}).id).toBeTruthy();
  });

  it('maps the list response with normalized pagination', () => {
    expect(mapShopsResponse([{ id: '1', name: 'A' }], { page: 1, limit: 10 })).toMatchObject({
      items: [{ id: '1', name: 'A' }],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(
      mapShopsResponse({ items: [], total: 30, page: 2, limit: 10 }, { page: 1, limit: 10 }),
    ).toMatchObject({ page: 2, total: 30, totalPages: 3 });
  });

  it('formats the created badge and skips invalid dates', () => {
    expect(formatShopCreatedBadge('2026-01-01T10:00:00Z')).toBe(
      `${SHOPS_TEXTS.CREATED_BADGE_PREFIX} 2026-01-01`,
    );
    expect(formatShopCreatedBadge('')).toBe('');
    expect(formatShopCreatedBadge('not-a-date')).toBe('');
  });

  it('maps a shop to an entity card', () => {
    expect(
      mapShopToCard({ id: '1', name: 'A', description: 'B', url: 'C', createdAt: '' }),
    ).toEqual({ id: '1', title: 'A', subtitle: 'B', detail: 'C', badge: '' });
  });

  it('builds unique, sorted shop options with fallback labels', () => {
    expect(
      mapShopOptions([
        { id: '2', name: 'Beta' },
        { id: '1', name: 'Alpha' },
        { id: '2' },
        { id: '' },
        { id: 3 },
      ]),
    ).toEqual([
      { value: '1', label: 'Alpha' },
      { value: '2', label: `${SHOPS_TEXTS.OPTION_FALLBACK_PREFIX} 2` },
      { value: '3', label: `${SHOPS_TEXTS.OPTION_FALLBACK_PREFIX} 3` },
    ]);
  });
});

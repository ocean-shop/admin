import { HOME_METRIC_PENDING_ICON, HOME_TEXTS } from '../constants/home.constants';
import { buildShopOverviewCard, mapAdminShopsToCards } from './home-shop-cards.helper';

describe('home-shop-cards.helper', () => {
  it('builds a card with placeholder metrics and a fallback title', () => {
    const card = buildShopOverviewCard({ id: 's1', name: '' });

    expect(card.shopId).toBe('s1');
    expect(card.title).toBe(`${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} s1`);
    expect(card.actionLabel).toBe(HOME_TEXTS.MANAGE_SHOP_LABEL);
    expect(card.metrics.map((metric) => metric.value)).toEqual([
      HOME_TEXTS.METRIC_EMPTY_VALUE,
      HOME_TEXTS.METRIC_EMPTY_VALUE,
    ]);
    expect(card.metrics[0].helperIcon).toBe(HOME_METRIC_PENDING_ICON);
  });

  it('maps, deduplicates and sorts the admin shops', () => {
    const cards = mapAdminShopsToCards({
      shops: [
        { id: 's2', name: 'Zeta' },
        { id: 's1', name: 'Alpha' },
        { id: 's1', name: 'Alpha duplicate' },
        { id: null },
        ' s4 ',
        '',
      ],
    });

    expect(cards.map((card) => [card.shopId, card.title])).toEqual([
      ['s1', 'Alpha'],
      ['s2', 'Zeta'],
      ['s4', `${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} s4`],
    ]);
  });

  it('returns no cards without an admin', () => {
    expect(mapAdminShopsToCards(undefined)).toEqual([]);
  });
});

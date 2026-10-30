import {
  HOME_METRIC_PENDING_ICON,
  HOME_PRODUCTS_METRIC_ICON,
  HOME_SALES_METRIC_ICON,
  HOME_TEXTS,
} from '../../constants/home.constants';
import { ShopStatistic } from '../../../shop/models/shop-statistic.model';
import {
  buildShopOverviewCard,
  mapAdminShopsToCards,
  resolveAdminShops,
  sumMonthlyStatistic,
} from './home-shop-cards.helper';

const month = (monthNumber: number, count: number) => ({
  year: 2026,
  month: 'Month',
  monthNumber,
  count,
});

const STATISTIC: ShopStatistic = {
  orders: [month(1, 3), month(2, 4)],
  products: [month(1, 10), month(3, 5)],
  users: [month(1, 1)],
};

describe('home-shop-cards.helper', () => {
  it('sums monthly counts and ignores missing or invalid values', () => {
    expect(sumMonthlyStatistic(STATISTIC.orders)).toBe(7);
    expect(sumMonthlyStatistic(undefined)).toBe(0);
    expect(sumMonthlyStatistic([month(1, Number.NaN), month(2, 2)])).toBe(2);
  });

  it('builds a card with pending metrics and a fallback title without a statistic', () => {
    const card = buildShopOverviewCard({ id: 's1', name: '' });

    expect(card.shopId).toBe('s1');
    expect(card.title).toBe(`${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} s1`);
    expect(card.actionLabel).toBe(HOME_TEXTS.MANAGE_SHOP_LABEL);
    expect(card.metrics).toEqual([
      {
        label: HOME_TEXTS.SALES_METRIC_LABEL,
        value: HOME_TEXTS.METRIC_EMPTY_VALUE,
        helperText: HOME_TEXTS.METRIC_PENDING_TEXT,
        helperIcon: HOME_METRIC_PENDING_ICON,
      },
      {
        label: HOME_TEXTS.PRODUCTS_METRIC_LABEL,
        value: HOME_TEXTS.METRIC_EMPTY_VALUE,
        helperText: HOME_TEXTS.METRIC_PENDING_TEXT,
        helperIcon: HOME_METRIC_PENDING_ICON,
      },
    ]);
  });

  it('builds total sales and products metrics from the statistic', () => {
    const card = buildShopOverviewCard({ id: 's1', name: 'Alpha' }, STATISTIC);

    expect(card.title).toBe('Alpha');
    expect(card.metrics).toEqual([
      {
        label: HOME_TEXTS.SALES_METRIC_LABEL,
        value: '7',
        helperText: HOME_TEXTS.SALES_METRIC_HELPER_TEXT,
        helperIcon: HOME_SALES_METRIC_ICON,
      },
      {
        label: HOME_TEXTS.PRODUCTS_METRIC_LABEL,
        value: '15',
        helperText: HOME_TEXTS.PRODUCTS_METRIC_HELPER_TEXT,
        helperIcon: HOME_PRODUCTS_METRIC_ICON,
      },
    ]);
  });

  it('resolves deduplicated admin shops', () => {
    expect(
      resolveAdminShops({
        shops: [
          { id: 's2', name: 'Zeta' },
          { id: 's2', name: 'Duplicate' },
          { id: null },
          ' s4 ',
          '',
        ],
      }),
    ).toEqual([
      { id: 's2', name: 'Zeta' },
      { id: 's4', name: '' },
    ]);
  });

  it('returns no shops without an admin', () => {
    expect(resolveAdminShops(undefined)).toEqual([]);
  });

  it('maps shops to cards sorted by title, pairing each shop with its statistic', () => {
    const cards = mapAdminShopsToCards(
      [
        { id: 's2', name: 'Zeta' },
        { id: 's1', name: 'Alpha' },
        { id: 's4', name: '' },
      ],
      [undefined, STATISTIC],
    );

    expect(cards.map((card) => [card.shopId, card.title, card.metrics[0].value])).toEqual([
      ['s1', 'Alpha', '7'],
      ['s2', 'Zeta', HOME_TEXTS.METRIC_EMPTY_VALUE],
      ['s4', `${HOME_TEXTS.SHOP_FALLBACK_NAME_PREFIX} s4`, HOME_TEXTS.METRIC_EMPTY_VALUE],
    ]);
  });
});

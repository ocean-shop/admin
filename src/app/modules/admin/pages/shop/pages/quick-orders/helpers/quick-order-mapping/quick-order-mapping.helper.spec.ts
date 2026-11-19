import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import {
  QUICK_ORDER_STATUS_BADGE_TONES,
  QUICK_ORDER_STATUS_LABELS,
  QUICK_ORDERS_TABS,
} from '../../constants/quick-orders.constants';
import { QuickOrderStatus } from '../../models/quick-order-status.enum';
import { QuickOrderListResponse } from '../../models/quick-order.model';
import {
  applyQuickOrderStatusChange,
  buildQuickOrderCounts,
  buildQuickOrderPhoneHref,
  buildQuickOrderTabViews,
  formatQuickOrderPhone,
  mapQuickOrder,
  normalizeQuickOrderSearch,
  resolveQuickOrderStatus,
  resolveQuickOrderTabStatus,
} from './quick-order-mapping.helper';

const buildResponse = (): QuickOrderListResponse => ({
  items: [
    { id: 'q-1', status: QuickOrderStatus.New },
    { id: 'q-2', status: QuickOrderStatus.New },
  ],
  total: 21,
  page: 1,
  limit: 20,
  totalPages: 2,
});

describe('quick-order-mapping helper', () => {
  describe('resolveQuickOrderStatus', () => {
    it('returns known statuses', () => {
      expect(resolveQuickOrderStatus('processed')).toBe(QuickOrderStatus.Processed);
      expect(resolveQuickOrderStatus('cancelled')).toBe(QuickOrderStatus.Cancelled);
    });

    it('falls back to new for unknown or missing values', () => {
      expect(resolveQuickOrderStatus('weird')).toBe(QuickOrderStatus.New);
      expect(resolveQuickOrderStatus(null)).toBe(QuickOrderStatus.New);
    });
  });

  describe('resolveQuickOrderTabStatus', () => {
    it('returns no status for the all tab', () => {
      expect(resolveQuickOrderTabStatus('all')).toBeUndefined();
    });

    it('returns the tab status otherwise', () => {
      expect(resolveQuickOrderTabStatus(QuickOrderStatus.Processed)).toBe(
        QuickOrderStatus.Processed,
      );
    });
  });

  describe('formatQuickOrderPhone', () => {
    it('groups ukrainian numbers', () => {
      expect(formatQuickOrderPhone('+380671234567')).toBe('+380 67 123 45 67');
    });

    it('keeps other formats as-is without spaces', () => {
      expect(formatQuickOrderPhone(' 0671 234 ')).toBe('0671234');
    });

    it('returns placeholder when empty', () => {
      expect(formatQuickOrderPhone('  ')).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(formatQuickOrderPhone(null)).toBe(EMPTY_VALUE_PLACEHOLDER);
    });
  });

  describe('buildQuickOrderPhoneHref', () => {
    it('builds a tel link without spaces', () => {
      expect(buildQuickOrderPhoneHref('+380 67 123 45 67')).toBe('tel:+380671234567');
    });

    it('returns null when phone is missing', () => {
      expect(buildQuickOrderPhoneHref(undefined)).toBeNull();
    });
  });

  describe('mapQuickOrder', () => {
    it('maps api item to view model', () => {
      const order = mapQuickOrder({
        id: 'q-1',
        productId: 'p-fallback',
        name: ' Олена ',
        phone: '+380671234567',
        status: 'processed',
        createdAt: '2026-11-17T07:02:00.000Z',
        product: { id: 'p-1', name: 'Iphone 14 pro max' },
      });

      expect(order).toMatchObject({
        id: 'q-1',
        name: 'Олена',
        phone: '+380 67 123 45 67',
        phoneHref: 'tel:+380671234567',
        productId: 'p-1',
        productName: 'Iphone 14 pro max',
        status: QuickOrderStatus.Processed,
        statusLabel: QUICK_ORDER_STATUS_LABELS[QuickOrderStatus.Processed],
        statusTone: QUICK_ORDER_STATUS_BADGE_TONES[QuickOrderStatus.Processed],
      });
      expect(order.createdDate).not.toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(order.createdTime).not.toBe('');
    });

    it('uses fallbacks for missing values', () => {
      const order = mapQuickOrder({ id: 'q-2', productId: 'p-2', createdAt: 'not-a-date' });

      expect(order.name).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(order.productName).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(order.productId).toBe('p-2');
      expect(order.phoneHref).toBeNull();
      expect(order.status).toBe(QuickOrderStatus.New);
      expect(order.createdDate).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(order.createdTime).toBe('');
    });

    it('returns null product id when both ids are missing', () => {
      expect(mapQuickOrder({ id: 'q-3' }).productId).toBeNull();
    });
  });

  describe('normalizeQuickOrderSearch', () => {
    it('strips phone formatting from phone-like terms', () => {
      expect(normalizeQuickOrderSearch(' 067 123-45 (67) ')).toBe('0671234567');
    });

    it('keeps names as trimmed text', () => {
      expect(normalizeQuickOrderSearch('  Олена ')).toBe('Олена');
    });
  });

  describe('buildQuickOrderCounts / buildQuickOrderTabViews', () => {
    it('pairs tabs with totals and defaults missing responses to 0', () => {
      const counts = buildQuickOrderCounts(QUICK_ORDERS_TABS, [
        { ...buildResponse(), total: 3 },
        { ...buildResponse(), total: 2 },
      ]);

      expect(counts).toEqual({ new: 3, processed: 2, cancelled: 0, all: 0 });
    });

    it('builds tab views with null counts until loaded', () => {
      expect(buildQuickOrderTabViews(QUICK_ORDERS_TABS, undefined)[0].countLabel).toBeNull();
      expect(
        buildQuickOrderTabViews(QUICK_ORDERS_TABS, {
          new: 3,
          processed: 2,
          cancelled: 1,
          all: 6,
        })[3].countLabel,
      ).toBe('6');
    });
  });

  describe('applyQuickOrderStatusChange', () => {
    it('returns undefined response untouched', () => {
      expect(
        applyQuickOrderStatusChange(undefined, 'q-1', QuickOrderStatus.Processed, 'all'),
      ).toBeUndefined();
    });

    it('returns the same response when the id is absent', () => {
      const response = buildResponse();
      expect(
        applyQuickOrderStatusChange(response, 'missing', QuickOrderStatus.Processed, 'all'),
      ).toBe(response);
    });

    it('updates the status in place on the all tab', () => {
      const result = applyQuickOrderStatusChange(
        buildResponse(),
        'q-1',
        QuickOrderStatus.Processed,
        'all',
      );

      expect(result?.items[0].status).toBe(QuickOrderStatus.Processed);
      expect(result?.total).toBe(21);
    });

    it('removes the row from a status tab it no longer matches', () => {
      const result = applyQuickOrderStatusChange(
        buildResponse(),
        'q-1',
        QuickOrderStatus.Cancelled,
        QuickOrderStatus.New,
      );

      expect(result?.items.map((item) => item.id)).toEqual(['q-2']);
      expect(result?.total).toBe(20);
      expect(result?.totalPages).toBe(1);
    });
  });
});

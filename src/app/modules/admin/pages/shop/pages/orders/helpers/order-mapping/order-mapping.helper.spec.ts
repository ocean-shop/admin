import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { ORDERS_TEXTS } from '../../constants/orders.constants';
import { OrderPaymentStatus } from '../../models/order-payment-status.enum';
import { OrderStatus } from '../../models/order-status.enum';
import { OrderApiItem } from '../../models/order.model';
import {
  buildOrderExtraRows,
  buildOrderInfoRows,
  buildOrderItemRows,
  buildOrderUserRows,
  mapOrder,
  resolveOrderItems,
  resolveOrderPaymentStatus,
  resolveOrderSortQuery,
  resolveOrderStatus,
} from './order-mapping.helper';

describe('order-mapping.helper', () => {
  describe('mapOrder', () => {
    it('formats list values', () => {
      expect(
        mapOrder(
          {
            id: ' o-1 ',
            shopId: 'shop-1',
            orderNumber: 1001,
            totalAmount: 12,
            paymentStatus: 'paid',
            status: 'in_progress',
            createdAt: 'not-a-date',
          },
          'fallback',
        ),
      ).toEqual({
        id: 'o-1',
        shopId: 'shop-1',
        orderNumber: '1001',
        totalAmount: '12.00',
        paymentStatus: 'Paid',
        status: 'In Progress',
        createdAt: 'not-a-date',
      });
    });

    it('applies fallbacks', () => {
      const order = mapOrder({}, 'shop-fallback');

      expect(order.id).toBeTruthy();
      expect(order.shopId).toBe('shop-fallback');
      expect(order.orderNumber).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(order.totalAmount).toBe(EMPTY_VALUE_PLACEHOLDER);
    });
  });

  it('resolveOrderSortQuery maps newest/older', () => {
    expect(resolveOrderSortQuery('newest')).toEqual({ sortBy: 'createdAt', sortOrder: 'desc' });
    expect(resolveOrderSortQuery('older')).toEqual({ sortBy: 'createdAt', sortOrder: 'asc' });
  });

  it('resolveOrderPaymentStatus defaults to unpaid', () => {
    expect(resolveOrderPaymentStatus('paid')).toBe(OrderPaymentStatus.Paid);
    expect(resolveOrderPaymentStatus('weird')).toBe(OrderPaymentStatus.Unpaid);
    expect(resolveOrderPaymentStatus(null)).toBe(OrderPaymentStatus.Unpaid);
  });

  it('resolveOrderStatus keeps known statuses and defaults to pending', () => {
    expect(resolveOrderStatus(OrderStatus.Shipped)).toBe(OrderStatus.Shipped);
    expect(resolveOrderStatus(OrderStatus.Cancelled)).toBe(OrderStatus.Cancelled);
    expect(resolveOrderStatus('weird')).toBe(OrderStatus.Pending);
    expect(resolveOrderStatus(undefined)).toBe(OrderStatus.Pending);
  });

  it('resolveOrderItems prefers items, then products', () => {
    const item = { id: 'i-1' };

    expect(resolveOrderItems({ items: [item] })).toEqual([item]);
    expect(resolveOrderItems({ products: [item] })).toEqual([item]);
    expect(resolveOrderItems({ items: null, products: null })).toEqual([]);
  });

  it('buildOrderItemRows formats line values and defaults quantity to one for totals', () => {
    expect(
      buildOrderItemRows([
        { quantity: 2, unitPrice: 5, product: { name: ' Hat ', sku: 'H-1' } },
        { quantity: null, unitPrice: '3' },
      ]),
    ).toEqual([
      { name: 'Hat', sku: 'H-1', quantity: '2', price: '5.00', total: '10.00' },
      {
        name: EMPTY_VALUE_PLACEHOLDER,
        sku: EMPTY_VALUE_PLACEHOLDER,
        quantity: EMPTY_VALUE_PLACEHOLDER,
        price: '3',
        total: '3.00',
      },
    ]);
  });

  it('buildOrderInfoRows lists the general fields', () => {
    const rows = buildOrderInfoRows({ orderNumber: 'A-1', status: 'shipped' });

    expect(rows[0]).toEqual({ label: ORDERS_TEXTS.INFO_ORDER_NUMBER_LABEL, value: 'A-1' });
    expect(rows[3]).toEqual({ label: ORDERS_TEXTS.INFO_ORDER_STATUS_LABEL, value: 'Shipped' });
    expect(rows).toHaveLength(6);
  });

  it('buildOrderUserRows reads user, then createdBy', () => {
    expect(buildOrderUserRows({ user: { email: 'a@b.c' } })[0].value).toBe('a@b.c');
    expect(buildOrderUserRows({ createdBy: { firstName: 'Ann' } })[1].value).toBe('Ann');
    expect(buildOrderUserRows({}).every((row) => row.value === EMPTY_VALUE_PLACEHOLDER)).toBe(true);
  });

  it('buildOrderExtraRows keeps only unknown fields', () => {
    const order: OrderApiItem = { id: 'o-1', status: 'paid', note: 'Fragile', meta: { a: 1 } };

    expect(buildOrderExtraRows(order)).toEqual([
      { label: 'note', value: 'Fragile' },
      { label: 'meta', value: '{"a":1}' },
    ]);
  });
});

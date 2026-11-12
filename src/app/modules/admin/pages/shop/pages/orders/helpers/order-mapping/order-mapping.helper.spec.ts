import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import {
  ORDER_PAYMENT_METHOD_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_SHIPPING_METHOD_LABELS,
  ORDER_STATUS_LABELS,
  ORDERS_TEXTS,
} from '../../constants/orders.constants';
import { OrderPaymentMethod } from '../../models/order-payment-method.enum';
import { OrderPaymentStatus } from '../../models/order-payment-status.enum';
import { OrderShippingMethod } from '../../models/order-shipping-method.enum';
import { OrderStatus } from '../../models/order-status.enum';
import { OrderApiItem } from '../../models/order.model';
import {
  buildOrderCustomer,
  buildOrderCustomerRows,
  buildOrderDetailsDescription,
  buildOrderDetailsTitle,
  buildOrderInfoRows,
  buildOrderItemRows,
  buildOrderSummaryRows,
  formatOrderDetailsNumber,
  formatOrderPaymentMethodLabel,
  formatOrderPaymentStatusLabel,
  formatOrderShippingMethodLabel,
  formatOrderStatusLabel,
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
        paymentStatus: ORDER_PAYMENT_STATUS_LABELS[OrderPaymentStatus.Paid],
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
        {
          quantity: 2,
          unitPrice: 5,
          product: { name: ' Hat ', sku: 'H-1', images: [{ url: ' https://cdn/hat.png ' }] },
        },
        { quantity: null, unitPrice: '3' },
      ]),
    ).toEqual([
      {
        name: 'Hat',
        image: 'https://cdn/hat.png',
        sku: 'H-1',
        quantity: '2',
        price: '5.00',
        total: '10.00',
      },
      {
        name: EMPTY_VALUE_PLACEHOLDER,
        image: null,
        sku: EMPTY_VALUE_PLACEHOLDER,
        quantity: EMPTY_VALUE_PLACEHOLDER,
        price: '3',
        total: '3.00',
      },
    ]);
  });

  it('formatOrderDetailsNumber prefixes known numbers only', () => {
    expect(formatOrderDetailsNumber(4)).toBe('№4');
    expect(formatOrderDetailsNumber(null)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('buildOrderInfoRows lists the general fields with status badges', () => {
    const rows = buildOrderInfoRows({
      orderNumber: 'A-1',
      status: 'shipped',
      paymentStatus: 'paid',
    });

    expect(rows[0]).toEqual({ label: ORDERS_TEXTS.INFO_ORDER_NUMBER_LABEL, value: '№A-1' });
    expect(rows[2]).toEqual({
      label: ORDERS_TEXTS.INFO_PAYMENT_STATUS_LABEL,
      value: ORDER_PAYMENT_STATUS_LABELS[OrderPaymentStatus.Paid],
      tone: 'success',
    });
    expect(rows[3]).toEqual({
      label: ORDERS_TEXTS.INFO_ORDER_STATUS_LABEL,
      value: ORDER_STATUS_LABELS[OrderStatus.Shipped],
      tone: 'info',
    });
    expect(rows).toHaveLength(6);
  });

  it('buildOrderInfoRows leaves unknown statuses without a tone', () => {
    expect(buildOrderInfoRows({ status: 'weird' })[3].tone).toBeUndefined();
  });

  describe('buildOrderSummaryRows', () => {
    it('shows subtotal, discount and an emphasized total', () => {
      expect(
        buildOrderSummaryRows({ subtotalAmount: '100.00', discountAmount: 10, totalAmount: 90 }),
      ).toEqual([
        { label: ORDERS_TEXTS.SUMMARY_SUBTOTAL_LABEL, value: '100.00' },
        { label: ORDERS_TEXTS.SUMMARY_DISCOUNT_LABEL, value: '−10.00' },
        { label: ORDERS_TEXTS.SUMMARY_TOTAL_LABEL, value: '90.00', emphasis: true },
      ]);
    });

    it('skips the discount row when there is no discount', () => {
      const rows = buildOrderSummaryRows({ discountAmount: '0.00' });

      expect(rows.map((row) => row.label)).toEqual([
        ORDERS_TEXTS.SUMMARY_SUBTOTAL_LABEL,
        ORDERS_TEXTS.SUMMARY_TOTAL_LABEL,
      ]);
      expect(rows[0].value).toBe(EMPTY_VALUE_PLACEHOLDER);
    });
  });

  describe('buildOrderCustomerRows', () => {
    it('reads the order contact and delivery fields', () => {
      const order: OrderApiItem = {
        userId: 'user-1',
        firstName: ' Olena ',
        lastName: 'Koval',
        middleName: 'Petrivna',
        email: 'olena@example.com',
        phoneNumber: '+380671234567',
        shippingMethod: OrderShippingMethod.Nova,
        shippingNumber: 'Branch 12',
        paymentMethod: OrderPaymentMethod.Card,
      };

      expect(buildOrderCustomerRows(order).map((row) => row.value)).toEqual([
        'Olena Koval',
        'Petrivna',
        'olena@example.com',
        '+380671234567',
        `${ORDER_SHIPPING_METHOD_LABELS[OrderShippingMethod.Nova]} · Branch 12`,
        ORDER_PAYMENT_METHOD_LABELS[OrderPaymentMethod.Card],
        'user-1',
      ]);
    });

    it('does not repeat the carrier when the shipping number already names it', () => {
      const label = ORDER_SHIPPING_METHOD_LABELS[OrderShippingMethod.Nova];
      const rows = buildOrderCustomerRows({
        shippingMethod: OrderShippingMethod.Nova,
        shippingNumber: `${label} · Branch 1`,
      });

      expect(rows[4].value).toBe(`${label} · Branch 1`);
    });

    it('falls back to the user account, then to placeholders', () => {
      const fromUser = buildOrderCustomerRows({
        createdBy: { id: 'u-2', firstName: 'Ann', email: 'ann@b.c', phone: '+1' },
        shippingNumber: 'Branch 3',
      });

      expect(fromUser[0].value).toBe('Ann');
      expect(fromUser[2].value).toBe('ann@b.c');
      expect(fromUser[3].value).toBe('+1');
      expect(fromUser[4].value).toBe('Branch 3');
      expect(fromUser[6].value).toBe('u-2');
      expect(buildOrderCustomerRows({}).every((row) => row.value === EMPTY_VALUE_PLACEHOLDER)).toBe(
        true,
      );
    });
  });

  describe('buildOrderCustomer', () => {
    it('builds name, email and initials', () => {
      expect(
        buildOrderCustomer({ firstName: 'olena', lastName: 'koval', email: 'o@k.ua' }),
      ).toEqual({ name: 'olena koval', email: 'o@k.ua', initials: 'OK' });
    });

    it('uses the email initial, then the placeholder', () => {
      expect(buildOrderCustomer({ user: { email: 'zed@b.c' } }).initials).toBe('Z');
      expect(buildOrderCustomer({})).toEqual({
        name: EMPTY_VALUE_PLACEHOLDER,
        email: EMPTY_VALUE_PLACEHOLDER,
        initials: EMPTY_VALUE_PLACEHOLDER,
      });
    });
  });

  it('buildOrderDetailsTitle and description describe the order', () => {
    expect(buildOrderDetailsTitle({ orderNumber: 4 })).toBe(
      `${ORDERS_TEXTS.DETAILS_ORDER_TITLE} №4`,
    );
    expect(buildOrderDetailsDescription({ createdAt: 'x', email: 'a@b.c' })).toBe(
      `${ORDERS_TEXTS.DETAILS_CREATED_PREFIX} x · a@b.c`,
    );
    expect(buildOrderDetailsDescription({})).toBe(
      `${ORDERS_TEXTS.DETAILS_CREATED_PREFIX} ${EMPTY_VALUE_PLACEHOLDER}`,
    );
  });
});

describe('order status labels', () => {
  it('translates known statuses and title-cases unknown ones', () => {
    expect(formatOrderPaymentStatusLabel(OrderPaymentStatus.Unpaid)).toBe(
      ORDER_PAYMENT_STATUS_LABELS[OrderPaymentStatus.Unpaid],
    );
    expect(formatOrderStatusLabel(OrderStatus.Cancelled)).toBe(
      ORDER_STATUS_LABELS[OrderStatus.Cancelled],
    );
    expect(formatOrderStatusLabel('in_progress')).toBe('In Progress');
    expect(formatOrderPaymentStatusLabel(null)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('translates payment and shipping methods and title-cases unknown ones', () => {
    expect(formatOrderPaymentMethodLabel(OrderPaymentMethod.Cod)).toBe(
      ORDER_PAYMENT_METHOD_LABELS[OrderPaymentMethod.Cod],
    );
    expect(formatOrderShippingMethodLabel(OrderShippingMethod.Ukr)).toBe(
      ORDER_SHIPPING_METHOD_LABELS[OrderShippingMethod.Ukr],
    );
    expect(formatOrderPaymentMethodLabel('bank_transfer')).toBe('Bank Transfer');
    expect(formatOrderShippingMethodLabel('meest')).toBe('Meest');
  });
});

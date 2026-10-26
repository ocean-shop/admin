import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderApiItem, OrderListQueryParams, OrderListResponse } from '../models/order.model';
import { UpdateOrderPaymentStatusPayload } from '../models/update-order-payment-status-payload.model';
import { UpdateOrderStatusPayload } from '../models/update-order-status-payload.model';
import { API_URL } from '@core/constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);

  getOrders(query: OrderListQueryParams): Observable<OrderListResponse> {
    return this.http.get<OrderListResponse>(`${API_URL}/orders`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
        shopId: query.shopId,
        ...(query.orderNumber ? { orderNumber: query.orderNumber } : {}),
        ...(query.sortBy ? { sortBy: query.sortBy } : {}),
        ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      },
    });
  }

  getOrderById(id: string): Observable<OrderApiItem> {
    return this.http.get<OrderApiItem>(`${API_URL}/orders/${id}`, {
      withCredentials: true,
    });
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/orders/${id}`, {
      withCredentials: true,
    });
  }

  updateOrderStatus(id: string, payload: UpdateOrderStatusPayload): Observable<OrderApiItem> {
    return this.http.patch<OrderApiItem>(`${API_URL}/orders/${id}/status`, payload, {
      withCredentials: true,
    });
  }

  updateOrderPaymentStatus(
    id: string,
    payload: UpdateOrderPaymentStatusPayload,
  ): Observable<OrderApiItem> {
    return this.http.patch<OrderApiItem>(`${API_URL}/orders/${id}/payment-status`, payload, {
      withCredentials: true,
    });
  }
}

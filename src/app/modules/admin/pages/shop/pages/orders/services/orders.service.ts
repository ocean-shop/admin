import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderApiItem, OrderListQueryParams, OrderListResponse } from '../models/order.model';
import { UpdateOrderPaymentStatusPayload } from '../models/update-order-payment-status-payload.model';
import { UpdateOrderStatusPayload } from '../models/update-order-status-payload.model';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  getOrders(query: OrderListQueryParams): Observable<OrderListResponse> {
    return this.http.get<OrderListResponse>(`${this.API_URL}/orders`, {
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
    return this.http.get<OrderApiItem>(`${this.API_URL}/orders/${id}`, {
      withCredentials: true,
    });
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/orders/${id}`, {
      withCredentials: true,
    });
  }

  updateOrderStatus(id: string, payload: UpdateOrderStatusPayload): Observable<OrderApiItem> {
    return this.http.patch<OrderApiItem>(`${this.API_URL}/orders/${id}/status`, payload, {
      withCredentials: true,
    });
  }

  updateOrderPaymentStatus(
    id: string,
    payload: UpdateOrderPaymentStatusPayload,
  ): Observable<OrderApiItem> {
    return this.http.patch<OrderApiItem>(`${this.API_URL}/orders/${id}/payment-status`, payload, {
      withCredentials: true,
    });
  }
}

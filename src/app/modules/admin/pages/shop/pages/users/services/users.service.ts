import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserApiItem, UserListQueryParams, UserListResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api-production-1765.up.railway.app';

  getUsers(query: UserListQueryParams): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${this.API_URL}/user/users`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
        shopId: query.shopId,
        ...(query.email ? { email: query.email } : {}),
        ...(query.phoneNumber ? { phoneNumber: query.phoneNumber } : {}),
        ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      },
    });
  }

  getUserById(id: string): Observable<UserApiItem> {
    return this.http.get<UserApiItem>(`${this.API_URL}/user/users/${id}`, {
      withCredentials: true,
    });
  }
}

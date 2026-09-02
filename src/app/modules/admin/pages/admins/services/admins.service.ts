import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { AdminApiItem, AdminsApiResponse, AdminsQueryParams } from '../models/admin.model';
import { AdminCreatePayload, AdminUpdatePayload } from '../models/admin-payload.model';

@Injectable({
  providedIn: 'root',
})
export class AdminsService {
  private readonly http = inject(HttpClient);

  getAdmins(query: AdminsQueryParams): Observable<AdminsApiResponse | AdminApiItem[]> {
    return this.http.get<AdminsApiResponse | AdminApiItem[]>(`${API_URL}/user/admins`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
      },
    });
  }

  getAdminById(id: string): Observable<AdminApiItem> {
    return this.http.get<AdminApiItem>(`${API_URL}/user/admins/${id}`, {
      withCredentials: true,
    });
  }

  createAdmin(payload: AdminCreatePayload): Observable<AdminApiItem> {
    return this.http.post<AdminApiItem>(`${API_URL}/user/admins/`, payload, {
      withCredentials: true,
    });
  }

  updateAdmin(id: string, payload: AdminUpdatePayload): Observable<AdminApiItem> {
    return this.http.patch<AdminApiItem>(`${API_URL}/user/admins/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/user/admins/${id}`, {
      withCredentials: true,
    });
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminApiItem, AdminsApiResponse, AdminsQueryParams } from '../models/admin.model';
import { AdminCreatePayload, AdminUpdatePayload } from '../models/admin-payload.model';

@Injectable({
  providedIn: 'root',
})
export class AdminsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api-production-1765.up.railway.app';

  getAdmins(query: AdminsQueryParams): Observable<AdminsApiResponse | AdminApiItem[]> {
    return this.http.get<AdminsApiResponse | AdminApiItem[]>(`${this.API_URL}/user/admins`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
      },
    });
  }

  getAdminById(id: string): Observable<AdminApiItem> {
    return this.http.get<AdminApiItem>(`${this.API_URL}/user/admins/${id}`, {
      withCredentials: true,
    });
  }

  createAdmin(payload: AdminCreatePayload): Observable<AdminApiItem> {
    return this.http.post<AdminApiItem>(`${this.API_URL}/user/admins/`, payload, {
      withCredentials: true,
    });
  }

  updateAdmin(id: string, payload: AdminUpdatePayload): Observable<AdminApiItem> {
    return this.http.patch<AdminApiItem>(`${this.API_URL}/user/admins/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/user/admins/${id}`, {
      withCredentials: true,
    });
  }
}

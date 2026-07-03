import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminApiItem, AdminsApiResponse } from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  getAdmins(): Observable<AdminsApiResponse | AdminApiItem[]> {
    return this.http.get<AdminsApiResponse | AdminApiItem[]>(`${this.API_URL}/user/admins`, {
      withCredentials: true,
    });
  }
}

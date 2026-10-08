import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);

  public requestOtp(identity: string): Observable<any> {
    const isEmail = identity.includes('@');
    const payload = isEmail ? { email: identity } : { phone: identity };
    return this.http.post(`${API_URL}/user/auth/admin/request-otp`, payload, {
      withCredentials: true,
    });
  }

  public verifyOtp(identity: string, code: string): Observable<any> {
    const isEmail = identity.includes('@');
    const payload = isEmail ? { email: identity, code } : { phone: identity, code };
    return this.http.post(`${API_URL}/user/auth/verify-otp`, payload, {
      withCredentials: true,
    });
  }
}

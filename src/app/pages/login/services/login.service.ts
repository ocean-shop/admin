import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  requestOtp(identity: string): Observable<any> {
    const isEmail = identity.includes('@');
    const payload = isEmail ? { email: identity } : { phone: identity };
    return this.http.post(`${this.API_URL}/user/auth/request-otp`, payload);
  }

  verifyOtp(identity: string, code: string): Observable<any> {
    const isEmail = identity.includes('@');
    const payload = isEmail ? { email: identity, code } : { phone: identity, code };
    return this.http.post(`${this.API_URL}/user/auth/verify-otp`, payload);
  }
}

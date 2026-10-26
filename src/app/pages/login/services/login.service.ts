import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { AuthResponse } from '@core/models/auth.model';
import { OtpRequestResponse, OtpVerifyPayload } from '../models/login.model';
import { buildIdentityPayload } from '../helpers/identity.helper';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);

  public requestOtp(identity: string): Observable<OtpRequestResponse> {
    return this.http.post<OtpRequestResponse>(
      `${API_URL}/user/auth/admin/request-otp`,
      buildIdentityPayload(identity),
      { withCredentials: true },
    );
  }

  public verifyOtp(identity: string, code: string): Observable<AuthResponse> {
    const payload: OtpVerifyPayload = { ...buildIdentityPayload(identity), code };
    return this.http.post<AuthResponse>(`${API_URL}/user/auth/verify-otp`, payload, {
      withCredentials: true,
    });
  }
}

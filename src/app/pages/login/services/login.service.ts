import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_API_ENDPOINTS } from '@core/constants/api.constant';
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
      AUTH_API_ENDPOINTS.REQUEST_OTP,
      buildIdentityPayload(identity),
      { withCredentials: true },
    );
  }

  public verifyOtp(identity: string, code: string): Observable<AuthResponse> {
    const payload: OtpVerifyPayload = { ...buildIdentityPayload(identity), code };
    return this.http.post<AuthResponse>(AUTH_API_ENDPOINTS.VERIFY_OTP, payload, {
      withCredentials: true,
    });
  }
}

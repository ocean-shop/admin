import { Component, output, signal, computed, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, required, pattern } from '@angular/forms/signals';
import { interval } from 'rxjs';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';
import { ButtonLine } from '@ui/button-line/button-line';
import {
  LOGIN_MS_PER_SECOND,
  LOGIN_OTP_PATTERN,
  LOGIN_SECONDS_PER_MINUTE,
  LOGIN_TEXTS,
  LOGIN_TIMER_TICK_MS,
} from '../../constants/login.constants';
import { OtpData } from '../../models/login.model';

@Component({
  selector: 'app-otp-form',
  imports: [Input, Button, ButtonLine],
  templateUrl: './otp-form.html',
  styleUrl: './otp-form.scss',
})
export class OtpForm {
  protected readonly texts = LOGIN_TEXTS.OTP_FORM;

  public readonly isLoading = input<boolean>(false);
  /** Epoch ms when the current code expires and a new one may be requested. */
  public readonly expiresAt = input<number>(0);
  public readonly submitEvent = output<string>();
  public readonly resendEvent = output<void>();
  public readonly backToLoginEvent = output<void>();

  private readonly now = signal(Date.now());

  protected readonly timeLeft = computed(() =>
    Math.max(0, Math.floor((this.expiresAt() - this.now()) / LOGIN_MS_PER_SECOND)),
  );

  protected readonly formattedTime = computed(() => {
    const time = this.timeLeft();
    const minutes = Math.floor(time / LOGIN_SECONDS_PER_MINUTE)
      .toString()
      .padStart(2, '0');
    const seconds = (time % LOGIN_SECONDS_PER_MINUTE).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  protected readonly otpModel = signal<OtpData>({
    otp: '',
  });

  protected readonly otpForm = form(this.otpModel, (schemaPath) => {
    required(schemaPath.otp, { message: this.texts.REQUIRED_MESSAGE });
    pattern(schemaPath.otp, LOGIN_OTP_PATTERN, { message: this.texts.INVALID_MESSAGE });
  });

  protected readonly isFormValid = computed(() => {
    return this.otpForm.otp().valid();
  });

  constructor() {
    interval(LOGIN_TIMER_TICK_MS)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.now.set(Date.now()));
  }

  protected onSubmit(): void {
    if (this.isFormValid() && !this.isLoading()) {
      this.submitEvent.emit(this.otpForm.otp().value()!);
    }
  }

  protected onResend(): void {
    if (!this.isLoading()) {
      this.resendEvent.emit();
    }
  }

  protected onBackToLogin(): void {
    this.backToLoginEvent.emit();
  }
}

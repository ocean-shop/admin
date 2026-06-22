import {
  Component,
  output,
  signal,
  computed,
  OnInit,
  inject,
  input,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, required, pattern } from '@angular/forms/signals';
import { interval, Subscription } from 'rxjs';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';
import { ButtonLine } from '@ui/button-line/button-line';
import { LocalStorageService } from '../../../../core/services/local-storage/local-storage.service';
import { OTP_EXPIRATION_KEY, OTP_PATTERN } from '../../constants/login.constant';
import { OtpData } from '../../models/login.model';

@Component({
  selector: 'app-otp-form',
  imports: [Input, Button, ButtonLine],
  templateUrl: './otp-form.html',
  styleUrl: './otp-form.scss',
})
export class OtpForm implements OnInit {
  private localStorageService = inject(LocalStorageService);
  private destroyRef = inject(DestroyRef);

  submitEvent = output<string>();
  backToLoginEvent = output<void>();
  isLoading = input<boolean>(false);

  timeLeft = signal(300);

  otpModel = signal<OtpData>({
    otp: '',
  });

  otpForm = form(this.otpModel, (schemaPath) => {
    required(schemaPath.otp, { message: 'OTP is required' });
    pattern(schemaPath.otp, OTP_PATTERN, { message: 'Please enter a valid 4-digit OTP' });
  });

  formattedTime = computed(() => {
    const time = Math.max(0, this.timeLeft());
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  isFormValid = computed(() => {
    return this.otpForm.otp().valid();
  });

  private countdownSub: Subscription | undefined;

  ngOnInit() {
    this.startTimer();
  }

  onSubmit() {
    if (this.isFormValid() && !this.isLoading()) {
      this.submitEvent.emit(this.otpForm.otp().value()!);
    }
  }

  resendCode() {
    this.startTimer();
  }

  onBackToLogin() {
    this.backToLoginEvent.emit();
  }

  private startTimer() {
    const expirationTime = this.getOrCreateExpirationTime();
    this.updateTimeLeft(expirationTime);
    this.startCountdown(expirationTime);
  }

  private getOrCreateExpirationTime(): number {
    const now = Date.now();
    const savedExpiration = this.localStorageService.getItem<number>(OTP_EXPIRATION_KEY);

    if (savedExpiration && savedExpiration > now) {
      return savedExpiration;
    }

    // 5 minutes from now
    const expirationTime = now + 300 * 1000;
    this.localStorageService.setItem(OTP_EXPIRATION_KEY, expirationTime);
    return expirationTime;
  }

  private updateTimeLeft(expirationTime: number) {
    this.timeLeft.set(Math.floor((expirationTime - Date.now()) / 1000));
  }

  private startCountdown(expirationTime: number) {
    this.countdownSub = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const currentLeft = Math.floor((expirationTime - Date.now()) / 1000);
        if (currentLeft > 0) {
          this.timeLeft.set(currentLeft);
        } else {
          this.handleTimeout();
        }
      });
  }

  private handleTimeout() {
    this.timeLeft.set(0);
    this.clearTimer();
    this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
  }

  private clearTimer() {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = undefined;
    }
  }
}

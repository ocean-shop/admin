import { Component, output, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { OTP_EXPIRATION_KEY } from '../../constants/login.constant';

@Component({
  selector: 'app-otp-form',
  imports: [Input, Button],
  templateUrl: './otp-form.html',
  styleUrl: './otp-form.scss',
})
export class OtpForm implements OnInit, OnDestroy {
  private localStorageService = inject(LocalStorageService);

  submitEvent = output<void>();
  timeoutEvent = output<void>();

  timeLeft = signal(300);

  formattedTime = computed(() => {
    const time = Math.max(0, this.timeLeft());
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  onSubmit() {
    this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
    this.submitEvent.emit();
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
    this.intervalId = setInterval(() => {
      const currentLeft = Math.floor((expirationTime - Date.now()) / 1000);
      if (currentLeft > 0) {
        this.timeLeft.set(currentLeft);
      } else {
        this.handleTimeout();
      }
    }, 1000);
  }

  private handleTimeout() {
    this.timeLeft.set(0);
    this.clearTimer();
    this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
    this.timeoutEvent.emit();
  }

  private clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

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
import { LocalStorageService } from '@core/services/local-storage/local-storage.service';
import {
  OTP_EXPIRATION_KEY,
  OTP_PATTERN,
  LOGIN_TEXTS,
  FIVE_MINUTES,
} from '../../constants/login.constants';
import { OtpData } from '../../models/login.model';

@Component({
  selector: 'app-otp-form',
  imports: [Input, Button, ButtonLine],
  templateUrl: './otp-form.html',
  styleUrl: './otp-form.scss',
  standalone: true,
})
export class OtpForm implements OnInit {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly texts = LOGIN_TEXTS.otpForm;

  public readonly submitEvent = output<string>();
  public readonly backToLoginEvent = output<void>();
  public readonly isLoading = input<boolean>(false);

  public readonly timeLeft = signal(300);

  public readonly otpModel = signal<OtpData>({
    otp: '',
  });

  public readonly otpForm = form(this.otpModel, (schemaPath) => {
    required(schemaPath.otp, { message: this.texts.requiredMessage });
    pattern(schemaPath.otp, OTP_PATTERN, { message: this.texts.invalidMessage });
  });

  public readonly formattedTime = computed(() => {
    const time = Math.max(0, this.timeLeft());
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  public readonly isFormValid = computed(() => {
    return this.otpForm.otp().valid();
  });

  private countdownSub: Subscription | undefined;

  public ngOnInit(): void {
    this.startTimer();
  }

  public onSubmit(): void {
    if (this.isFormValid() && !this.isLoading()) {
      this.submitEvent.emit(this.otpForm.otp().value()!);
    }
  }

  public resendCode(): void {
    this.startTimer();
  }

  public onBackToLogin(): void {
    this.backToLoginEvent.emit();
  }

  private startTimer(): void {
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

    const expirationTime = now + FIVE_MINUTES;
    this.localStorageService.setItem(OTP_EXPIRATION_KEY, expirationTime);
    return expirationTime;
  }

  private updateTimeLeft(expirationTime: number): void {
    this.timeLeft.set(Math.floor((expirationTime - Date.now()) / 1000));
  }

  private startCountdown(expirationTime: number): void {
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

  private handleTimeout(): void {
    this.timeLeft.set(0);
    this.clearTimer();
    this.localStorageService.removeItem(OTP_EXPIRATION_KEY);
  }

  private clearTimer(): void {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
      this.countdownSub = undefined;
    }
  }
}

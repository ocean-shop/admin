import { Injectable, signal } from '@angular/core';
import { Toast, ToastOptions } from '@ui/toaster/models/toaster.type';
import { DEFAULT_TOAST_DURATION } from '@ui/toaster/constants/toaster.constant';
import { timer, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toastsSignal = signal<Toast[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  private timers = new Map<string, Subscription>();

  show(toast: Omit<Toast, 'id'>): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };

    this.toastsSignal.update((toasts) => [...toasts, newToast]);

    const duration = toast.duration !== undefined ? toast.duration : DEFAULT_TOAST_DURATION;

    if (duration > 0) {
      const subscription = timer(duration).subscribe(() => {
        this.remove(id);
      });
      this.timers.set(id, subscription);
    }
  }

  remove(id: string): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));

    // Clear the timer if the toast is removed manually before it expires
    const subscription = this.timers.get(id);
    if (subscription) {
      subscription.unsubscribe();
      this.timers.delete(id);
    }
  }

  info(title: string, message: string, options?: ToastOptions): void {
    this.show({ type: 'info', title, message, ...options });
  }

  success(title: string, message: string, options?: ToastOptions): void {
    this.show({ type: 'success', title, message, ...options });
  }

  warning(title: string, message: string, options?: ToastOptions): void {
    this.show({ type: 'warning', title, message, ...options });
  }

  danger(title: string, message: string, options?: ToastOptions): void {
    this.show({ type: 'danger', title, message, ...options });
  }
}

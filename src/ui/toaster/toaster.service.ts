import { Injectable, signal } from '@angular/core';
import { Toast } from './models/toaster.type';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toastsSignal = signal<Toast[]>([]);
  public readonly toasts = this.toastsSignal.asReadonly();

  private defaultDuration = 5000;

  show(toast: Omit<Toast, 'id'>): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };

    this.toastsSignal.update((toasts) => [...toasts, newToast]);

    const duration = toast.duration !== undefined ? toast.duration : this.defaultDuration;

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string): void {
    this.toastsSignal.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  info(
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>,
  ): void {
    this.show({ type: 'info', title, message, ...options });
  }

  success(
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>,
  ): void {
    this.show({ type: 'success', title, message, ...options });
  }

  warning(
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>,
  ): void {
    this.show({ type: 'warning', title, message, ...options });
  }

  danger(
    title: string,
    message: string,
    options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>,
  ): void {
    this.show({ type: 'danger', title, message, ...options });
  }
}

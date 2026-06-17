import { Component, inject } from '@angular/core';
import { ToasterService } from './toaster.service';
import { ToastType } from './models/toaster.type';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss',
  standalone: true,
})
export class Toaster {
  private toasterService = inject(ToasterService);

  toasts = this.toasterService.toasts;

  getIcon(type: ToastType): string {
    switch (type) {
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'report';
      default:
        return 'info';
    }
  }

  getIconFill(type: ToastType): string {
    return type === 'danger' ? "'FILL' 1" : "'FILL' 0";
  }

  close(id: string): void {
    this.toasterService.remove(id);
  }

  handleAction(id: string, action?: () => void): void {
    if (action) {
      action();
    }
    this.close(id);
  }
}

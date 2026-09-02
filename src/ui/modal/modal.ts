import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  public readonly title = input.required<string>();
  public readonly confirmLabel = input.required<string>();
  public readonly isOpen = input<boolean>(false);
  public readonly isDanger = input<boolean>(false);
  public readonly confirmDisabled = input<boolean>(false);
  public readonly confirmLoading = input<boolean>(false);
  public readonly showFooter = input<boolean>(true);
  public readonly closed = output<void>();
  public readonly confirmed = output<void>();

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  protected onBackdropKeydown(event: KeyboardEvent): void {
    const isCloseKey = event.key === 'Enter' || event.key === ' ';
    if (isCloseKey && event.target === event.currentTarget) {
      event.preventDefault();
      this.closed.emit();
    }
  }
}

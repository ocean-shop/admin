import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Modal {
  readonly title = input.required<string>();
  readonly confirmLabel = input.required<string>();
  readonly isOpen = input<boolean>(false);
  readonly isDanger = input<boolean>(false);
  readonly confirmDisabled = input<boolean>(false);
  readonly confirmLoading = input<boolean>(false);
  readonly showFooter = input<boolean>(true);

  readonly closed = output<void>();
  readonly confirmed = output<void>();

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

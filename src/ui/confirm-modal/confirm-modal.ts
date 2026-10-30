import { Component, input, output } from '@angular/core';
import { Modal } from '@ui/modal/modal';

/** Destructive-action confirmation: "{message} <strong>{highlight}</strong>{suffix}". */
@Component({
  selector: 'app-confirm-modal',
  imports: [Modal],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  public readonly isOpen = input<boolean>(false);
  public readonly title = input.required<string>();
  public readonly confirmLabel = input.required<string>();
  public readonly message = input.required<string>();
  public readonly highlight = input<string>('');
  public readonly suffix = input<string>('');
  public readonly loading = input<boolean>(false);
  public readonly closed = output<void>();
  public readonly confirmed = output<void>();
}

import { Component, input, output } from '@angular/core';
import {
  MODAL_CLOSE_ICON,
  MODAL_DANGER_ICON,
  MODAL_DEFAULT_SIZE,
  MODAL_TEXTS,
} from './constants/modal.constants';
import { ModalSize } from './models/modal-size.type';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  public readonly title = input.required<string>();
  public readonly confirmLabel = input.required<string>();
  public readonly cancelLabel = input<string>(MODAL_TEXTS.CANCEL_LABEL);
  public readonly isOpen = input<boolean>(false);
  public readonly isDanger = input<boolean>(false);
  public readonly size = input<ModalSize>(MODAL_DEFAULT_SIZE);
  public readonly confirmDisabled = input<boolean>(false);
  public readonly confirmLoading = input<boolean>(false);
  public readonly showFooter = input<boolean>(true);
  public readonly showCancel = input<boolean>(true);
  public readonly closed = output<void>();
  public readonly confirmed = output<void>();

  protected readonly textData = MODAL_TEXTS;
  protected readonly dangerIcon = MODAL_DANGER_ICON;
  protected readonly closeIcon = MODAL_CLOSE_ICON;

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

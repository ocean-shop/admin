import { Component, effect, input, output, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { Input } from '@ui/input/input';
import { Modal } from '@ui/modal/modal';
import { TAGS_NAME_FIELD_ID, TAGS_TEXTS } from '../../constants/tags.constants';
import { TagFormData } from '../../models/tag-form.model';
import { TagFormSubmitPayload } from '../../models/tag-payload.model';

@Component({
  selector: 'app-tag-form-modal',
  imports: [Modal, Input],
  templateUrl: './tag-form-modal.html',
  styleUrl: './tag-form-modal.scss',
})
export class TagFormModal {
  readonly isOpen = input.required<boolean>();
  readonly confirmLoading = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<TagFormSubmitPayload>();

  protected readonly nameFieldId = TAGS_NAME_FIELD_ID;
  protected readonly texts = TAGS_TEXTS;
  protected readonly title = TAGS_TEXTS.MODAL_CREATE_TITLE;
  protected readonly confirmLabel = TAGS_TEXTS.MODAL_CREATE_CONFIRM_LABEL;

  protected readonly tagFormModel = signal<TagFormData>({
    name: '',
  });
  protected readonly tagForm = form(this.tagFormModel, (schemaPath) => {
    required(schemaPath.name, { message: TAGS_TEXTS.NAME_REQUIRED_MESSAGE });
  });

  constructor() {
    effect(() => {
      const isOpen = this.isOpen();
      if (!isOpen) {
        this.resetForm();
      }
    });
  }

  protected onClose(): void {
    if (this.confirmLoading()) {
      return;
    }

    this.closed.emit();
  }

  protected onConfirm(): void {
    if (!this.tagForm.name().valid() || this.confirmLoading()) {
      return;
    }

    const name = this.tagForm.name().value()?.trim() ?? '';
    if (!name) {
      return;
    }

    this.confirmed.emit({ name });
  }

  private resetForm(): void {
    this.tagFormModel.set({ name: '' });
  }
}

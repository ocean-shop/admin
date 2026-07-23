import { Component, effect, input, output, signal } from '@angular/core';
import { form, required } from '@angular/forms/signals';
import { Input } from '@ui/input/input';
import { Modal } from '@ui/modal/modal';
import {
  ATTRIBUTES_NAME_FIELD_ID,
  ATTRIBUTES_TEXTS,
  ATTRIBUTES_VALUE_FIELD_ID,
} from '../../constants/attributes.constants';
import { AttributeFormData } from '../../models/attribute-form.model';
import { AttributeFormSubmitPayload } from '../../models/attribute-payload.model';

@Component({
  selector: 'app-attribute-form-modal',
  imports: [Modal, Input],
  templateUrl: './attribute-form-modal.html',
  styleUrl: './attribute-form-modal.scss',
})
export class AttributeFormModal {
  readonly isOpen = input.required<boolean>();
  readonly confirmLoading = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<AttributeFormSubmitPayload>();

  protected readonly nameFieldId = ATTRIBUTES_NAME_FIELD_ID;
  protected readonly valueFieldId = ATTRIBUTES_VALUE_FIELD_ID;
  protected readonly texts = ATTRIBUTES_TEXTS;
  protected readonly title = ATTRIBUTES_TEXTS.MODAL_CREATE_TITLE;
  protected readonly confirmLabel = ATTRIBUTES_TEXTS.MODAL_CREATE_CONFIRM_LABEL;

  protected readonly attributeFormModel = signal<AttributeFormData>({
    name: '',
    value: '',
  });
  protected readonly attributeForm = form(this.attributeFormModel, (schemaPath) => {
    required(schemaPath.name, { message: ATTRIBUTES_TEXTS.NAME_REQUIRED_MESSAGE });
    required(schemaPath.value, { message: ATTRIBUTES_TEXTS.VALUE_REQUIRED_MESSAGE });
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
    if (
      !this.attributeForm.name().valid() ||
      !this.attributeForm.value().valid() ||
      this.confirmLoading()
    ) {
      return;
    }

    const name = this.attributeForm.name().value()?.trim() ?? '';
    const value = this.attributeForm.value().value()?.trim() ?? '';
    if (!name || !value) {
      return;
    }

    this.confirmed.emit({ name, value });
  }

  private resetForm(): void {
    this.attributeFormModel.set({ name: '', value: '' });
  }
}

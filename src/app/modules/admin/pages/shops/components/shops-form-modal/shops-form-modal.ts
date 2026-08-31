import { Component, computed, effect, input, output, signal } from '@angular/core';
import { form, pattern, required } from '@angular/forms/signals';
import { Input } from '@ui/input/input';
import { Modal } from '@ui/modal/modal';
import { Textarea } from '@ui/textarea/textarea';
import { Shop } from '../../models/shop.model';
import { ShopCreatePayload } from '../../models/shop-payload.model';
import { ShopFormData } from '../../models/shop-form.model';
import {
  SHOPS_DESCRIPTION_FIELD_ID,
  SHOPS_NAME_FIELD_ID,
  SHOPS_TEXTS,
  SHOPS_URL_FIELD_ID,
  SHOPS_URL_PATTERN,
} from '../../constants/shops.constants';
import { ShopModalModeEnum } from '../../models/shop-modal-mode.type';
import { ShopFormModalMode } from '../../models/shop-form-modal-mode.type';

@Component({
  selector: 'app-shops-form-modal',
  imports: [Modal, Input, Textarea],
  templateUrl: './shops-form-modal.html',
  styleUrl: './shops-form-modal.scss',
  standalone: true,
})
export class ShopsFormModal {
  readonly isOpen = input.required<boolean>();
  readonly mode = input.required<ShopFormModalMode>();
  readonly shop = input<Shop | null>(null);
  readonly confirmLoading = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<ShopCreatePayload>();

  protected readonly nameFieldId = SHOPS_NAME_FIELD_ID;
  protected readonly descriptionFieldId = SHOPS_DESCRIPTION_FIELD_ID;
  protected readonly urlFieldId = SHOPS_URL_FIELD_ID;
  protected readonly texts = SHOPS_TEXTS;

  protected readonly shopFormModel = signal<ShopFormData>({
    name: '',
    description: '',
    url: '',
  });

  protected readonly shopForm = form(this.shopFormModel, (schemaPath) => {
    required(schemaPath.name, { message: SHOPS_TEXTS.NAME_REQUIRED_MESSAGE });
    pattern(schemaPath.url, SHOPS_URL_PATTERN, { message: SHOPS_TEXTS.URL_INVALID_MESSAGE });
  });

  protected readonly title = computed(() =>
    this.mode() === ShopModalModeEnum.Create
      ? SHOPS_TEXTS.MODAL_CREATE_TITLE
      : SHOPS_TEXTS.MODAL_UPDATE_TITLE,
  );
  protected readonly confirmLabel = computed(() =>
    this.mode() === ShopModalModeEnum.Create
      ? SHOPS_TEXTS.MODAL_CREATE_CONFIRM_LABEL
      : SHOPS_TEXTS.MODAL_UPDATE_CONFIRM_LABEL,
  );
  protected readonly isFormValid = computed(
    () =>
      this.shopForm.name().valid() &&
      this.shopForm.description().valid() &&
      this.shopForm.url().valid(),
  );

  constructor() {
    effect(() => {
      const shop = this.shop();
      if (shop) {
        this.prefillShopForm(shop);
      } else {
        this.resetShopForm();
      }
    });

    effect(() => {
      const isOpen = this.isOpen();
      if (!isOpen) {
        this.resetShopForm();
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
    if (!this.isFormValid() || this.confirmLoading()) {
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.confirmed.emit(payload);
  }

  private buildPayload(): ShopCreatePayload | null {
    const name = this.shopForm.name().value()?.trim() ?? '';
    const description = this.shopForm.description().value()?.trim() ?? '';
    const url = this.shopForm.url().value()?.trim() ?? '';

    if (!name) {
      return null;
    }

    return {
      name,
      ...(description ? { description } : {}),
      ...(url ? { url } : {}),
    };
  }

  private prefillShopForm(shop: Shop): void {
    this.shopFormModel.set({
      name: shop.name,
      description: shop.description || '',
      url: shop.url || '',
    });
  }

  private resetShopForm(): void {
    this.shopForm().reset({
      name: '',
      description: '',
      url: '',
    });
  }
}

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

@Component({
  selector: 'app-shop-form-modal',
  imports: [Modal, Input, Textarea],
  templateUrl: './shop-form-modal.html',
  styleUrl: './shop-form-modal.scss',
  standalone: true,
})
export class ShopFormModal {
  readonly isOpen = input.required<boolean>();
  readonly mode = input.required<'create' | 'update'>();
  readonly shop = input<Shop | null>(null);
  readonly confirmLoading = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<ShopCreatePayload>();

  protected readonly nameFieldId = SHOPS_NAME_FIELD_ID;
  protected readonly descriptionFieldId = SHOPS_DESCRIPTION_FIELD_ID;
  protected readonly urlFieldId = SHOPS_URL_FIELD_ID;

  protected readonly nameLabel = SHOPS_TEXTS.NAME_LABEL;
  protected readonly namePlaceholder = SHOPS_TEXTS.NAME_PLACEHOLDER;
  protected readonly descriptionLabel = SHOPS_TEXTS.DESCRIPTION_LABEL;
  protected readonly descriptionPlaceholder = SHOPS_TEXTS.DESCRIPTION_PLACEHOLDER;
  protected readonly urlLabel = SHOPS_TEXTS.URL_LABEL;
  protected readonly urlPlaceholder = SHOPS_TEXTS.URL_PLACEHOLDER;

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
    this.shopFormModel.set({
      name: '',
      description: '',
      url: '',
    });
  }
}

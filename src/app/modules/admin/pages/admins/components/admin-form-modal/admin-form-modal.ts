import { Component, computed, effect, input, output, signal } from '@angular/core';
import { form, FormField, pattern, required } from '@angular/forms/signals';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Input } from '@ui/input/input';
import { MultiSelectDropdown } from '@ui/multi-select-dropdown/multi-select-dropdown';
import { Modal } from '@ui/modal/modal';
import { Admin } from '../../models/admin.model';
import { AdminCreatePayload } from '../../models/admin-payload.model';
import { AdminFormData } from '../../models/admin-form.model';
import {
  ADMINS_TEXTS,
  ADMINS_DEFAULT_ROLE_VALUE,
  ADMINS_IDENTITY_FIELD_ID,
  ADMINS_IDENTITY_PATTERN,
} from '../../constants/admins.constants';
import { AdminModalModeEnum } from '../../models/admin-modal-mode.type';
import { AdminFormModalMode } from '../../models/admin-form-modal-mode.type';

@Component({
  selector: 'app-admin-form-modal',
  imports: [Modal, Input, Dropdown, MultiSelectDropdown, FormField],
  templateUrl: './admin-form-modal.html',
  styleUrl: './admin-form-modal.scss',
  standalone: true,
})
export class AdminFormModal {
  readonly isOpen = input.required<boolean>();
  readonly mode = input.required<AdminFormModalMode>();
  readonly admin = input<Admin | null>(null);
  readonly roleOptions = input.required<DropdownOption[]>();
  readonly shopOptions = input.required<DropdownOption[]>();
  readonly confirmLoading = input<boolean>(false);

  readonly closed = output<void>();
  readonly confirmed = output<AdminCreatePayload>();

  protected readonly identityFieldId = ADMINS_IDENTITY_FIELD_ID;
  protected readonly texts = ADMINS_TEXTS;

  protected readonly adminFormModel = signal<AdminFormData>({
    identity: '',
    role: ADMINS_DEFAULT_ROLE_VALUE,
    shopIds: [],
  });

  protected readonly adminForm = form(this.adminFormModel, (schemaPath) => {
    required(schemaPath.identity, { message: ADMINS_TEXTS.IDENTITY_REQUIRED_MESSAGE });
    pattern(schemaPath.identity, ADMINS_IDENTITY_PATTERN, {
      message: ADMINS_TEXTS.IDENTITY_INVALID_MESSAGE,
    });
    required(schemaPath.role, { message: ADMINS_TEXTS.ROLE_REQUIRED_MESSAGE });
  });

  protected readonly title = computed(() =>
    this.mode() === AdminModalModeEnum.Create
      ? ADMINS_TEXTS.MODAL_CREATE_TITLE
      : ADMINS_TEXTS.MODAL_UPDATE_TITLE,
  );
  protected readonly confirmLabel = computed(() =>
    this.mode() === AdminModalModeEnum.Create
      ? ADMINS_TEXTS.MODAL_CREATE_CONFIRM_LABEL
      : ADMINS_TEXTS.MODAL_UPDATE_CONFIRM_LABEL,
  );
  protected readonly isFormValid = computed(
    () => this.adminForm.identity().valid() && this.adminForm.role().valid(),
  );

  constructor() {
    effect(() => {
      const admin = this.admin();
      if (admin) {
        this.prefillAdminForm(admin);
      } else {
        this.resetAdminForm();
      }
    });

    effect(() => {
      const isOpen = this.isOpen();
      if (!isOpen) {
        this.resetAdminForm();
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

  private buildPayload(): AdminCreatePayload | null {
    const identity = this.adminForm.identity().value()?.trim() ?? '';
    const role = this.adminForm.role().value()?.trim() ?? '';
    const shopIds = this.resolveSelectedShopIds();

    if (!identity || !role) {
      return null;
    }

    if (identity.includes('@')) {
      return { email: identity, role, shopIds };
    }

    return { mobileNumber: identity, role, shopIds };
  }

  private prefillAdminForm(admin: Admin): void {
    this.adminFormModel.set({
      identity: this.resolveAdminIdentity(admin),
      role: this.normalizeRoleValue(admin.role),
      shopIds: admin.shopIds,
    });
  }

  private resolveAdminIdentity(admin: Admin): string {
    if (admin.email && admin.email !== ADMINS_TEXTS.DEFAULT_EMAIL) {
      return admin.email;
    }

    if (admin.phone && admin.phone !== ADMINS_TEXTS.DEFAULT_PHONE) {
      return admin.phone;
    }

    return '';
  }

  private normalizeRoleValue(role: string): string {
    const normalized = role.trim().toLowerCase();
    const roleExists = this.roleOptions().some((option) => option.value === normalized);
    return roleExists ? normalized : ADMINS_DEFAULT_ROLE_VALUE;
  }

  private resetAdminForm(): void {
    this.adminForm().reset({
      identity: '',
      role: ADMINS_DEFAULT_ROLE_VALUE,
      shopIds: [],
    });
  }

  private resolveSelectedShopIds(): string[] {
    const selectedShopIds = this.adminForm.shopIds().value() ?? [];
    return Array.from(new Set(selectedShopIds.map((shopId) => shopId.trim()).filter(Boolean)));
  }
}

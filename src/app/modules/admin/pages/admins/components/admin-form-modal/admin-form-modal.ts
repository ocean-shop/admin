import { Component, computed, effect, input, output, signal } from '@angular/core';
import { form, FormField, pattern, required } from '@angular/forms/signals';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Input } from '@ui/input/input';
import { Modal } from '@ui/modal/modal';
import { MultiSelectDropdown } from '@ui/multi-select-dropdown/multi-select-dropdown';
import {
  ADMINS_DEFAULT_ROLE_VALUE,
  ADMINS_IDENTITY_FIELD_ID,
  ADMINS_IDENTITY_PATTERN,
  ADMINS_ROLE_ICON,
  ADMINS_SHOPS_ICON,
  ADMINS_TEXTS,
} from '../../constants/admins.constants';
import { buildAdminPayload, mapAdminToFormData } from '../../helpers/admin-form/admin-form.helper';
import { AdminFormData } from '../../models/admin-form.model';
import { AdminFormModalMode } from '../../models/admin-form-modal-mode.type';
import { AdminModalModeEnum } from '../../models/admin-modal-mode.type';
import { Admin } from '../../models/admin.model';
import { AdminCreatePayload } from '../../models/admin-payload.model';

@Component({
  selector: 'app-admin-form-modal',
  imports: [Modal, Input, Dropdown, MultiSelectDropdown, FormField],
  templateUrl: './admin-form-modal.html',
  styleUrl: './admin-form-modal.scss',
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
  protected readonly roleIcon = ADMINS_ROLE_ICON;
  protected readonly shopsIcon = ADMINS_SHOPS_ICON;
  protected readonly texts = ADMINS_TEXTS;

  private readonly emptyFormData: AdminFormData = {
    identity: '',
    role: ADMINS_DEFAULT_ROLE_VALUE,
    shopIds: [],
  };

  protected readonly adminFormModel = signal<AdminFormData>({ ...this.emptyFormData });
  protected readonly adminForm = form(this.adminFormModel, (schemaPath) => {
    required(schemaPath.identity, { message: ADMINS_TEXTS.IDENTITY_REQUIRED_MESSAGE });
    pattern(schemaPath.identity, ADMINS_IDENTITY_PATTERN, {
      message: ADMINS_TEXTS.IDENTITY_INVALID_MESSAGE,
    });
    required(schemaPath.role, { message: ADMINS_TEXTS.ROLE_REQUIRED_MESSAGE });
  });

  private readonly isCreateMode = computed(() => this.mode() === AdminModalModeEnum.Create);
  protected readonly title = computed(() =>
    this.isCreateMode() ? ADMINS_TEXTS.MODAL_CREATE_TITLE : ADMINS_TEXTS.MODAL_UPDATE_TITLE,
  );
  protected readonly confirmLabel = computed(() =>
    this.isCreateMode()
      ? ADMINS_TEXTS.MODAL_CREATE_CONFIRM_LABEL
      : ADMINS_TEXTS.MODAL_UPDATE_CONFIRM_LABEL,
  );
  protected readonly isFormValid = computed(
    () => this.adminForm.identity().valid() && this.adminForm.role().valid(),
  );
  protected readonly isConfirmDisabled = computed(
    () => !this.isFormValid() || this.confirmLoading(),
  );

  constructor() {
    // Re-seeds the form (values and touched state) for the edited admin and after closing.
    effect(() => {
      const admin = this.admin();
      const formData =
        admin && this.isOpen()
          ? mapAdminToFormData(admin, this.roleOptions())
          : { ...this.emptyFormData };
      this.adminForm().reset(formData);
    });
  }

  protected onClose(): void {
    if (!this.confirmLoading()) {
      this.closed.emit();
    }
  }

  protected onConfirm(event?: Event): void {
    event?.preventDefault();
    if (this.isConfirmDisabled()) {
      return;
    }

    const payload = buildAdminPayload(this.adminFormModel());
    if (payload) {
      this.confirmed.emit(payload);
    }
  }
}

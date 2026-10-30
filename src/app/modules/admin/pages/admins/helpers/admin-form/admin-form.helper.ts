import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { ADMINS_DEFAULT_ROLE_VALUE, ADMINS_EMAIL_MARKER } from '../../constants/admins.constants';
import { Admin } from '../../models/admin.model';
import { AdminCreatePayload } from '../../models/admin-payload.model';
import { AdminFormData } from '../../models/admin-form.model';

/** Known role value (case-insensitive) or the default role. */
export const normalizeAdminRole = (role: string, roleOptions: DropdownOption[]): string => {
  const normalized = role.trim().toLowerCase();
  return roleOptions.some((option) => option.value === normalized)
    ? normalized
    : ADMINS_DEFAULT_ROLE_VALUE;
};

export const mapAdminToFormData = (admin: Admin, roleOptions: DropdownOption[]): AdminFormData => ({
  identity: admin.email || admin.phone,
  role: normalizeAdminRole(admin.role, roleOptions),
  shopIds: admin.shopIds,
});

/** The identity goes to `email` or `mobileNumber`; null when a required value is missing. */
export const buildAdminPayload = (formData: AdminFormData): AdminCreatePayload | null => {
  const identity = formData.identity.trim();
  const role = formData.role.trim();
  if (!identity || !role) {
    return null;
  }

  const shopIds = Array.from(new Set(formData.shopIds.map((id) => id.trim()).filter(Boolean)));
  return identity.includes(ADMINS_EMAIL_MARKER)
    ? { email: identity, role, shopIds }
    : { mobileNumber: identity, role, shopIds };
};

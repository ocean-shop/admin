import {
  formatBoolean,
  formatDate,
  formatNumber,
  formatText,
  stringifyValue,
} from '@core/helpers/value-format/value-format.helper';
import { InfoListRow } from '@ui/info-list/models/info-list-row.model';
import { TableRowData } from '@ui/table/models/table-column.model';
import { SortOrder } from '../../../models/sort-order.type';
import { USER_ROLE_HIDDEN_FIELDS, USERS_TEXTS } from '../constants/users.constants';
import { UserSortValue } from '../models/user-sort-value.type';
import { User, UserApiItem } from '../models/user.model';

const resolveMobileNumber = (user: UserApiItem): string =>
  formatText(user.mobileNumber ?? user.mobile_number ?? user.phoneNumber);

export const mapUser = (user: UserApiItem): User => ({
  id: user.id?.trim() || crypto.randomUUID(),
  email: formatText(user.email),
  mobileNumber: resolveMobileNumber(user),
  isActive: formatBoolean(user.isActive ?? user.is_active),
  createdAt: formatDate(user.createdAt ?? user.created_at),
});

export const resolveUserSortOrder = (sort: UserSortValue): SortOrder =>
  sort === 'older' ? 'asc' : 'desc';

export const buildUserInfoRows = (user: UserApiItem): InfoListRow[] => {
  const mapped = mapUser(user);
  return [
    { label: USERS_TEXTS.EMAIL_LABEL, value: mapped.email },
    { label: USERS_TEXTS.MOBILE_NUMBER_LABEL, value: mapped.mobileNumber },
    { label: USERS_TEXTS.IS_ACTIVE_LABEL, value: mapped.isActive },
    { label: USERS_TEXTS.CREATED_AT_LABEL, value: mapped.createdAt },
  ];
};

export const buildUserOtpRows = (user: UserApiItem | null): TableRowData[] =>
  (Array.isArray(user?.otps) ? user.otps : []).map((otp) => ({
    channel: formatText(otp.channel),
    purpose: formatText(otp.purpose),
    attempts: formatNumber(otp.attempts),
  }));

export const buildUserSessionRows = (user: UserApiItem | null): TableRowData[] =>
  (Array.isArray(user?.sessions) ? user.sessions : []).map((session) => ({
    userAgent: formatText(session.userAgent ?? session.user_agent),
    ipAddress: formatText(session.ipAddress ?? session.ip_address),
    deviceName: formatText(session.deviceName ?? session.device_name),
  }));

export const buildUserRoleRows = (user: UserApiItem | null): InfoListRow[] => {
  const role = user?.role;
  if (!role) {
    return [];
  }

  if (typeof role === 'string') {
    return [{ label: USERS_TEXTS.ROLE_VALUE_LABEL, value: formatText(role) }];
  }

  return Object.entries(role)
    .filter(([key]) => !USER_ROLE_HIDDEN_FIELDS.includes(key))
    .map(([key, value]) => ({ label: key, value: stringifyValue(value) }));
};

import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { VALUE_FORMAT_TEXTS } from '@core/constants/value-format.constants';
import { USERS_TEXTS } from '../../constants/users.constants';
import {
  buildUserInfoRows,
  buildUserOtpRows,
  buildUserRoleRows,
  buildUserSessionRows,
  mapUser,
  resolveUserSortOrder,
} from './user-mapping.helper';

describe('user-mapping.helper', () => {
  describe('mapUser', () => {
    it('reads camelCase fields', () => {
      expect(
        mapUser({
          id: 'u-1',
          email: ' a@b.c ',
          mobileNumber: '+380',
          isActive: true,
          createdAt: 'raw',
        }),
      ).toEqual({
        id: 'u-1',
        email: 'a@b.c',
        mobileNumber: '+380',
        isActive: VALUE_FORMAT_TEXTS.YES,
        createdAt: 'raw',
      });
    });

    it('falls back to snake_case and phoneNumber fields', () => {
      const user = mapUser({ mobile_number: '+1', is_active: false, created_at: 'raw' });

      expect(user.mobileNumber).toBe('+1');
      expect(user.isActive).toBe(VALUE_FORMAT_TEXTS.NO);
      expect(user.createdAt).toBe('raw');
      expect(mapUser({ phoneNumber: '+2' }).mobileNumber).toBe('+2');
    });

    it('uses placeholders for missing values', () => {
      const user = mapUser({});

      expect(user.id).toBeTruthy();
      expect(user.email).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(user.mobileNumber).toBe(EMPTY_VALUE_PLACEHOLDER);
      expect(user.isActive).toBe(EMPTY_VALUE_PLACEHOLDER);
    });
  });

  it('resolveUserSortOrder maps newest/older', () => {
    expect(resolveUserSortOrder('newest')).toBe('desc');
    expect(resolveUserSortOrder('older')).toBe('asc');
  });

  it('buildUserInfoRows lists labelled fields', () => {
    const rows = buildUserInfoRows({ email: 'a@b.c' });

    expect(rows[0]).toEqual({ label: USERS_TEXTS.EMAIL_LABEL, value: 'a@b.c' });
    expect(rows.map((row) => row.label)).toEqual([
      USERS_TEXTS.EMAIL_LABEL,
      USERS_TEXTS.MOBILE_NUMBER_LABEL,
      USERS_TEXTS.IS_ACTIVE_LABEL,
      USERS_TEXTS.CREATED_AT_LABEL,
    ]);
  });

  it('buildUserOtpRows maps otps and tolerates missing lists', () => {
    expect(buildUserOtpRows({ otps: [{ channel: 'sms', purpose: 'login', attempts: 2 }] })).toEqual(
      [{ channel: 'sms', purpose: 'login', attempts: '2' }],
    );
    expect(buildUserOtpRows({ otps: null })).toEqual([]);
    expect(buildUserOtpRows(null)).toEqual([]);
  });

  it('buildUserSessionRows reads both naming styles', () => {
    expect(
      buildUserSessionRows({
        sessions: [
          { userAgent: 'UA', ipAddress: '1.1.1.1', deviceName: 'Phone' },
          { user_agent: 'ua2', ip_address: '2.2.2.2', device_name: 'PC' },
        ],
      }),
    ).toEqual([
      { userAgent: 'UA', ipAddress: '1.1.1.1', deviceName: 'Phone' },
      { userAgent: 'ua2', ipAddress: '2.2.2.2', deviceName: 'PC' },
    ]);
    expect(buildUserSessionRows(null)).toEqual([]);
  });

  describe('buildUserRoleRows', () => {
    it('returns nothing without a role', () => {
      expect(buildUserRoleRows(null)).toEqual([]);
      expect(buildUserRoleRows({ role: null })).toEqual([]);
    });

    it('renders a string role as a single row', () => {
      expect(buildUserRoleRows({ role: ' admin ' })).toEqual([
        { label: USERS_TEXTS.ROLE_VALUE_LABEL, value: 'admin' },
      ]);
    });

    it('renders role object fields except the id', () => {
      expect(buildUserRoleRows({ role: { id: 'r-1', name: 'Admin', level: 2 } })).toEqual([
        { label: 'name', value: 'Admin' },
        { label: 'level', value: '2' },
      ]);
    });
  });
});

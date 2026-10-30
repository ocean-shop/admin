import { ADMINS_DEFAULT_ROLE_VALUE, ADMINS_ROLE_OPTIONS } from '../../constants/admins.constants';
import { buildAdminPayload, mapAdminToFormData, normalizeAdminRole } from './admin-form.helper';

describe('admin-form.helper', () => {
  it('normalizeAdminRole keeps known roles and falls back to the default', () => {
    expect(normalizeAdminRole(' SUPER ', ADMINS_ROLE_OPTIONS)).toBe('super');
    expect(normalizeAdminRole('unknown', ADMINS_ROLE_OPTIONS)).toBe(ADMINS_DEFAULT_ROLE_VALUE);
  });

  it('mapAdminToFormData prefers email over phone', () => {
    const admin = {
      id: '1',
      name: '',
      email: 'a@b.co',
      phone: '+380',
      role: 'super',
      shopIds: ['s1'],
    };

    expect(mapAdminToFormData(admin, ADMINS_ROLE_OPTIONS)).toEqual({
      identity: 'a@b.co',
      role: 'super',
      shopIds: ['s1'],
    });
    expect(mapAdminToFormData({ ...admin, email: '' }, ADMINS_ROLE_OPTIONS).identity).toBe('+380');
  });

  it('buildAdminPayload sends emails and phones to their own fields with unique shop ids', () => {
    expect(
      buildAdminPayload({ identity: ' a@b.co ', role: 'admin', shopIds: ['s1', ' s1 ', ''] }),
    ).toEqual({
      email: 'a@b.co',
      role: 'admin',
      shopIds: ['s1'],
    });
    expect(buildAdminPayload({ identity: '+380000000000', role: 'admin', shopIds: [] })).toEqual({
      mobileNumber: '+380000000000',
      role: 'admin',
      shopIds: [],
    });
  });

  it('buildAdminPayload returns null without identity or role', () => {
    expect(buildAdminPayload({ identity: ' ', role: 'admin', shopIds: [] })).toBeNull();
    expect(buildAdminPayload({ identity: 'a@b.co', role: '', shopIds: [] })).toBeNull();
  });
});

import { buildIdentityPayload } from './identity.helper';

describe('buildIdentityPayload', () => {
  it('builds an email payload when identity contains @', () => {
    expect(buildIdentityPayload('admin@ocean.dev')).toEqual({ email: 'admin@ocean.dev' });
  });

  it('builds a phone payload otherwise', () => {
    expect(buildIdentityPayload('+380991234567')).toEqual({ phone: '+380991234567' });
  });

  it('trims surrounding whitespace', () => {
    expect(buildIdentityPayload('  0991234567 ')).toEqual({ phone: '0991234567' });
  });
});

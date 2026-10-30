import { ADMINS_TEXTS } from '../../constants/admins.constants';
import {
  extractAdminItems,
  extractAdminShops,
  mapAdmin,
  mapAdminsResponse,
  mapAdminToCard,
} from './admin-mapping.helper';

describe('admin-mapping.helper', () => {
  it('extracts items from every known envelope and from bare arrays', () => {
    const item = { id: '1' };

    expect(extractAdminItems([item])).toEqual([item]);
    expect(extractAdminItems({ items: [item] })).toEqual([item]);
    expect(extractAdminItems({ admins: [item] })).toEqual([item]);
    expect(extractAdminItems({ data: [item] })).toEqual([item]);
    expect(extractAdminItems({})).toEqual([]);
  });

  it('extracts unique shops from ids, objects and shopIds', () => {
    expect(
      extractAdminShops({
        shops: ['s1', 2, { id: 's3', name: ' Ocean ' }, { id: null }],
        shopIds: ['s1', ' s4 '],
      }),
    ).toEqual([
      { id: 's1', name: '' },
      { id: '2', name: '' },
      { id: 's3', name: 'Ocean' },
      { id: 's4', name: '' },
    ]);
    expect(extractAdminShops({})).toEqual([]);
  });

  it('maps an admin, resolving name, phone and role from alternative fields', () => {
    expect(
      mapAdmin({
        id: 7,
        firstName: 'Taras',
        lastName: 'K',
        mobileNumber: '+380000000000',
        role: { name: 'super' },
        shopIds: ['s1'],
      }),
    ).toEqual({
      id: '7',
      name: 'Taras K',
      email: '',
      phone: '+380000000000',
      role: 'super',
      shopIds: ['s1'],
    });
    expect(mapAdmin({ fullName: 'Full', name: 'Name', role: 'admin' })).toMatchObject({
      name: 'Full',
      role: 'admin',
    });
    expect(mapAdmin({}).id).toBeTruthy();
  });

  it('maps the list response with normalized pagination', () => {
    expect(
      mapAdminsResponse({ admins: [{ id: '1' }], total: 25 }, { page: 1, limit: 10 }),
    ).toMatchObject({ items: [{ id: '1' }], page: 1, limit: 10, total: 25, totalPages: 3 });
    expect(mapAdminsResponse([{ id: '1' }], { page: 1, limit: 10 }).total).toBe(1);
  });

  it('maps an admin to a card with display fallbacks', () => {
    expect(
      mapAdminToCard({ id: '1', name: '', email: '', phone: '', role: '', shopIds: [] }),
    ).toEqual({
      id: '1',
      title: ADMINS_TEXTS.DEFAULT_NAME,
      subtitle: ADMINS_TEXTS.DEFAULT_EMAIL,
      detail: ADMINS_TEXTS.DEFAULT_PHONE,
      badge: ADMINS_TEXTS.DEFAULT_ROLE,
    });
  });
});

import {
  ATTRIBUTES_DEFAULT_NAME,
  ATTRIBUTES_DEFAULT_VALUE,
} from '../constants/attributes.constants';
import { mapAttribute } from './attribute-mapping.helper';

describe('mapAttribute', () => {
  it('trims values and keeps timestamps', () => {
    expect(
      mapAttribute(
        {
          id: ' a-1 ',
          shopId: ' shop-1 ',
          name: ' Size ',
          value: ' M ',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-02',
        },
        'fallback',
      ),
    ).toEqual({
      id: 'a-1',
      shopId: 'shop-1',
      name: 'Size',
      value: 'M',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
  });

  it('applies fallbacks and drops blank timestamps', () => {
    const attribute = mapAttribute({ id: null, name: '', value: ' ', updatedAt: '' }, 'shop-x');

    expect(attribute.id).toBeTruthy();
    expect(attribute.shopId).toBe('shop-x');
    expect(attribute.name).toBe(ATTRIBUTES_DEFAULT_NAME);
    expect(attribute.value).toBe(ATTRIBUTES_DEFAULT_VALUE);
    expect(attribute).not.toHaveProperty('createdAt');
    expect(attribute).not.toHaveProperty('updatedAt');
  });
});

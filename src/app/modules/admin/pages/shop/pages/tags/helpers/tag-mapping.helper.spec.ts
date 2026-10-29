import { TAGS_DEFAULT_NAME } from '../constants/tags.constants';
import { mapTag } from './tag-mapping.helper';

describe('mapTag', () => {
  it('trims values and keeps timestamps', () => {
    expect(
      mapTag(
        {
          id: ' tag-1 ',
          shopId: ' shop-1 ',
          name: ' Summer ',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-02',
        },
        'fallback',
      ),
    ).toEqual({
      id: 'tag-1',
      shopId: 'shop-1',
      name: 'Summer',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
  });

  it('applies fallbacks and drops blank timestamps', () => {
    const tag = mapTag({ id: '', shopId: null, name: '  ', createdAt: ' ' }, 'shop-fallback');

    expect(tag.id).toBeTruthy();
    expect(tag.shopId).toBe('shop-fallback');
    expect(tag.name).toBe(TAGS_DEFAULT_NAME);
    expect(tag).not.toHaveProperty('createdAt');
    expect(tag).not.toHaveProperty('updatedAt');
  });
});

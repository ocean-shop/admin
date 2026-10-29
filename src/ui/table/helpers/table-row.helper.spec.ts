import { resolveTableRowId } from './table-row.helper';

describe('resolveTableRowId', () => {
  it('trims string ids', () => {
    expect(resolveTableRowId({ id: ' row-1 ' })).toBe('row-1');
  });

  it('stringifies numeric ids', () => {
    expect(resolveTableRowId({ id: 7 })).toBe('7');
  });

  it('returns null for blank, missing or unsupported ids', () => {
    expect(resolveTableRowId({ id: '  ' })).toBeNull();
    expect(resolveTableRowId({})).toBeNull();
    expect(resolveTableRowId({ id: { nested: true } })).toBeNull();
  });

  it('supports a custom key', () => {
    expect(resolveTableRowId({ uuid: 'u-1' }, 'uuid')).toBe('u-1');
  });
});

import {
  areStringListsEqual,
  moveItemByOffset,
  toggleListValue,
  toggleSetValue,
  uniqueBy,
} from './array.helper';

describe('array.helper', () => {
  it('toggleListValue adds missing and removes present values', () => {
    expect(toggleListValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleListValue(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('toggleSetValue returns a new set with the value toggled', () => {
    const source = new Set(['a']);

    expect(toggleSetValue(source, 'b')).toEqual(new Set(['a', 'b']));
    expect(toggleSetValue(source, 'a')).toEqual(new Set());
    expect(source).toEqual(new Set(['a']));
  });

  it('areStringListsEqual compares length and order', () => {
    expect(areStringListsEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(areStringListsEqual(['a', 'b'], ['b', 'a'])).toBe(false);
    expect(areStringListsEqual(['a'], ['a', 'b'])).toBe(false);
  });

  describe('moveItemByOffset', () => {
    const items = ['a', 'b', 'c'];

    it('swaps with the neighbour', () => {
      expect(moveItemByOffset(items, (item) => item === 'b', -1)).toEqual(['b', 'a', 'c']);
      expect(moveItemByOffset(items, (item) => item === 'b', 1)).toEqual(['a', 'c', 'b']);
    });

    it('returns the same array for impossible moves', () => {
      expect(moveItemByOffset(items, (item) => item === 'a', -1)).toBe(items);
      expect(moveItemByOffset(items, (item) => item === 'c', 1)).toBe(items);
      expect(moveItemByOffset(items, (item) => item === 'z', 1)).toBe(items);
    });
  });

  it('uniqueBy keeps the first item of every key in order', () => {
    const items = [
      { id: 'a', label: '1' },
      { id: 'b', label: '2' },
      { id: 'a', label: '3' },
    ];

    expect(uniqueBy(items, (item) => item.id)).toEqual([
      { id: 'a', label: '1' },
      { id: 'b', label: '2' },
    ]);
    expect(uniqueBy([], (item: string) => item)).toEqual([]);
  });
});

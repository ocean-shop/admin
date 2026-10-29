import { isDropdownOptionValue } from './dropdown-option.helper';

describe('isDropdownOptionValue', () => {
  const options = [
    { label: 'Newest', value: 'newest' },
    { label: 'Older', value: 'older' },
  ];

  it('accepts values present in the options', () => {
    expect(isDropdownOptionValue('older', options)).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isDropdownOptionValue('random', options)).toBe(false);
  });
});

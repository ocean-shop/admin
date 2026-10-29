import { formatAttributeLabel, parseAttributeLabel } from './attribute-label.helper';

describe('attribute-label.helper', () => {
  it('formatAttributeLabel joins name and value', () => {
    expect(formatAttributeLabel('Колір', 'Синій')).toBe('Колір: Синій');
  });

  it('formatAttributeLabel returns the name when there is no value', () => {
    expect(formatAttributeLabel('Колір', '')).toBe('Колір');
  });

  it('parseAttributeLabel splits name and value, keeping separators inside the value', () => {
    expect(parseAttributeLabel('Час: 10:30')).toEqual({ name: 'Час', value: '10:30' });
  });

  it('parseAttributeLabel falls back to the whole label for missing parts', () => {
    expect(parseAttributeLabel(' Колір ')).toEqual({ name: 'Колір', value: 'Колір' });
    expect(parseAttributeLabel(': Синій')).toEqual({ name: ': Синій', value: 'Синій' });
  });
});

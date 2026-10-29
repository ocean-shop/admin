import { matchesSearch } from './search.helper';

describe('matchesSearch', () => {
  it('matches everything for an empty search', () => {
    expect(matchesSearch('Summer', '  ')).toBe(true);
  });

  it('matches case-insensitively and trims the search', () => {
    expect(matchesSearch('Summer Sale', ' SALE ')).toBe(true);
    expect(matchesSearch('Summer', 'winter')).toBe(false);
  });
});

/** Case-insensitive "contains" match; an empty search matches everything. */
export const matchesSearch = (value: string, search: string): boolean => {
  const normalizedSearch = search.trim().toLowerCase();
  return !normalizedSearch || value.toLowerCase().includes(normalizedSearch);
};

/** Adds the value when absent, removes it when present. */
export const toggleListValue = (values: string[], value: string): string[] =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

/** Immutable set toggle: returns a new set with the value added or removed. */
export const toggleSetValue = <T>(values: ReadonlySet<T>, value: T): Set<T> => {
  const nextValues = new Set(values);
  if (!nextValues.delete(value)) {
    nextValues.add(value);
  }

  return nextValues;
};

export const areStringListsEqual = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

/** Swaps the matching item with its neighbour; returns the same array when the move is impossible. */
export const moveItemByOffset = <T>(
  items: T[],
  isTarget: (item: T) => boolean,
  offset: number,
): T[] => {
  const currentIndex = items.findIndex(isTarget);
  const targetIndex = currentIndex + offset;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  [nextItems[currentIndex], nextItems[targetIndex]] = [
    nextItems[targetIndex],
    nextItems[currentIndex],
  ];
  return nextItems;
};

/** Keeps the first item of every key, preserving order. */
export const uniqueBy = <T>(items: T[], getKey: (item: T) => string): T[] => {
  const seenKeys = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
};

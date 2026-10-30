export type TreeBuilderConfig<T> = {
  getId: (value: T) => string;
  getParentId: (value: T) => string | undefined;
  compareSiblings?: (left: T, right: T) => number;
};

export type CategorySortDirection = 'up' | 'down';

export type ChangeCategorySortPayload = {
  direction: CategorySortDirection;
};

export type ChangeCategorySortVariables = ChangeCategorySortPayload & {
  id: string;
};

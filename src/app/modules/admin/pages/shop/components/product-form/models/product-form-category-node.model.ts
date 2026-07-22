export type ProductFormCategoryNode = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  children?: ProductFormCategoryNode[];
};

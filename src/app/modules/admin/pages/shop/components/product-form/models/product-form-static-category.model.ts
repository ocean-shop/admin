export type ProductFormStaticCategoryChild = {
  label: string;
  checked: boolean;
};

export type ProductFormStaticCategory = {
  label: string;
  checked: boolean;
  children?: ProductFormStaticCategoryChild[];
};

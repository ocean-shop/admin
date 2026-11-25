export type ProductDetailRelatedItem = {
  id: string;
  title: string;
  price: string;
  image: string | null;
  /** Router link to the related product's detail page. */
  href: string;
};

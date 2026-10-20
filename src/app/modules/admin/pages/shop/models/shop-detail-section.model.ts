export type ShopDetailSection = {
  segment: string;
  icon: string;
  title: string;
  description: string;
  linkLabel: string;
};

export type ShopDetailSectionLink = ShopDetailSection & {
  route: string[];
};

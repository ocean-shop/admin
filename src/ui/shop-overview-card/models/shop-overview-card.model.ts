export type ShopOverviewMetric = {
  label: string;
  value: string;
  helperText?: string;
  helperIcon?: string;
};

export type ShopOverviewCardData = {
  shopId: string;
  title: string;
  metrics: ShopOverviewMetric[];
  actionLabel?: string;
};

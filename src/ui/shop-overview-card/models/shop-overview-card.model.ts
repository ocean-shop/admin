export interface ShopOverviewMetric {
  label: string;
  value: string;
  helperText?: string;
  helperIcon?: string;
}

export interface ShopOverviewCardData {
  shopId: string;
  title: string;
  metrics: ShopOverviewMetric[];
  actionLabel?: string;
}

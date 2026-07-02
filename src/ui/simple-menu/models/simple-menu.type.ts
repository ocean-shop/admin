export type SimpleMenuItem = {
  label: string;
  icon: string;
  value: string;
  variant?: 'default' | 'danger';
  link?: string;
};

export type SimpleMenuDivider = {
  type: 'divider';
};

export type SimpleMenuEntry = SimpleMenuItem | SimpleMenuDivider;

export type MenuItem = {
  icon: string;
  label: string;
  route: string;
};

export type MenuFooterItem = {
  icon: string;
  label: string;
  route?: string;
  value?: string;
  buttonClass: 'footer-btn' | 'footer-btn-danger';
};

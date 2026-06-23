export interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

export interface MenuFooterItem {
  icon: string;
  label: string;
  route?: string;
  value?: string;
  buttonClass: 'footer-btn' | 'footer-btn-danger';
}

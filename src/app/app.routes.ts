import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/admin/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/admin/pages/home/home').then((m) => m.Home),
      },
      {
        path: 'products',
        loadComponent: () => import('./modules/admin/pages/home/home').then((m) => m.Home),
      },
      {
        path: 'admins',
        loadComponent: () => import('./modules/admin/pages/admins/admins').then((m) => m.Admins),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./modules/admin/pages/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'shops',
        loadComponent: () => import('./modules/admin/pages/shops/shops').then((m) => m.Shops),
      },
      {
        path: 'shop/:shopId',
        loadComponent: () =>
          import('./modules/admin/pages/shop/shop-detail').then((m) => m.ShopDetail),
      },
      {
        path: 'shop/:shopId/categories',
        loadComponent: () =>
          import('./modules/admin/pages/shop/pages/categories/categories').then(
            (m) => m.Categories,
          ),
      },
      {
        path: 'shop/:shopId/tags',
        loadComponent: () =>
          import('./modules/admin/pages/shop/pages/tags/tags').then((m) => m.Tags),
      },
      {
        path: 'shop/:shopId/attributes',
        loadComponent: () =>
          import('./modules/admin/pages/shop/pages/attributes/attributes').then(
            (m) => m.Attributes,
          ),
      },
      {
        path: 'shop/:shopId/products',
        loadComponent: () =>
          import('./modules/admin/pages/shop/pages/products/products').then((m) => m.Products),
      },
      {
        path: 'shop/:shopId/products/create',
        loadComponent: () =>
          import('./modules/admin/pages/shop/pages/products-create/products-create').then(
            (m) => m.ProductsCreate,
          ),
      },
      {
        path: 'shop/:shopId/products/:productId/update',
        loadComponent: () =>
          import('./modules/admin/pages/shop/pages/products-update/products-update').then(
            (m) => m.ProductsUpdate,
          ),
      },
      {
        path: 'not-permission',
        loadComponent: () =>
          import('./modules/admin/pages/system/not-permission/not-permission').then(
            (m) => m.NotPermission,
          ),
      },
    ],
  },
];

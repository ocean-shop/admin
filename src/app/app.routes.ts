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
        path: 'shop',
        loadComponent: () => import('./modules/admin/pages/shop/shop').then((m) => m.Shop),
      },
      {
        path: 'shops',
        loadComponent: () => import('./modules/admin/pages/shop/shop').then((m) => m.Shop),
      },
      {
        path: 'admins',
        loadComponent: () => import('./modules/admin/pages/home/home').then((m) => m.Home),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./modules/admin/pages/settings/settings').then((m) => m.Settings),
      },
    ],
  },
];

import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

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
    loadComponent: () => import('./modules/admin/pages/home/home').then((m) => m.Home),
  },
];

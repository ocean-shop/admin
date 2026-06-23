import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { ContentSpinner } from '@ui/content-spinner/content-spinner';
import { Toaster } from '@ui/toaster/toaster';
import { Loader } from '@ui/loader/loader';
import { LoaderService } from './core/services/loader/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toaster, Loader, ContentSpinner],
  templateUrl: './app.html',
})
export class App {
  private readonly loaderService = inject(LoaderService);
  private readonly router = inject(Router);

  protected readonly isLoading = this.loaderService.isLoading;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.getInitialUrl() },
  );

  private readonly adminBootstrapComplete = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.isAdminPath(event.urlAfterRedirects)),
      filter(Boolean),
      take(1),
      map(() => true),
    ),
    { initialValue: false },
  );

  protected readonly isAdminRoute = computed(() => this.isAdminPath(this.currentUrl()));

  protected readonly showContentSpinner = computed(
    () => this.isAdminRoute() && (this.isLoading() || !this.adminBootstrapComplete()),
  );

  private getInitialUrl(): string {
    if (this.isAdminPath(this.router.url)) {
      return this.router.url;
    }

    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }

    return this.router.url;
  }

  private isAdminPath(path: string): boolean {
    const normalized = path.split('?')[0].split('#')[0];
    return normalized === '/admin' || normalized.startsWith('/admin/');
  }
}

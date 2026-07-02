import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { App } from './app';
import { LoaderService } from './core/services/loader/loader.service';

function configureApp(
  routerUrl: string,
  events = new Subject<NavigationEnd>(),
): Subject<NavigationEnd> {
  TestBed.configureTestingModule({
    imports: [App],
    providers: [
      provideRouter([]),
      {
        provide: Router,
        useValue: { url: routerUrl, events: events.asObservable() },
      },
    ],
  });

  return events;
}

describe('App', () => {
  describe('on admin route', () => {
    let routerEvents: Subject<NavigationEnd>;

    beforeEach(async () => {
      routerEvents = configureApp('/admin');
      await TestBed.compileComponents();
    });

    it('should create the app', () => {
      const fixture = TestBed.createComponent(App);
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should have a router outlet', async () => {
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
    });

    it('should show content spinner while admin route is bootstrapping', () => {
      const fixture = TestBed.createComponent(App);
      const loaderService = TestBed.inject(LoaderService);

      loaderService.show();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-content-spinner')).toBeTruthy();

      routerEvents.next(new NavigationEnd(1, '/admin', '/admin'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-content-spinner')).toBeNull();
    });

    it('should not show content spinner after bootstrap completes', async () => {
      const fixture = TestBed.createComponent(App);
      const loaderService = TestBed.inject(LoaderService);

      fixture.detectChanges();

      // Simulate bootstrap
      routerEvents.next(new NavigationEnd(1, '/admin', '/admin'));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Bootstrap is now complete, start loading
      loaderService.show();
      fixture.detectChanges();

      // After bootstrap, content spinner should NOT show (global loader takes over)
      expect(fixture.nativeElement.querySelector('app-content-spinner')).toBeNull();

      // But global loader should be visible
      expect(fixture.nativeElement.querySelector('app-loader')).toBeTruthy();

      loaderService.hide();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-loader')).toBeNull();
    });
  });

  describe('on login route', () => {
    beforeEach(async () => {
      configureApp('/login');
      await TestBed.compileComponents();
    });

    it('should not show content spinner when loader service is active', () => {
      const fixture = TestBed.createComponent(App);
      const loaderService = TestBed.inject(LoaderService);

      fixture.detectChanges();
      loaderService.show();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-content-spinner')).toBeNull();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { LoaderService } from './core/services/loader/loader.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have a router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should show content spinner when loader service is active', () => {
    const fixture = TestBed.createComponent(App);
    const loaderService = TestBed.inject(LoaderService);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-content-spinner')).toBeNull();

    loaderService.show();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-content-spinner')).toBeTruthy();
  });
});

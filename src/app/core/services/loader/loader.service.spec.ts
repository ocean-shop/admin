import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should set isLoading to true when show is called', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('should require same number of hide calls as show calls to set isLoading to false', () => {
    service.show();
    service.show();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should not allow active requests to go below 0', () => {
    service.hide(); // Shouldn't go to -1
    expect(service.isLoading()).toBe(false);

    service.show(); // Should go to 1
    expect(service.isLoading()).toBe(true);

    service.hide(); // Should go to 0
    service.hide(); // Shouldn't go below 0

    service.show(); // Should go to 1, meaning it didn't drop below 0 before
    expect(service.isLoading()).toBe(true);
  });
});

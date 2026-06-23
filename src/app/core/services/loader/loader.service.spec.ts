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

  it('should set isLoading to false when hide matches show calls', () => {
    service.show();
    service.show();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should not allow active requests to go below 0', () => {
    service.hide();
    expect(service.isLoading()).toBe(false);

    service.show();
    service.hide();
    service.hide();

    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('should hide loading only after all concurrent requests complete', () => {
    service.show();
    service.show();
    service.show();

    service.hide();
    service.hide();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(false);
  });
});

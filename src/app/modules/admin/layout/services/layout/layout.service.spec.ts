import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle sidebar state', () => {
    const initialState = service.isSidebarOpen();
    service.toggleSidebar();
    expect(service.isSidebarOpen()).toBe(!initialState);
  });

  it('should set sidebar state to true', () => {
    service.setSidebarState(true);
    expect(service.isSidebarOpen()).toBe(true);
  });

  it('should set sidebar state to false', () => {
    service.setSidebarState(false);
    expect(service.isSidebarOpen()).toBe(false);
  });
});

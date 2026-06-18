import { TestBed } from '@angular/core/testing';
import { ToasterService } from './toaster.service';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('ToasterService', () => {
  let service: ToasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show an info toast', () => {
    service.info('Info', 'Info message');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].title).toBe('Info');
    expect(toasts[0].message).toBe('Info message');
  });

  it('should show a success toast', () => {
    service.success('Success', 'Success message');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
  });

  it('should show a warning toast', () => {
    service.warning('Warning', 'Warning message');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('warning');
  });

  it('should show a danger toast', () => {
    service.danger('Danger', 'Danger message');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('danger');
  });

  it('should remove a toast by id', () => {
    service.info('Info', 'Info message');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    const id = toasts[0].id;

    service.remove(id);
    expect(service.toasts().length).toBe(0);
  });

  it('should auto-dismiss a toast after the default duration', () => {
    vi.useFakeTimers();
    service.info('Info', 'Info message');
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('should auto-dismiss a toast after a custom duration', () => {
    vi.useFakeTimers();
    service.info('Info', 'Info message', { duration: 3000 });
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(3000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });

  it('should not auto-dismiss if duration is 0', () => {
    vi.useFakeTimers();
    service.info('Info', 'Info message', { duration: 0 });
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(10000);
    expect(service.toasts().length).toBe(1);
    vi.useRealTimers();
  });
});

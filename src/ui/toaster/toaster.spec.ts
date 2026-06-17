import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Toaster } from './toaster';
import { ToasterService } from './toaster.service';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('Toaster', () => {
  let component: Toaster;
  let fixture: ComponentFixture<Toaster>;
  let toasterService: ToasterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toaster],
      providers: [provideZonelessChangeDetection(), ToasterService],
    }).compileComponents();

    fixture = TestBed.createComponent(Toaster);
    component = fixture.componentInstance;
    toasterService = TestBed.inject(ToasterService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct icon based on type', () => {
    expect(component.getIcon('info')).toBe('info');
    expect(component.getIcon('success')).toBe('check_circle');
    expect(component.getIcon('warning')).toBe('warning');
    expect(component.getIcon('danger')).toBe('report');
    // @ts-expect-error Testing default case
    expect(component.getIcon('unknown')).toBe('info');
  });

  it('should return correct icon fill based on type', () => {
    expect(component.getIconFill('info')).toBe("'FILL' 0");
    expect(component.getIconFill('success')).toBe("'FILL' 0");
    expect(component.getIconFill('warning')).toBe("'FILL' 0");
    expect(component.getIconFill('danger')).toBe("'FILL' 1");
  });

  it('should close toast', () => {
    const removeSpy = vi.spyOn(toasterService, 'remove');
    component.close('123');
    expect(removeSpy).toHaveBeenCalledWith('123');
  });

  it('should handle action and close toast', () => {
    const actionSpy = vi.fn();
    const closeSpy = vi.spyOn(component, 'close');

    component.handleAction('123', actionSpy);

    expect(actionSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalledWith('123');
  });

  it('should close toast even if no action is provided', () => {
    const closeSpy = vi.spyOn(component, 'close');

    component.handleAction('123');

    expect(closeSpy).toHaveBeenCalledWith('123');
  });
});

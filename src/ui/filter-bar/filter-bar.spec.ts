import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';

@Component({
  imports: [FilterBar],
  template: `<app-filter-bar (applied)="onApplied()">
    <input filterFields class="field" />
    <button filterControls class="submit" type="submit">Apply</button>
  </app-filter-bar>`,
})
class HostComponent {
  readonly onApplied = vi.fn();
}

describe('FilterBar', () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('projects fields and controls into their slots', () => {
    expect(element.querySelector('.filter-bar-fields .field')).not.toBeNull();
    expect(element.querySelector('.filter-bar-controls .submit')).not.toBeNull();
  });

  it('emits applied and prevents the native submit', () => {
    const form = element.querySelector('form') as HTMLFormElement;
    const event = new Event('submit', { cancelable: true });

    form.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.onApplied).toHaveBeenCalledTimes(1);
  });
});

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterActions } from './filter-actions';

describe('FilterActions', () => {
  let fixture: ComponentFixture<FilterActions>;
  let element: HTMLElement;

  const getApply = (): HTMLButtonElement =>
    element.querySelector('.filter-actions-apply') as HTMLButtonElement;
  const getReset = (): HTMLButtonElement =>
    element.querySelector('.filter-actions-reset') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterActions],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterActions);
    fixture.componentRef.setInput('applyLabel', 'Apply');
    fixture.componentRef.setInput('resetLabel', 'Reset');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a submit button and a plain reset button', () => {
    expect(getApply().type).toBe('submit');
    expect(getApply().textContent?.trim()).toBe('Apply');
    expect(getReset().type).toBe('button');
    expect(getReset().textContent?.trim()).toBe('Reset');
  });

  it('emits cleared on reset click', () => {
    const resetSpy = vi.fn();
    fixture.componentInstance.cleared.subscribe(resetSpy);

    getReset().click();

    expect(resetSpy).toHaveBeenCalledTimes(1);
  });

  it('disables buttons independently', async () => {
    fixture.componentRef.setInput('applyDisabled', true);
    await fixture.whenStable();

    expect(getApply().disabled).toBe(true);
    expect(getReset().disabled).toBe(false);

    fixture.componentRef.setInput('resetDisabled', true);
    await fixture.whenStable();

    expect(getReset().disabled).toBe(true);
  });
});

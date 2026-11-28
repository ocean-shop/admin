import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  let fixture: ComponentFixture<StatCard>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('label', 'Категорій');
    fixture.componentRef.setInput('value', 12);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders label and value without optional parts', () => {
    expect(element.querySelector('.stat-card-label')?.textContent).toContain('Категорій');
    expect(element.querySelector('.stat-card-value')?.textContent).toContain('12');
    expect(element.querySelector('.stat-card-icon')).toBeNull();
    expect(element.querySelector('.stat-card-helper')).toBeNull();
  });

  it('renders icon and helper when provided', async () => {
    fixture.componentRef.setInput('icon', 'account_tree');
    fixture.componentRef.setInput('helper', 'Усього');
    await fixture.whenStable();

    expect(element.querySelector('.stat-card-icon')?.textContent).toContain('account_tree');
    expect(element.querySelector('.stat-card-helper')?.textContent).toContain('Усього');
    expect(element.querySelector('.stat-card-change')).toBeNull();
  });

  it('renders change badge with previous value', async () => {
    fixture.componentRef.setInput('change', { label: '+5,0%', direction: 'up', tone: 'success' });
    fixture.componentRef.setInput('previous', 'було 10');
    await fixture.whenStable();

    expect(element.querySelector('app-change-badge')?.textContent).toContain('+5,0%');
    expect(element.querySelector('.change-badge-success')).not.toBeNull();
    expect(element.querySelector('.stat-card-previous')?.textContent).toContain('було 10');
  });

  it('renders previous value without a change badge', async () => {
    fixture.componentRef.setInput('previous', 'було 10');
    await fixture.whenStable();

    expect(element.querySelector('app-change-badge')).toBeNull();
    expect(element.querySelector('.stat-card-previous')?.textContent).toContain('було 10');
  });
});

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { ShopOverviewCard } from './shop-overview-card';
import { ShopOverviewCardData } from './models/shop-overview-card.model';

describe('ShopOverviewCard', () => {
  let fixture: ComponentFixture<ShopOverviewCard>;
  let component: ShopOverviewCard;

  const card: ShopOverviewCardData = {
    shopId: 'shop-123',
    title: 'Ocean Shop',
    metrics: [
      { label: 'Orders', value: '18' },
      {
        label: 'Revenue',
        value: '$1,250',
        helperText: 'Last 7 days',
        helperIcon: 'trending_up',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopOverviewCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopOverviewCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('card', card);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render card title and metrics', () => {
    const title = fixture.debugElement.query(By.css('.card-title')).nativeElement as HTMLElement;
    const metricLabels = fixture.debugElement.queryAll(By.css('.metric-label'));
    const metricValues = fixture.debugElement.queryAll(By.css('.metric-value'));

    expect(title.textContent).toContain('Ocean Shop');
    expect(metricLabels.length).toBe(2);
    expect(metricValues.length).toBe(2);
    expect(metricLabels[0].nativeElement.textContent).toContain('Orders');
    expect(metricValues[1].nativeElement.textContent).toContain('$1,250');
  });

  it('should render helper text and helper icon when metric helper data exists', () => {
    const helpers = fixture.debugElement.queryAll(By.css('.metric-helper'));
    const helperIcon = fixture.debugElement.query(By.css('.material-symbols-outlined'));

    expect(helpers.length).toBe(1);
    expect(helpers[0].nativeElement.textContent).toContain('Last 7 days');
    expect(helperIcon.nativeElement.textContent).toContain('trending_up');
  });

  it('should use default action label when actionLabel is not provided', () => {
    const button = fixture.debugElement.query(By.css('.btn-primary'))
      .nativeElement as HTMLButtonElement;

    expect(button.textContent).toContain('Manage Store');
  });

  it('should render custom action label when actionLabel is provided', () => {
    fixture.componentRef.setInput('card', {
      ...card,
      actionLabel: 'Open Dashboard',
    });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.btn-primary'))
      .nativeElement as HTMLButtonElement;

    expect(button.textContent).toContain('Open Dashboard');
  });

  it('should emit shop id when manage button is clicked', () => {
    const emitSpy = vi.spyOn(component.manageStore, 'emit');
    const button = fixture.debugElement.query(By.css('.btn-primary'))
      .nativeElement as HTMLButtonElement;

    button.click();

    expect(emitSpy).toHaveBeenCalledWith('shop-123');
  });
});

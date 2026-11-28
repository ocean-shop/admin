import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsightList } from './insight-list';
import { InsightListItem } from './models/insight-list-item.model';

describe('InsightList', () => {
  let fixture: ComponentFixture<InsightList>;
  let element: HTMLElement;

  const items: InsightListItem[] = [
    { id: 'a', icon: 'trending_up', tone: 'positive', message: 'Продажі зросли' },
    { id: 'b', icon: 'warning', tone: 'warning', message: 'Знижки зросли' },
    { id: 'c', icon: 'error', tone: 'danger', message: 'Багато скасувань' },
    { id: 'd', icon: 'info', tone: 'info', message: 'Гроші в дорозі' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsightList],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(InsightList);
    fixture.componentRef.setInput('title', 'Що варто знати');
    fixture.componentRef.setInput('description', 'Автоматичні висновки');
    fixture.componentRef.setInput('icon', 'lightbulb');
    fixture.componentRef.setInput('items', items);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the card heading', () => {
    expect(element.querySelector('.section-card-title')?.textContent).toContain('Що варто знати');
    expect(element.querySelector('.section-card-description')?.textContent).toContain(
      'Автоматичні висновки',
    );
  });

  it('renders every insight with its tone', () => {
    const icons = Array.from(element.querySelectorAll('.insight-icon'));

    expect(
      Array.from(element.querySelectorAll('.insight-message')).map((node) => node.textContent),
    ).toEqual(items.map((item) => item.message));
    expect(icons[0].classList).toContain('insight-icon-positive');
    expect(icons[1].classList).toContain('insight-icon-warning');
    expect(icons[2].classList).toContain('insight-icon-danger');
    expect(icons[3].className).toBe('insight-icon');
    expect(icons[3].textContent).toContain('info');
  });
});

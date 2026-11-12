import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoList } from './info-list';

describe('InfoList', () => {
  let fixture: ComponentFixture<InfoList>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoList],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoList);
    fixture.componentRef.setInput('rows', [
      { label: 'Email', value: 'a@b.c' },
      { label: 'Phone', value: '+380' },
    ]);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a term/description pair per row', () => {
    const keys = Array.from(element.querySelectorAll('dt')).map((node) => node.textContent?.trim());
    const values = Array.from(element.querySelectorAll('dd')).map((node) =>
      node.textContent?.trim(),
    );

    expect(keys).toEqual(['Email', 'Phone']);
    expect(values).toEqual(['a@b.c', '+380']);
  });

  it('applies the monospace style on demand', async () => {
    expect(element.querySelector('.info-list-value-mono')).toBeNull();

    fixture.componentRef.setInput('monospace', true);
    await fixture.whenStable();

    expect(element.querySelectorAll('.info-list-value-mono')).toHaveLength(2);
  });

  it('uses the grid layout with left-aligned values by default', () => {
    const list = element.querySelector('.info-list');

    expect(list?.classList).not.toContain('info-list-rows');
    expect(list?.classList).not.toContain('info-list-values-right');
  });

  it('switches to the rows layout with right-aligned values', async () => {
    fixture.componentRef.setInput('layout', 'rows');
    fixture.componentRef.setInput('valueAlign', 'right');
    await fixture.whenStable();

    const list = element.querySelector('.info-list');
    expect(list?.classList).toContain('info-list-rows');
    expect(list?.classList).toContain('info-list-values-right');
  });

  it('renders per-row badge, mono and emphasis variants', async () => {
    fixture.componentRef.setInput('rows', [
      { label: 'Status', value: 'Paid', tone: 'success' },
      { label: 'Id', value: 'abc', mono: true },
      { label: 'Total', value: '10.00', emphasis: true },
    ]);
    await fixture.whenStable();

    const badges = element.querySelectorAll('app-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0].textContent).toContain('Paid');
    expect(element.querySelectorAll('.info-list-value-mono')).toHaveLength(1);
    expect(element.querySelector('.info-list-key-emphasis')?.textContent?.trim()).toBe('Total');
    expect(element.querySelector('.info-list-value-emphasis')?.textContent?.trim()).toBe('10.00');
  });
});

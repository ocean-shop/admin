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
});

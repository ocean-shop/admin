import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Pagination } from './pagination';

describe('Pagination', () => {
  let fixture: ComponentFixture<Pagination>;
  let component: Pagination;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
  });

  function setDefaultInputs(): void {
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 25);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.componentRef.setInput('label', 'admins');
  }

  it('renders range summary', async () => {
    setDefaultInputs();
    await fixture.whenStable();

    const hostElement = fixture.nativeElement as HTMLElement;
    expect(hostElement.textContent).toContain('Showing 1 to 10 of 25 admins');
  });

  it('emits pageChange when clicking next and previous buttons', async () => {
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 25);
    fixture.componentRef.setInput('totalPages', 3);
    const pageChangeSpy = vi.fn();
    component.pageChange.subscribe(pageChangeSpy);

    await fixture.whenStable();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const previousButton = buttons[0];
    const nextButton = buttons[buttons.length - 1];

    previousButton.triggerEventHandler('click');
    nextButton.triggerEventHandler('click');

    expect(pageChangeSpy).toHaveBeenNthCalledWith(1, 1);
    expect(pageChangeSpy).toHaveBeenNthCalledWith(2, 3);
  });

  it('emits pageChange when selecting a specific page', async () => {
    setDefaultInputs();
    const pageChangeSpy = vi.fn();
    component.pageChange.subscribe(pageChangeSpy);

    await fixture.whenStable();

    const pageButtons = fixture.debugElement.queryAll(By.css('.pagination-page-button'));
    pageButtons[1].triggerEventHandler('click');

    expect(pageChangeSpy).toHaveBeenCalledWith(2);
  });

  it('disables previous on first page and next on last page', async () => {
    setDefaultInputs();
    await fixture.whenStable();

    let buttons = fixture.debugElement.queryAll(By.css('button'));
    let previousButton = buttons[0].nativeElement as HTMLButtonElement;
    let nextButton = buttons[buttons.length - 1].nativeElement as HTMLButtonElement;

    expect(previousButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    fixture.componentRef.setInput('currentPage', 3);
    await fixture.whenStable();

    buttons = fixture.debugElement.queryAll(By.css('button'));
    previousButton = buttons[0].nativeElement as HTMLButtonElement;
    nextButton = buttons[buttons.length - 1].nativeElement as HTMLButtonElement;

    expect(previousButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(true);
  });
});

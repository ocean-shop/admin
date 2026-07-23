import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Dropdown } from './dropdown';
import { DropdownOption } from './models/dropdown.type';

describe('Dropdown', () => {
  let fixture: ComponentFixture<Dropdown>;
  let component: Dropdown;

  const options: DropdownOption[] = [
    { label: 'Option One', value: 'opt-1' },
    { label: 'Option Two', value: 'opt-2' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dropdown],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Dropdown);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', options);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render trigger button with first option label by default', () => {
    const trigger = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    expect(trigger).toBeTruthy();
    expect(trigger.type).toBe('button');
    expect(trigger.textContent).toContain('Option One');
  });

  it('should show selected option label when value is set', () => {
    component.value.set('opt-2');
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('.admin-dropdown-trigger-label')).nativeElement;

    expect(label.textContent).toContain('Option Two');
  });

  it('should show explicit label when provided and no value matches', () => {
    fixture.componentRef.setInput('label', 'Choose an option');
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('.admin-dropdown-trigger-label')).nativeElement;

    expect(label.textContent).toContain('Choose an option');
  });

  it('should toggle menu open and closed on trigger click in click mode', () => {
    fixture.componentRef.setInput('triggerMode', 'click');
    fixture.detectChanges();

    const trigger = fixture.debugElement.query(By.css('button')).nativeElement;
    const container = fixture.debugElement.query(By.css('.admin-dropdown-container')).nativeElement;

    expect(container.classList).not.toContain('admin-dropdown-container-open');

    trigger.click();
    fixture.detectChanges();
    expect(container.classList).toContain('admin-dropdown-container-open');

    trigger.click();
    fixture.detectChanges();
    expect(container.classList).not.toContain('admin-dropdown-container-open');
  });

  it('should not toggle menu on trigger click in hover mode', () => {
    fixture.componentRef.setInput('triggerMode', 'hover');
    fixture.detectChanges();

    const trigger = fixture.debugElement.query(By.css('button')).nativeElement;
    const container = fixture.debugElement.query(By.css('.admin-dropdown-container')).nativeElement;

    trigger.click();
    fixture.detectChanges();

    expect(container.classList).not.toContain('admin-dropdown-container-open');
  });

  it('should select option, update value, close menu, and emit optionSelected', () => {
    fixture.componentRef.setInput('triggerMode', 'click');
    fixture.detectChanges();

    const emittedOptions: DropdownOption[] = [];
    component.optionSelected.subscribe((option) => emittedOptions.push(option));

    const trigger = fixture.debugElement.query(By.css('button')).nativeElement;
    trigger.click();
    fixture.detectChanges();

    const option = fixture.debugElement.queryAll(By.css('.admin-dropdown-item'))[1].nativeElement;
    option.click();
    fixture.detectChanges();

    expect(component.value()).toBe('opt-2');
    expect(emittedOptions).toEqual([options[1]]);

    const container = fixture.debugElement.query(By.css('.admin-dropdown-container')).nativeElement;
    expect(container.classList).not.toContain('admin-dropdown-container-open');
  });

  it('should close menu when clicking outside in click mode', () => {
    fixture.componentRef.setInput('triggerMode', 'click');
    fixture.detectChanges();

    const trigger = fixture.debugElement.query(By.css('button')).nativeElement;
    const container = fixture.debugElement.query(By.css('.admin-dropdown-container')).nativeElement;

    trigger.click();
    fixture.detectChanges();
    expect(container.classList).toContain('admin-dropdown-container-open');

    document.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(container.classList).not.toContain('admin-dropdown-container-open');
  });

  it('should not react to outside clicks in hover mode', () => {
    fixture.componentRef.setInput('triggerMode', 'hover');
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.admin-dropdown-container')).nativeElement;

    document.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(container.classList).not.toContain('admin-dropdown-container-open');
  });

  it('should apply form variant classes', () => {
    fixture.componentRef.setInput('variant', 'form');
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.admin-dropdown-container')).nativeElement;
    const trigger = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(container.classList).toContain('admin-dropdown-container-form');
    expect(trigger.classList).toContain('admin-dropdown-trigger-form');
  });

  it('should apply bordered variant class to trigger', () => {
    fixture.componentRef.setInput('variant', 'bordered');
    fixture.detectChanges();

    const trigger = fixture.debugElement.query(By.css('button')).nativeElement;

    expect(trigger.classList).toContain('admin-dropdown-trigger-bordered');
  });

  it('should render icon when provided', () => {
    fixture.componentRef.setInput('icon', 'settings');
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.css('.admin-dropdown-trigger-icon'));

    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toContain('settings');
  });
});

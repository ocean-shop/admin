import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SimpleMenu } from './simple-menu';
import { SimpleMenuEntry } from './models/simple-menu.type';

const MENU_ITEMS: SimpleMenuEntry[] = [
  { label: 'Account', icon: 'person', value: 'account' },
  { type: 'divider' },
  { label: 'Logout', icon: 'logout', value: 'logout', variant: 'danger' },
];

describe('SimpleMenu', () => {
  let component: SimpleMenu;
  let fixture: ComponentFixture<SimpleMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleMenu);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', MENU_ITEMS);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render menu items', () => {
    const items = fixture.debugElement.queryAll(By.css('.simple-menu-item'));

    expect(items).toHaveLength(2);
    expect(items[0].nativeElement.textContent).toContain('Account');
    expect(items[1].nativeElement.textContent).toContain('Logout');
  });

  it('should render divider between items', () => {
    const divider = fixture.debugElement.query(By.css('.simple-menu-divider'));

    expect(divider).toBeTruthy();
  });

  it('should apply danger variant class to danger items', () => {
    const dangerItem = fixture.debugElement.queryAll(By.css('.simple-menu-item'))[1]
      .nativeElement as HTMLElement;

    expect(dangerItem.className).toContain('simple-menu-item-danger');
  });

  it('should emit itemSelected on item click', () => {
    const emitSpy = vi.spyOn(component.itemSelected, 'emit');
    const firstItem = fixture.debugElement.query(By.css('.simple-menu-item'));

    firstItem.triggerEventHandler('click', new Event('click'));

    expect(emitSpy).toHaveBeenCalledWith({
      label: 'Account',
      icon: 'person',
      value: 'account',
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { UserCard } from './user-card';

describe('UserCard', () => {
  let fixture: ComponentFixture<UserCard>;
  let component: UserCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCard);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('user', {
      name: 'Alex Rivera',
      email: 'alex.rivera@oceanbreeze.com',
      phone: '+1 (555) 012-3456',
      role: 'Super Admin',
    });
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders admin data', () => {
    const cardElement = fixture.nativeElement as HTMLElement;

    expect(cardElement.textContent).toContain('Alex Rivera');
    expect(cardElement.textContent).toContain('alex.rivera@oceanbreeze.com');
    expect(cardElement.textContent).toContain('+1 (555) 012-3456');
    expect(cardElement.textContent).toContain('Super Admin');
  });

  it('emits edit event', () => {
    const editSpy = vi.fn();
    component.edit.subscribe(editSpy);

    const editButton = fixture.debugElement.query(By.css('.icon-btn-edit'));
    editButton?.triggerEventHandler('click');

    expect(editSpy).toHaveBeenCalledTimes(1);
  });

  it('emits removed event', () => {
    const removedSpy = vi.fn();
    component.removed.subscribe(removedSpy);

    const removeButton = fixture.debugElement.query(By.css('.icon-btn-delete'));
    removeButton?.triggerEventHandler('click');

    expect(removedSpy).toHaveBeenCalledTimes(1);
  });
});

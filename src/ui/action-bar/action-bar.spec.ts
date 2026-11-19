import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionBar } from './action-bar';

@Component({
  imports: [ActionBar],
  template: `<app-action-bar message="Є незбережені зміни">
    <button class="save" type="button">Зберегти</button>
  </app-action-bar>`,
})
class HostComponent {}

describe('ActionBar', () => {
  let fixture: ComponentFixture<ActionBar>;
  let element: HTMLElement;

  const status = (): HTMLElement => element.querySelector('.action-bar-status') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionBar, HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionBar);
    fixture.componentRef.setInput('message', 'Усі зміни збережено');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the message with the default tone and no icon', () => {
    expect(status().textContent).toContain('Усі зміни збережено');
    expect(status().getAttribute('role')).toBe('status');
    expect(status().classList).not.toContain('action-bar-status-success');
    expect(status().classList).not.toContain('action-bar-status-error');
    expect(element.querySelector('.action-bar-icon')).toBeNull();
  });

  it('renders the icon and the success tone', async () => {
    fixture.componentRef.setInput('icon', 'check_circle');
    fixture.componentRef.setInput('tone', 'success');
    await fixture.whenStable();

    expect(element.querySelector('.action-bar-icon')?.textContent).toContain('check_circle');
    expect(status().classList).toContain('action-bar-status-success');
  });

  it('renders the error tone', async () => {
    fixture.componentRef.setInput('tone', 'error');
    await fixture.whenStable();

    expect(status().classList).toContain('action-bar-status-error');
  });

  it('projects the actions', async () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    await hostFixture.whenStable();
    const hostElement = hostFixture.nativeElement as HTMLElement;

    expect(hostElement.querySelector('.action-bar-actions .save')).not.toBeNull();
    expect(hostElement.textContent).toContain('Є незбережені зміни');
  });
});

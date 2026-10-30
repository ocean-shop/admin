import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StateMessage } from './state-message';

describe('StateMessage', () => {
  let fixture: ComponentFixture<StateMessage>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateMessage],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StateMessage);
    fixture.componentRef.setInput('message', 'Nothing here');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the message with the default tone', () => {
    const paragraph = element.querySelector('.state-message') as HTMLElement;

    expect(paragraph.textContent?.trim()).toBe('Nothing here');
    expect(paragraph.classList.contains('state-message-warning')).toBe(false);
  });

  it('applies the warning tone', async () => {
    fixture.componentRef.setInput('tone', 'warning');
    await fixture.whenStable();

    expect(element.querySelector('.state-message-warning')).not.toBeNull();
  });
});

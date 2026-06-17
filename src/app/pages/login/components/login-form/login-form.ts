import { Component, output } from '@angular/core';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';

@Component({
  selector: 'app-login-form',
  imports: [Input, Button],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  submitEvent = output<void>();

  onSubmit() {
    this.submitEvent.emit();
  }
}

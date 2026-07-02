import { Component, output, signal, computed, input } from '@angular/core';
import { form, required, pattern } from '@angular/forms/signals';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';
import { LoginData } from '../../models/login.model';
import { IDENTITY_PATTERN } from '../../constants/login.constant';

@Component({
  selector: 'app-login-form',
  imports: [Input, Button],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
  standalone: true,
})
export class LoginForm {
  submitEvent = output<string>();
  isLoading = input<boolean>(false);

  loginModel = signal<LoginData>({
    identity: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.identity, { message: 'Email or phone number is required' });
    pattern(schemaPath.identity, IDENTITY_PATTERN, {
      message: 'Please enter a valid email or 10-digit phone number',
    });
  });

  isFormValid = computed(() => {
    return this.loginForm.identity().valid();
  });

  onSubmit() {
    if (this.isFormValid() && !this.isLoading()) {
      this.submitEvent.emit(this.loginForm.identity().value()!);
    }
  }
}

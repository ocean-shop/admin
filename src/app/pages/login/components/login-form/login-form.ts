import { Component, output, signal, computed, input } from '@angular/core';
import { form, required, pattern } from '@angular/forms/signals';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';
import { LoginData } from '../../models/login.model';
import { IDENTITY_PATTERN, LOGIN_TEXTS } from '../../constants/login.constants';

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
  protected readonly texts = LOGIN_TEXTS.loginForm;

  loginModel = signal<LoginData>({
    identity: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.identity, { message: this.texts.requiredMessage });
    pattern(schemaPath.identity, IDENTITY_PATTERN, {
      message: this.texts.invalidMessage,
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

import { Component, output, signal, computed, input } from '@angular/core';
import { form, required, pattern } from '@angular/forms/signals';
import { Input } from '@ui/input/input';
import { Button } from '@ui/button/button';
import { LoginData } from '../../models/login.model';
import { LOGIN_IDENTITY_PATTERN, LOGIN_TEXTS } from '../../constants/login.constants';

@Component({
  selector: 'app-login-form',
  imports: [Input, Button],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
})
export class LoginForm {
  public readonly submitEvent = output<string>();
  public readonly isLoading = input<boolean>(false);
  protected readonly texts = LOGIN_TEXTS.LOGIN_FORM;

  protected readonly loginModel = signal<LoginData>({
    identity: '',
  });

  protected readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.identity, { message: this.texts.REQUIRED_MESSAGE });
    pattern(schemaPath.identity, LOGIN_IDENTITY_PATTERN, {
      message: this.texts.INVALID_MESSAGE,
    });
  });

  protected readonly isFormValid = computed(() => {
    return this.loginForm.identity().valid();
  });

  protected onSubmit(): void {
    if (this.isFormValid() && !this.isLoading()) {
      this.submitEvent.emit(this.loginForm.identity().value()!);
    }
  }
}

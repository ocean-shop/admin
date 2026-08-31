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
  public readonly submitEvent = output<string>();
  public readonly isLoading = input<boolean>(false);
  protected readonly texts = LOGIN_TEXTS.loginForm;

  public readonly loginModel = signal<LoginData>({
    identity: '',
  });

  public readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.identity, { message: this.texts.requiredMessage });
    pattern(schemaPath.identity, IDENTITY_PATTERN, {
      message: this.texts.invalidMessage,
    });
  });

  public readonly isFormValid = computed(() => {
    return this.loginForm.identity().valid();
  });

  public onSubmit(): void {
    if (this.isFormValid() && !this.isLoading()) {
      this.submitEvent.emit(this.loginForm.identity().value()!);
    }
  }
}

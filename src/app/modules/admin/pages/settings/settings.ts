import { Component } from '@angular/core';
import { SettingsForm } from './components/settings-form/settings-form';

@Component({
  selector: 'app-settings',
  imports: [SettingsForm],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {}

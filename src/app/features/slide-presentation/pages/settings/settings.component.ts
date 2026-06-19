import { Component, Input, OnInit } from '@angular/core';
import { Model } from '@google/genai';
import { GeminiService } from '../../../../services/gemini.service';
import { UserService } from '../../../../services/user.service';

type SettingsSection = 'user' | 'ai';

interface SettingsNavItem {
  key: SettingsSection;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {

  readonly navItems: SettingsNavItem[] = [
    { key: 'user', label: 'User Settings', icon: 'user' },
    { key: 'ai', label: 'AI Settings', icon: 'robot' },
  ];
  @Input() activeSection: SettingsSection = 'user';

  // User settings
  name = '';
  email = '';

  // AI settings
  readonly providers = [{ value: 'gemini', label: 'Gemini' }];
  provider = 'gemini';
  models: Model[] = [];
  selectedModelName?: string;
  loadingModels = false;

  constructor(
    private userService: UserService,
    private geminiService: GeminiService,
  ) {}

  ngOnInit(): void {
    const user = this.userService.user;
    this.name = user.name;
    this.email = user.email ?? '';

    this.selectedModelName = this.geminiService.defaultModel?.name;
    this.loadingModels = true;
    this.geminiService
      .loadModels()
      .then((models) => (this.models = models))
      .finally(() => (this.loadingModels = false));
  }

  selectSection(section: SettingsSection): void {
    this.activeSection = section;
  }

  saveUserSettings(): void {
    this.userService.updateUser({ name: this.name, email: this.email });
  }

  onDefaultModelChange(modelName: string): void {
    const model = this.models.find((m) => m.name === modelName);
    this.geminiService.updateDefaultModel(model);
  }
}

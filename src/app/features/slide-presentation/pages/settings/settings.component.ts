import { Component, Input, OnInit } from '@angular/core';
import { ApiError, Model } from '@google/genai';
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
  contentModelName?: string;
  assistantModelName?: string;
  loadingModels = false;
  apiKey = '';
  apiKeyError = '';

  constructor(
    private userService: UserService,
    private geminiService: GeminiService,
  ) {}

  async ngOnInit() {
    try {
      const user = this.userService.user;
      this.name = user.name;
      this.email = user.email ?? '';
      this.apiKey = this.geminiService.apiKey ?? '';
      this.contentModelName = this.geminiService.getModel('content')?.name;
      this.assistantModelName = this.geminiService.getModel('assistant')?.name;
      this.models = await this.geminiService.loadModels();
    } catch (error) {
      console.error(error);
    }
  }

  async saveApiKey() {
    try {
      this.apiKeyError = '';
      this.models = await this.geminiService.updateApiKey(this.apiKey);
    } catch (error:any) {
      if(error instanceof ApiError)
      {
        this.apiKeyError = "Not an valid API Key"
      }
    }
  }

  selectSection(section: SettingsSection): void {
    this.activeSection = section;
  }

  saveUserSettings(): void {
    this.userService.updateUser({ name: this.name, email: this.email });
  }

  onContentModelChange(modelName: string): void {
    const model = this.models.find((m) => m.name === modelName);
    this.geminiService.updateModel('content', model);
  }

  onAssistantModelChange(modelName: string): void {
    const model = this.models.find((m) => m.name === modelName);
    this.geminiService.updateModel('assistant', model);
  }
}

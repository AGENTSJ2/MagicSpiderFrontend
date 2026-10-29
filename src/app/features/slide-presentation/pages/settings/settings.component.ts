import { Component, Input, OnInit } from '@angular/core';
import { ApiError } from '@google/genai';
import { GeminiService } from '../../../../services/gemini.service';
import { UserService } from '../../../../services/user.service';
import { PreferencesService } from '../../services/preferences.service';
import { OllamaChatService } from '../../../../services/Ollama.service';
import { AiService } from '../../../../services/ai.service';
import { AgentKey, LlmModel, ProviderId } from '../../../../services/llm-provider';

type SettingsSection = 'user' | 'ai' | 'pref';

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
    { key:"pref", label: "Preference" , icon: "" }
  ];
  @Input() activeSection: SettingsSection = 'user';

  // User settings
  name = '';
  email = '';

  // AI settings
  readonly providers: { value: ProviderId; label: string }[];
  provider: ProviderId;
  models: LlmModel[] = [];
  contentModelName?: string;
  assistantModelName?: string;
  architectModelName?: string;
  imageModelName?: string;
  loadingModels = false;
  apiKey = '';
  apiKeyError = '';
  ollamaHost = '';
  ollamaApiKey = '';
  ollamaError = '';

  // Preferences
  parallelSlideGeneration = false;

  constructor(
    private userService: UserService,
    private aiService: AiService,
    private geminiService: GeminiService,
    private ollamaService: OllamaChatService,
    private preferencesService: PreferencesService,
  ) {
    this.providers = aiService.providers.map((p) => ({
      value: p.id,
      label: p.label,
    }));
    this.provider = aiService.providerId;
  }

  async ngOnInit() {
    try {
      const user = this.userService.user;
      this.name = user.name;
      this.email = user.email ?? '';
      this.apiKey = this.geminiService.apiKey ?? '';
      this.ollamaHost = this.ollamaService.host ?? '';
      this.ollamaApiKey = this.ollamaService.apiKey ?? '';
      this.parallelSlideGeneration =
        this.preferencesService.parallelSlideGeneration;
      await this.loadProviderModels();
    } catch (error) {
      console.error(error);
    }
  }

  private async loadProviderModels() {
    const provider = this.aiService.getProvider();
    this.contentModelName = provider.getModel('content')?.name;
    this.assistantModelName = provider.getModel('assistant')?.name;
    this.architectModelName = provider.getModel('architect')?.name;
    this.imageModelName = provider.getModel('image')?.name;
    this.models = [];
    this.loadingModels = true;
    try {
      this.models = await provider.loadModels();
    } finally {
      this.loadingModels = false;
    }
  }

  async onProviderChange(id: ProviderId) {
    this.aiService.setProvider(id);
    try {
      await this.loadProviderModels();
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

  async saveOllamaConfig() {
    this.ollamaError = '';
    this.loadingModels = true;
    try {
      this.models = await this.ollamaService.updateConfig(
        this.ollamaHost,
        this.ollamaApiKey,
      );
    } catch (error: any) {
      console.error(error);
      this.ollamaError = `Could not connect to the Ollama server: ${error?.message ?? error}`;
    } finally {
      this.loadingModels = false;
    }
  }

  selectSection(section: SettingsSection): void {
    this.activeSection = section;
  }

  saveUserSettings(): void {
    this.userService.updateUser({ name: this.name, email: this.email });
  }

  private updateModel(agent: AgentKey, modelName: string) {
    const model = this.models.find((m) => m.name === modelName);
    this.aiService.getProvider().updateModel(agent, model);
  }

  onContentModelChange(modelName: string): void {
    this.updateModel('content', modelName);
  }

  onAssistantModelChange(modelName: string): void {
    this.updateModel('assistant', modelName);
  }

  onArchitectModelChange(modelName: string): void {
    this.updateModel('architect', modelName);
  }

  onImageModelChange(modelName: string): void {
    this.updateModel('image', modelName);
  }

  onParallelSlideGenerationChange(enabled: boolean): void {
    this.parallelSlideGeneration = enabled;
    this.preferencesService.updatePreferences({
      parallelSlideGeneration: enabled,
    });
  }
}

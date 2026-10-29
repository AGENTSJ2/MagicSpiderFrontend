import { Injectable } from '@angular/core';
import { GeminiService } from './gemini.service';
import { OllamaChatService } from './Ollama.service';
import { LlmProvider, ProviderId } from './llm-provider';

/**
 * Resolves the provider selected in AI Settings. Agents call getProvider() per
 * request, so switching provider takes effect without a reload.
 */
@Injectable({
  providedIn: 'root',
})
export class AiService {
  private readonly providerStorageKey = 'AI-PROVIDER';
  private readonly providerMap: Record<ProviderId, LlmProvider>;
  private _providerId: ProviderId;

  constructor(gemini: GeminiService, ollama: OllamaChatService) {
    this.providerMap = { gemini, ollama };
    const stored = localStorage.getItem(this.providerStorageKey) as ProviderId;
    this._providerId = stored in this.providerMap ? stored : 'gemini';
  }

  get providers(): LlmProvider[] {
    return Object.values(this.providerMap);
  }

  get providerId(): ProviderId {
    return this._providerId;
  }

  getProvider(): LlmProvider {
    return this.providerMap[this._providerId];
  }

  setProvider(id: ProviderId) {
    this._providerId = id;
    localStorage.setItem(this.providerStorageKey, id);
  }
}

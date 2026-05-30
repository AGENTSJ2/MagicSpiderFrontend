import { Injectable } from '@angular/core';
import { Ollama } from 'ollama';

@Injectable({
  providedIn: 'root',
})
class OllamaChatService {
    
  private readonly ollama = new Ollama({
    host: 'http://localhost:11434',
  });

}

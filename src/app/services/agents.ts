import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Presentation } from '../features/slide-presentation/domain/canvasModels/presenatation.model';
import { GeminiService } from './gemini.service';
import blobService from './blob.service';
import { AgentInActionStages, AgentState, AgentStreamEvent, InvokeEnabledStages, pipeResponseToStream } from '../agents/core/utility';

@Injectable({
  providedIn: 'root',
})
export class LLM_Agents {
  



  constructor(
    private chatService: GeminiService,
  ) {
   
    
  }

 

  
  
}



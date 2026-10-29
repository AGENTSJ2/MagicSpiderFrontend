import { Injectable } from '@angular/core';
import {
  AgentInActionStages,
  AgentState,
  AgentStreamEvent,
  InvokeEnabledStages,
  pipeResponseToStream,
} from './core/utility';
import { Observable, Subject, Subscription } from 'rxjs';
import { AiService } from '../services/ai.service';

@Injectable({
  providedIn: 'root',
})
export class ContentCreatorAgent {
  constructor(private aiService: AiService) {
    this.contentCreatorStream.subscribe((event) => {
      this.contentCreatorState = event.action;
    });
  }

  private contentCreatorSubject: Subject<AgentStreamEvent> = new Subject();
  private interruptContentCreatorSubject: Subject<boolean> = new Subject();
  private contentInterruptSub?: Subscription;
  contentCreatorStream: Observable<AgentStreamEvent> =
    this.contentCreatorSubject.asObservable();
  contentCreatorState: AgentState = AgentState.idle;

  private async ContentCreatorAgent(params: {
    userProblemStatement: string;
    previousContent: string;
  }) {
    if (params.userProblemStatement.length == 0) {
      return;
    }
    const abortController = new AbortController();
    const localContentCreatorSubject = new Subject<AgentStreamEvent>();
    try {
      localContentCreatorSubject.subscribe((ev) => {
        this.contentCreatorSubject.next(ev);
      });
      localContentCreatorSubject.next({
        action: AgentState.invoked,
        message: 'Content creator has been invoked',
      });
      this.contentInterruptSub?.unsubscribe();
      this.interruptContentCreatorSubject.subscribe((ev) => {
        if (ev) {
          if (ev) {
            abortController.abort();
          }
        }
      });
      // Agent working
      const provider = this.aiService.getProvider();
      const stream = await provider.streamChat(
        {
          model: provider.getModel('content')?.name,
          messages: [
            {
              role: 'system',
              content: ContentCreatorPrompt,
            },
            ...(params.previousContent.length != 0
              ? [{ role: 'assistant', content: params.previousContent }]
              : []),
            {
              role: 'user',
              content: params.userProblemStatement,
            },
          ],
        },
        [],
        abortController,
      );
      
      await pipeResponseToStream(localContentCreatorSubject, stream);
      this.contentCreatorSubject.next({
        action: AgentState.done,
        message: 'Completed',
      });
    } catch (error) {
      console.error(error);
      this.contentCreatorSubject.next({
        action: AgentState.error,
        message: error?.toString() ?? 'Unknown error',
      });
    } finally {
      localContentCreatorSubject.complete();
      this.contentInterruptSub?.unsubscribe();
    }
  }

  triggerContentCreator(params: {
    userProblemStatement: string;
    previousContent: string;
  }) {
    if (AgentInActionStages.includes(this.contentCreatorState)) {
      this.interruptContentCreator();
    }
    if (InvokeEnabledStages.includes(this.contentCreatorState)) {
      this.ContentCreatorAgent(params);
    }
  }

  interruptContentCreator() {
    this.interruptContentCreatorSubject.next(true);
  }
}
const ContentCreatorPrompt = [
  'You are an slide content creator your output should be a html format that support quill',
  'Add breaks <br></br> between slides and headlines and add line height enough such that content wont look Congested but dont overdo',
  'Your Response should not contain any user addressing or other junk just slide data',
  'An small summary of slides generated with side number topics are preferred so people can get an summary before going through the whole slide',
].join(' ');

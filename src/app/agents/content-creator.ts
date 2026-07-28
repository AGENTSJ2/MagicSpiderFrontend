import { Injectable } from '@angular/core';
import {
  AgentInActionStages,
  AgentState,
  AgentStreamEvent,
  InvokeEnabledStages,
  pipeResponseToStream,
} from './core/utility';
import { Observable, Subject, Subscription } from 'rxjs';
import { GeminiService } from '../services/gemini.service';
import { waitForMilliseconds } from '../core/utilities';
import { MAX_RETRY, RETRY_TIME_OUT_MS } from './core/constants';

@Injectable({
  providedIn: 'root',
})
export class ContentCreatorAgent {
  private readonly contentCreatorSubject: Subject<AgentStreamEvent & {final:boolean}> = new Subject();
  private readonly interruptContentCreatorSubject: Subject<boolean> = new Subject();
  private contentInterruptSub?: Subscription;
  readonly contentCreatorStream: Observable<AgentStreamEvent & {final:boolean}> =
    this.contentCreatorSubject.asObservable();
  contentCreatorState: AgentState = AgentState.idle;

  constructor(private chatService: GeminiService) {
    this.contentCreatorStream.subscribe((event) => {
      if(event.action == AgentState.error && !event.final) {
        return;
      }
      this.contentCreatorState = event.action;
    });
  }

  private async ContentCreatorAgent(params: {
    userProblemStatement: string;
    previousContent: string;
  }) {
    if (params.userProblemStatement.length == 0) {
      return;
    }
    let retry = 0;
    let forceStop = false;

    const abortController = new AbortController();
    
    while(retry < MAX_RETRY && !forceStop) {
      const localContentCreatorSubject = new Subject<AgentStreamEvent>();
      try {
        localContentCreatorSubject.subscribe((ev) => {
          this.contentCreatorSubject.next({
            ...ev,
            final:false
          });
        });
        localContentCreatorSubject.next({
          action: AgentState.invoked,
          message: 'Content creator has been invoked',
        });
        this.contentInterruptSub?.unsubscribe();
        this.contentInterruptSub = this.interruptContentCreatorSubject.subscribe((ev) => {
          if (ev) {
            abortController.abort();
            forceStop = true;
          }
        });
        // Agent working
        const { stream, provider } = await this.chatService.streamChat(
          {
            model: this.chatService.getModel('content')?.name,
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
        
        await pipeResponseToStream(localContentCreatorSubject, stream, provider);
        this.contentCreatorSubject.next({
          action: AgentState.done,
          message: 'Completed',
          final:false
        });

        break;

      } catch (error) {
        retry++;
        console.error(error);
        const wasLastTry = retry == MAX_RETRY || forceStop;
        this.contentCreatorSubject.next({
          action: AgentState.error,
          message: error?.toString() ?? 'Unknown error',
          final: wasLastTry
        });
        if(!wasLastTry) {
          await waitForMilliseconds(RETRY_TIME_OUT_MS);
        }
      } finally {
        localContentCreatorSubject.complete();
        this.contentInterruptSub?.unsubscribe();
      }
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

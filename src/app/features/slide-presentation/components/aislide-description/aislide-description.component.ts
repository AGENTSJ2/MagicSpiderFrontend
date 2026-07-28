import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Model } from '@google/genai';
import { Presentation } from '../../domain/canvasModels/presenatation.model';
import { WorkspaceController } from '../../pages/workspace/workspace.controller';
import { PresentationService } from '../../services/presentation.service';
import { GeminiService } from '../../../../services/gemini.service';
import { AgentInActionStages, AgentState, getAgentErrorMessage, InvokeEnabledStages } from '../../../../agents/core/utility';
import { ContentCreatorAgent } from '../../../../agents/content-creator';
import { NzMessageRef, NzMessageService } from 'ng-zorro-antd/message';


@Component({
  selector: 'app-aislide-description',
  templateUrl: './aislide-description.component.html',
  styleUrl: './aislide-description.component.scss',
})
export class AISlideDescriptionComponent {
  @Input() presentation!: Presentation;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  problemStatement?: string = '';
  thinkingText = '';
  AgentState = AgentState;
  private streamSub?: Subscription;
  private interrupt$ = new Subject<boolean>();
  @ViewChild('genContent')
  genContentElement!: ElementRef;
  @ViewChild('thinkingBox')
  thinkingBoxElement!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    public contentCreatorAgent: ContentCreatorAgent,
    public workspaceController: WorkspaceController,
    private presentationService:PresentationService,
    private geminiService: GeminiService,
    private message:NzMessageService
  ) {}

  get contentModel(): Model | undefined {
    return this.geminiService.getModel('content');
  }

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],

      [{ list: 'ordered' }, { list: 'bullet' }],

      ['blockquote', 'code-block'],

      ['link', 'image'],
    ],
  };

  open(): void {
    this.workspaceController.showSlideDescription = true;
  }

  handleCancel(): void {
    this.workspaceController.showSlideDescription = false;
    this.reset();
  }

  reset(): void {
    this.streamSub?.unsubscribe();
    this.interrupt$.next(true);
    this.problemStatement = '';
    this.thinkingText = '';
    this.cdr.detectChanges();
  }

  private showErrorMessage(message:string) {
     if(!this.errorMesgRef) {
      this.errorMesgRef =  this.message.error(message);
      this.errorMesgRef.onClose.subscribe((ev)=>{
        this.errorMesgRef = undefined;
      })
    }
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  errorMesgRef?: NzMessageRef;
  async trigger(): Promise<void> {
    this.thinkingText = '';
    const prevContent = this.workspaceController.scratchBookContent;
    this.workspaceController.scratchBookContent = '';
    try {
      this.contentCreatorAgent.triggerContentCreator({
        userProblemStatement: this.problemStatement!.trim(),
        previousContent: prevContent,
      });
      this.streamSub = this.contentCreatorAgent.contentCreatorStream.subscribe({
        next: (event) => {
          if (event.action === 'thinking') {
            this.thinkingText += event.message;
            this.scrollContOnValue(this.thinkingBoxElement?.nativeElement)
          } else if (event.action === 'content') {
            this.workspaceController.scratchBookContent += event.message;
            this.scrollContOnValue(this.genContentElement?.nativeElement)
          } else if (event.action === AgentState.error) {
            if(event.final) {
              this.showErrorMessage(getAgentErrorMessage(event.message))
            }
          }
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          this.cdr.detectChanges();
          this.showErrorMessage("Something Went Wrong");
        },
        complete: () => {
          this.cdr.detectChanges();
        },
      });
    } catch (err: unknown) {
      this.cdr.detectChanges();
      console.log(err);
      
    } finally {
      this.problemStatement = '';
    }
  }
  scrollContOnValue(el:any) {

    if (!el) {
      return;
    }

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const threshold = 100; // px

    if (distanceFromBottom <= threshold) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  ngOnDestroy(): void {
    this.streamSub?.unsubscribe();
    this.interrupt$.complete();
  }

  handleInvokeMagicSpider() {
    this.workspaceController.attachScratchBook = true;
    this.workspaceController.showMagicSpider();
    this.close.emit(true);
  }
  saveTimeOut:any;
  handleContentChange()
  {
    clearTimeout(this.saveTimeOut);
    this.saveTimeOut = setTimeout(()=>{
      this.presentationService.saveScratchBook(this.presentation.id,this.workspaceController.scratchBookContent);
    },1000);

  }
  
  isAgentIntractable()
  {
    return InvokeEnabledStages.includes(this.contentCreatorAgent.contentCreatorState);
  }
  isAgentInaction()
  {
    return AgentInActionStages.includes(this.contentCreatorAgent.contentCreatorState);
  }
}

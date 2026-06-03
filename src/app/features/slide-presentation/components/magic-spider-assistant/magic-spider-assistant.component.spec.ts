import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicSpiderAssistantComponent } from './magic-spider-assistant.component';

describe('MagicSpiderAssistantComponent', () => {
  let component: MagicSpiderAssistantComponent;
  let fixture: ComponentFixture<MagicSpiderAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MagicSpiderAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagicSpiderAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

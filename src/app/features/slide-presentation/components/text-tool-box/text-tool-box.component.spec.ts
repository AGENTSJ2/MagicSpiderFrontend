import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextToolBoxComponent } from './text-tool-box.component';

describe('TextToolBoxComponent', () => {
  let component: TextToolBoxComponent;
  let fixture: ComponentFixture<TextToolBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TextToolBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextToolBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

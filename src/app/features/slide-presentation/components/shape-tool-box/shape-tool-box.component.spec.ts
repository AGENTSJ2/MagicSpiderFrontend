import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShapeToolBoxComponent } from './shape-tool-box.component';

describe('ShapeToolBoxComponent', () => {
  let component: ShapeToolBoxComponent;
  let fixture: ComponentFixture<ShapeToolBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShapeToolBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShapeToolBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

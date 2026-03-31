import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentResultComponent } from './assignment-result.component';

describe('AssignmentResultComponent', () => {
  let component: AssignmentResultComponent;
  let fixture: ComponentFixture<AssignmentResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentResultComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

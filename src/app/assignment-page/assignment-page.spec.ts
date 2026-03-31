import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPage } from './assignment-page';

describe('AssignmentPage', () => {
  let component: AssignmentPage;
  let fixture: ComponentFixture<AssignmentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

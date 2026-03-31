import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostMatrixComponent } from './cost-matrix.component';

describe('CostMatrixComponent', () => {
  let component: CostMatrixComponent;
  let fixture: ComponentFixture<CostMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostMatrixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostMatrixComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyOrderComponent } from './copy-order.component';

describe('CopyOrderComponent', () => {
  let component: CopyOrderComponent;
  let fixture: ComponentFixture<CopyOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopyOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CopyOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

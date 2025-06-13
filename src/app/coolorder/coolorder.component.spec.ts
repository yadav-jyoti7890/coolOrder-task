import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolorderComponent } from './coolorder.component';

describe('CoolorderComponent', () => {
  let component: CoolorderComponent;
  let fixture: ComponentFixture<CoolorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoolorderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoolorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

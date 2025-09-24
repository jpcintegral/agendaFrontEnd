import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveEventComponent } from './approve-event.component';

describe('ApproveEventComponent', () => {
  let component: ApproveEventComponent;
  let fixture: ComponentFixture<ApproveEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

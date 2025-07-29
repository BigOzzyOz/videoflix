import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrientationWarningComponent } from './orientation-warning.component';

describe('OrientationWarningComponent', () => {
  let component: OrientationWarningComponent;
  let fixture: ComponentFixture<OrientationWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrientationWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrientationWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

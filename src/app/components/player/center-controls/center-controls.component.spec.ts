import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterControlsComponent } from './center-controls.component';

describe('CenterControlsComponent', () => {
  let component: CenterControlsComponent;
  let fixture: ComponentFixture<CenterControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

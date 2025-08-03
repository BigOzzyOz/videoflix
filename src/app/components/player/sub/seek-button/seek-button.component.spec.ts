import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekButtonComponent } from './seek-button.component';

describe('SeekButtonsComponent', () => {
  let component: SeekButtonComponent;
  let fixture: ComponentFixture<SeekButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeekButtonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SeekButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

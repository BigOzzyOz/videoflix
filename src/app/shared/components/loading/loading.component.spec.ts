import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show spinner when loadingService.loading() returns true', () => {
    spyOn(component.loadingService, 'loading').and.returnValue(true);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section.loading');
    expect(section).toBeTruthy();
    expect(section.classList.contains('hidden')).toBe(false);
    const svg = section.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should hide spinner when loadingService.loading() returns false', () => {
    spyOn(component.loadingService, 'loading').and.returnValue(false);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section.loading');
    expect(section).toBeTruthy();
    expect(section.classList.contains('hidden')).toBe(true);
  });
});

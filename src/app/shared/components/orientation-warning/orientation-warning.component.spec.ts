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

  it('should show warning in portrait when requiredOrientation is landscape and isPortrait is true', () => {
    spyOnProperty(component.orientationService, 'isPortrait', 'get').and.returnValue(true);
    component.requiredOrientation = 'landscape';
    component.showOnlyOnMobile = false;
    fixture.detectChanges();
    expect(component.shouldShow).toBeTrue();
  });

  it('should not show warning in landscape when requiredOrientation is landscape and isPortrait is false', () => {
    spyOnProperty(component.orientationService, 'isPortrait', 'get').and.returnValue(false);
    component.requiredOrientation = 'landscape';
    component.showOnlyOnMobile = false;
    fixture.detectChanges();
    expect(component.shouldShow).toBeFalse();
  });

  it('should show warning in landscape when requiredOrientation is portrait and isLandscape is true', () => {
    spyOnProperty(component.orientationService, 'isLandscape', 'get').and.returnValue(true);
    component.requiredOrientation = 'portrait';
    component.showOnlyOnMobile = false;
    fixture.detectChanges();
    expect(component.shouldShow).toBeTrue();
  });

  it('should not show warning in portrait when requiredOrientation is portrait and isLandscape is false', () => {
    spyOnProperty(component.orientationService, 'isLandscape', 'get').and.returnValue(false);
    component.requiredOrientation = 'portrait';
    component.showOnlyOnMobile = false;
    fixture.detectChanges();
    expect(component.shouldShow).toBeFalse();
  });

  it('should not show warning on desktop when showOnlyOnMobile is true', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1024);
    component.showOnlyOnMobile = true;
    fixture.detectChanges();
    expect(component.shouldShow).toBeFalse();
  });

  it('should render correct icon for landscape', () => {
    component.requiredOrientation = 'landscape';
    fixture.detectChanges();
    expect(component.orientationIcon).toBe('landscape');
  });

  it('should render correct icon for portrait', () => {
    component.requiredOrientation = 'portrait';
    fixture.detectChanges();
    expect(component.orientationIcon).toBe('portrait');
  });

  it('should use custom message when provided', () => {
    component.message = 'Custom orientation message';
    fixture.detectChanges();
    expect(component.message).toBe('Custom orientation message');
  });
});

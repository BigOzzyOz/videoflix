import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullscreenButtonComponent } from './fullscreen-button.component';
import { FullscreenService } from '../../../../shared/services/fullscreen.service';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

describe('FullscreenButtonComponent', () => {
  let component: FullscreenButtonComponent;
  let fixture: ComponentFixture<FullscreenButtonComponent>;
  let fullscreenServiceSpy: jasmine.SpyObj<FullscreenService>;
  let playerStateServiceSpy: jasmine.SpyObj<PlayerStateService>;

  beforeEach(async () => {
    fullscreenServiceSpy = jasmine.createSpyObj('FullscreenService', ['toggleFullscreen']);
    playerStateServiceSpy = jasmine.createSpyObj('PlayerStateService', ['isFullscreen']);

    await TestBed.configureTestingModule({
      imports: [FullscreenButtonComponent],
      providers: [
        { provide: FullscreenService, useValue: fullscreenServiceSpy },
        { provide: PlayerStateService, useValue: playerStateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FullscreenButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call toggleFullscreen on FullscreenService when onToggleFullscreen is called', () => {
    component.onToggleFullscreen();
    expect(fullscreenServiceSpy.toggleFullscreen).toHaveBeenCalled();
  });

  it('isFullscreen should return value from PlayerStateService', () => {
    playerStateServiceSpy.isFullscreen.and.returnValue(true);
    expect(component.isFullscreen).toBeTrue();
    playerStateServiceSpy.isFullscreen.and.returnValue(false);
    expect(component.isFullscreen).toBeFalse();
  });
});

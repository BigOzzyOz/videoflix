import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpeedControlComponent } from './speed-control.component';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

describe('SpeedControlComponent', () => {
  let component: SpeedControlComponent;
  let fixture: ComponentFixture<SpeedControlComponent>;
  let playerStateSpy: jasmine.SpyObj<PlayerStateService>;

  beforeEach(async () => {
    playerStateSpy = jasmine.createSpyObj('PlayerStateService', [
      'toggleSpeedMenu', 'setPlaybackSpeed', 'setShowSpeedMenu', 'playbackSpeed', 'showSpeedMenu'
    ]);

    await TestBed.configureTestingModule({
      imports: [SpeedControlComponent],
      providers: [
        { provide: PlayerStateService, useValue: playerStateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SpeedControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call toggleSpeedMenu on PlayerStateService when onToggleSpeedMenu is called', () => {
    component.onToggleSpeedMenu();
    expect(playerStateSpy.toggleSpeedMenu).toHaveBeenCalled();
  });

  it('should call setPlaybackSpeed and setShowSpeedMenu when onSelectSpeed is called', () => {
    spyOn(window, 'setTimeout').and.callFake((handler: TimerHandler) => {
      if (typeof handler === 'function') handler();
      return 0;
    });
    component.onSelectSpeed(1.5);
    expect(playerStateSpy.setPlaybackSpeed).toHaveBeenCalledWith(1.5);
    expect(playerStateSpy.setShowSpeedMenu).toHaveBeenCalledWith(false);
  });

  it('getSpeedLabel should return correct label for normal speed', () => {
    expect(component.getSpeedLabel(1)).toBe('Normal');
  });

  it('getSpeedLabel should return correct label for other speeds', () => {
    expect(component.getSpeedLabel(1.5)).toBe('1.5x');
  });

  it('currentSpeed getter should return value from PlayerStateService', () => {
    playerStateSpy.playbackSpeed.and.returnValue(1.25);
    expect(component.currentSpeed).toBe(1.25);
  });

  it('showSpeedMenu getter should return value from PlayerStateService', () => {
    playerStateSpy.showSpeedMenu.and.returnValue(true);
    expect(component.showSpeedMenu).toBeTrue();
    playerStateSpy.showSpeedMenu.and.returnValue(false);
    expect(component.showSpeedMenu).toBeFalse();
  });

  it('should stop propagation on container click', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    component.onContainerClick(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should call setShowSpeedMenu(false) on document click', () => {
    component.onDocumentClick();
    expect(playerStateSpy.setShowSpeedMenu).toHaveBeenCalledWith(false);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { PlayerService } from '../../../../shared/services/player.service';
import { SeekService } from '../../../../shared/services/seek.service';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let playerStateSpy: jasmine.SpyObj<PlayerStateService>;
  let playerServiceSpy: jasmine.SpyObj<PlayerService>;
  let seekServiceSpy: jasmine.SpyObj<SeekService>;

  beforeEach(async () => {
    playerStateSpy = jasmine.createSpyObj('PlayerStateService', [
      'progress', 'bufferedPercentage', 'progressTime', 'isScrubbing', 'videoDuration',
      'showSeekTooltip', 'seekTooltipTime', 'seekTooltipPosition',
      'setSeekTooltipTime', 'setSeekTooltipPosition', 'setShowSeekTooltip'
    ]);
    playerServiceSpy = jasmine.createSpyObj('PlayerService', ['dummyMethod']);
    seekServiceSpy = jasmine.createSpyObj('SeekService', [
      'scrubStart', 'scrubbing', 'scrubEnd', 'scrubbingTouch', 'scrubEndTouch', 'progressClick'
    ]);

    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [
        { provide: PlayerStateService, useValue: playerStateSpy },
        { provide: PlayerService, useValue: playerServiceSpy },
        { provide: SeekService, useValue: seekServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call scrubStart on SeekService when onSeekStart is called', () => {
    component.onSeekStart();
    expect(seekServiceSpy.scrubStart).toHaveBeenCalled();
  });

  it('should call scrubbing on SeekService when onScrubbing is called', () => {
    const event = new Event('mousemove');
    component.onScrubbing(event);
    expect(seekServiceSpy.scrubbing).toHaveBeenCalledWith(event);
  });

  it('should call scrubEnd on SeekService when onSeekEnd is called', () => {
    const event = new Event('mouseup');
    component.onSeekEnd(event);
    expect(seekServiceSpy.scrubEnd).toHaveBeenCalledWith(event);
  });

  it('should update tooltip and call PlayerStateService methods when updateTooltip is called', () => {
    playerStateSpy.videoDuration.and.returnValue(100);
    const mockTarget = { getBoundingClientRect: () => ({ left: 0, width: 100 }) } as HTMLElement;
    const mockEvent = new MouseEvent('mousemove', { clientX: 50 });
    Object.defineProperty(mockEvent, 'currentTarget', { value: mockTarget });

    component.updateTooltip(mockEvent);

    expect(playerStateSpy.setSeekTooltipTime).toHaveBeenCalled();
    expect(playerStateSpy.setSeekTooltipPosition).toHaveBeenCalled();
    expect(playerStateSpy.setShowSeekTooltip).toHaveBeenCalledWith(true);
  });

  it('should call setShowSeekTooltip(false) when hideTooltip is called', () => {
    component.hideTooltip();
    expect(playerStateSpy.setShowSeekTooltip).toHaveBeenCalledWith(false);
  });

  it('should call scrubStart on SeekService when onTouchStart is called', () => {
    const event = new TouchEvent('touchstart');
    spyOn(event, 'preventDefault');
    component.onTouchStart(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(seekServiceSpy.scrubStart).toHaveBeenCalled();
  });

  it('should call scrubbingTouch on SeekService when onTouchMove is called', () => {
    const event = new TouchEvent('touchmove');
    spyOn(event, 'preventDefault');
    component.onTouchMove(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(seekServiceSpy.scrubbingTouch).toHaveBeenCalledWith(event);
  });

  it('should call scrubEndTouch on SeekService when onTouchEnd is called', () => {
    const event = new TouchEvent('touchend');
    spyOn(event, 'preventDefault');
    component.onTouchEnd(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(seekServiceSpy.scrubEndTouch).toHaveBeenCalledWith(event);
  });

  it('should call progressClick on SeekService when onProgressClick is called', () => {
    const event = new MouseEvent('click');
    component.onProgressClick(event);
    expect(seekServiceSpy.progressClick).toHaveBeenCalledWith(event);
  });

  it('progressPercentage getter should return value from PlayerStateService', () => {
    playerStateSpy.progress.and.returnValue(42);
    expect(component.progressPercentage).toBe(42);
  });

  it('bufferedPercentage getter should return value from PlayerStateService', () => {
    playerStateSpy.bufferedPercentage.and.returnValue(55);
    expect(component.bufferedPercentage).toBe(55);
  });

  it('progressTime getter should return value from PlayerStateService', () => {
    playerStateSpy.progressTime.and.returnValue(12);
    expect(component.progressTime).toBe(12);
  });

  it('isScrubbing getter should return value from PlayerStateService', () => {
    playerStateSpy.isScrubbing.and.returnValue(true);
    expect(component.isScrubbing).toBeTrue();
    playerStateSpy.isScrubbing.and.returnValue(false);
    expect(component.isScrubbing).toBeFalse();
  });

  it('videoDuration getter should return value from PlayerStateService', () => {
    playerStateSpy.videoDuration.and.returnValue(99);
    expect(component.videoDuration).toBe(99);
  });

  it('showSeekTooltip getter should return value from PlayerStateService', () => {
    playerStateSpy.showSeekTooltip.and.returnValue(true);
    expect(component.showSeekTooltip).toBeTrue();
    playerStateSpy.showSeekTooltip.and.returnValue(false);
    expect(component.showSeekTooltip).toBeFalse();
  });

  it('seekTooltipTime getter should return value from PlayerStateService', () => {
    playerStateSpy.seekTooltipTime.and.returnValue(33);
    expect(component.seekTooltipTime).toBe(33);
  });

  it('seekTooltipPosition getter should return value from PlayerStateService', () => {
    playerStateSpy.seekTooltipPosition.and.returnValue(77);
    expect(component.seekTooltipPosition).toBe(77);
  });
});

import { TestBed } from '@angular/core/testing';
import { PlayerStateService } from './player-state.service';

describe('PlayerStateService', () => {
  let service: PlayerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get video state', () => {
    service.setVideo({ id: '1', hls: 'url', title: 'Test' } as any);
    service.setIsOptimizing(false);
    expect(service.isOptimizing()).toBeFalse();
    expect(service.video()?.title).toBe('Test');
    expect(service.videoUrl()).toBe('url');
    expect(service.videoId()).toBe('1');
    service.setVideo(null);
    expect(service.video()).toBeNull();
  });

  it('should set and get playback state', () => {
    service.setIsPlaying(true);
    expect(service.isPlaying()).toBeTrue();
    service.setIsPlaying(false);
    expect(service.isPlaying()).toBeFalse();
    service.togglePlay();
    expect(service.isPlaying()).toBeTrue();
  });

  it('should set and get volume and mute state', () => {
    service.setVolume(0.8);
    expect(service.volume()).toBe(0.8);
    service.setIsMuted(true);
    expect(service.isMuted()).toBeTrue();
    service.toggleMute();
    expect(service.isMuted()).toBeFalse();
  });

  it('should clamp volume between 0 and 1', () => {
    service.setVolume(2);
    expect(service.volume()).toBe(1);
    expect(service.volumePercentage()).toBe(100);
    service.setVolume(-1);
    expect(service.volume()).toBe(0);
  });

  it('should set and get fullscreen state', () => {
    service.setIsFullscreen(true);
    expect(service.isFullscreen()).toBeTrue();
    service.setIsFullscreen(false);
    expect(service.isFullscreen()).toBeFalse();
  });

  it('should set and get overlay state', () => {
    service.setShowOverlay(false);
    expect(service.showOverlay()).toBeFalse();
    service.toggleOverlay();
    expect(service.showOverlay()).toBeTrue();
  });

  it('should set and get speed menu state', () => {
    service.setShowSpeedMenu(true);
    expect(service.showSpeedMenu()).toBeTrue();
    service.setAvailableSpeeds([0.5, 1, 1.5, 2]);
    expect(service.availableSpeeds()).toEqual([0.5, 1, 1.5, 2]);
    service.toggleSpeedMenu();
    expect(service.showSpeedMenu()).toBeFalse();
  });

  it('should set and get volume control state', () => {
    service.setShowVolumeControl(true);
    service.setShowVolumeTooltip(true);
    service.setVolumeTooltipPosition(0.5);
    expect(service.volumeTooltipPosition()).toBe(0.5);
    expect(service.showVolumeTooltip()).toBeTrue();
    expect(service.showVolumeControl()).toBeTrue();
    service.toggleVolumeControl();
    expect(service.showVolumeControl()).toBeFalse();
  });

  it('should set and get progress and duration', () => {
    service.setProgressTime(50);
    service.setVideoDuration(100);
    service.setIsScrubbing(true);
    expect(service.isScrubbing()).toBeTrue();
    service.setIsScrubbing(false);
    expect(service.isScrubbing()).toBeFalse();
    expect(service.progressTime()).toBe(50);
    expect(service.videoDuration()).toBe(100);
    expect(service.getCurrentTimePercentage()).toBe(50);
    expect(service.progress()).toBe(50);
    service.setVideoDuration(-1);
    expect(service.videoDuration()).toBe(-1);
    expect(service.getCurrentTimePercentage()).toBe(0);
    expect(service.progress()).toBe(0);
  });

  it('should format time correctly', () => {
    expect(service.getFormattedTime(65)).toBe('1:05');
    service.setProgressTime(125);
    expect(service.getCurrentTimeFormatted()).toBe('2:05');
    service.setVideoDuration(3600);
    service.setBufferedTime(0);
    service.setSeekTooltipTime(0);
    expect(service.getDurationFormatted()).toBe('60:00');
    expect(service.bufferedPercentage()).toBe(0);
    expect(service.seekTooltipTimeFormatted()).toBe('0:00');
  });

  it('should reset state', () => {
    service.setIsPlaying(true);
    service.setVolume(0.8);
    service.setIsMuted(true);
    service.setIsFullscreen(true);
    service.setShowOverlay(false);
    service.resetState();
    expect(service.isPlaying()).toBeFalse();
    expect(service.volume()).toBe(0.5);
    expect(service.isMuted()).toBeFalse();
    expect(service.isFullscreen()).toBeFalse();
    expect(service.showOverlay()).toBeTrue();
  });

  it('should set and get player state correctly', () => {
    const mockPlayer = {
      play: jasmine.createSpy('play'),
      pause: jasmine.createSpy('pause'),
      currentTime: jasmine.createSpy('currentTime').and.returnValue(0),
      duration: jasmine.createSpy('duration').and.returnValue(100),
      playbackRate: jasmine.createSpy('playbackRate').and.returnValue(1.5)
    } as any;
    service.player = mockPlayer;
    service.setViewInitialized(true);
    service.setPlaybackSpeed(1.5);
    expect(service.playbackSpeed()).toBe(1.5);
    expect(service.player?.playbackRate()).toBe(1.5);
    expect(service.viewInitialized()).toBeTrue();
    expect(service.player).toBeDefined();
    expect(service.player).toBe(mockPlayer);
    expect(service.player?.play).toBeDefined();
    expect(service.player?.pause).toBeDefined();
    expect(service.player?.currentTime()).toBe(0);
    expect(service.player?.duration()).toBe(100);
    expect(service.canPlay()).toBeTrue();
  });

  it('should handle seek states correctly', () => {
    service.setLastSaveTime(0);
    expect(service.seekTooltipTime()).toBe(0);
    service.setLastSeekTime(120);
    expect(service.lastSeekTime()).toBe(120);
    service.setShowSeekTooltip(true);
    expect(service.showSeekTooltip()).toBeTrue();
    service.setSeekTooltipPosition(0.3);
    expect(service.seekTooltipPosition()).toBe(0.3);
    service.setSeekTooltipTime(30);
    expect(service.seekTooltipTime()).toBe(30);
    expect(service.seekTooltipTimeFormatted()).toBe('0:30');
  });
});


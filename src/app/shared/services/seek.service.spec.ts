import { TestBed } from '@angular/core/testing';

import { SeekService } from './seek.service';

describe('SeekService', () => {
  let service: SeekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('scrubStart', () => {
    it('should set scrubbing and pause player', () => {
      const setIsScrubbing = jasmine.createSpy();
      const pause = jasmine.createSpy();
      (service as any).playerState = { setIsScrubbing, player: { pause } };
      service.scrubStart();
      expect(setIsScrubbing).toHaveBeenCalledWith(true);
      expect(pause).toHaveBeenCalled();
    });
  });

  describe('scrubbing', () => {
    it('should set seek time from input event', () => {
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      const event = { target: { value: '42' } } as any;
      service.scrubbing(event);
      expect(setSeekTime).toHaveBeenCalledWith(42, false);
    });
  });

  describe('scrubbingTouch', () => {
    it('should set seek time from touch event', () => {
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      (service as any).playerState = { videoDuration: () => 100 };
      const event = {
        touches: [{ clientX: 60 }],
        currentTarget: {
          getBoundingClientRect: () => ({ left: 10, width: 100 })
        }
      } as any;
      service.scrubbingTouch(event);
      // x = 60 - 10 = 50; percentage = 50/100 = 0.5; time = 50
      expect(setSeekTime).toHaveBeenCalledWith(50, false);
    });
  });

  describe('scrubEnd', () => {
    it('should set scrubbing false and set seek time', () => {
      const setIsScrubbing = jasmine.createSpy();
      const setSeekTime = jasmine.createSpy();
      (service as any).playerState = { setIsScrubbing };
      (service as any).setSeekTime = setSeekTime;
      const event = { target: { value: '77' } } as any;
      service.scrubEnd(event);
      expect(setIsScrubbing).toHaveBeenCalledWith(false);
      expect(setSeekTime).toHaveBeenCalledWith(77, true);
    });
  });

  describe('scrubEndTouch', () => {
    it('should set scrubbing false and set seek time from progressTime', () => {
      const setIsScrubbing = jasmine.createSpy();
      const setSeekTime = jasmine.createSpy();
      (service as any).playerState = { setIsScrubbing, progressTime: () => 33 };
      (service as any).setSeekTime = setSeekTime;
      service.scrubEndTouch({} as any);
      expect(setIsScrubbing).toHaveBeenCalledWith(false);
      expect(setSeekTime).toHaveBeenCalledWith(33, true);
    });
  });

  describe('progressClick', () => {
    it('should set seek time from mouse event', () => {
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      (service as any).playerState = { videoDuration: () => 100 };
      const event = {
        clientX: 60,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 10, width: 100 })
        }
      } as any;
      service.progressClick(event);
      // x = 60 - 10 = 50; percentage = 0.5; time = 50
      expect(setSeekTime).toHaveBeenCalledWith(50, false);
    });
  });

  describe('canSeek', () => {
    it('should return true if canPlay and duration > 0', () => {
      (service as any).playerState = { canPlay: () => true, videoDuration: () => 10 };
      expect(service.canSeek()).toBeTrue();
    });
    it('should return false if cannot play', () => {
      (service as any).playerState = { canPlay: () => false, videoDuration: () => 10 };
      expect(service.canSeek()).toBeFalse();
    });
    it('should return false if duration <= 0', () => {
      (service as any).playerState = { canPlay: () => true, videoDuration: () => 0 };
      expect(service.canSeek()).toBeFalse();
    });
  });

  describe('seekBy', () => {
    it('should set seek time by seconds if can seek', () => {
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      (service as any).playerState = {
        player: {},
        canPlay: () => true,
        videoDuration: () => 100,
        progressTime: () => 10
      };
      service.seekBy(5);
      expect(setSeekTime).toHaveBeenCalledWith(15, false);
    });
    it('should clamp seek time to duration - 1', () => {
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      (service as any).playerState = {
        player: {},
        canPlay: () => true,
        videoDuration: () => 20,
        progressTime: () => 19
      };
      service.seekBy(5);
      expect(setSeekTime).toHaveBeenCalledWith(19, false);
    });
    it('should not seek if cannot seek', () => {
      (service as any).playerState = {
        player: {},
        canPlay: () => false,
        videoDuration: () => 100,
        progressTime: () => 10
      };
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      service.seekBy(5);
      expect(setSeekTime).not.toHaveBeenCalled();
    });
  });

  describe('seekTo', () => {
    it('should set seek time to clamped value if can seek', () => {
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      (service as any).playerState = {
        player: {},
        canPlay: () => true,
        videoDuration: () => 100
      };
      service.seekTo(150);
      expect(setSeekTime).toHaveBeenCalledWith(100, false);
    });
    it('should not seek if cannot seek', () => {
      (service as any).playerState = {
        player: {},
        canPlay: () => false,
        videoDuration: () => 100
      };
      const setSeekTime = jasmine.createSpy();
      (service as any).setSeekTime = setSeekTime;
      service.seekTo(50);
      expect(setSeekTime).not.toHaveBeenCalled();
    });
  });

  describe('seekToPercentage', () => {
    it('should seek to correct percentage', () => {
      const seekTo = jasmine.createSpy();
      (service as any).seekTo = seekTo;
      (service as any).playerState = { videoDuration: () => 100 };
      service.seekToPercentage(0.25);
      expect(seekTo).toHaveBeenCalledWith(25);
    });
  });

  describe('handleKeyboardSeek', () => {
    it('should seek right by default seconds', () => {
      const seekBy = jasmine.createSpy();
      (service as any).seekBy = seekBy;
      service.handleKeyboardSeek('right');
      expect(seekBy).toHaveBeenCalledWith(10);
    });
    it('should seek left by negative seconds', () => {
      const seekBy = jasmine.createSpy();
      (service as any).seekBy = seekBy;
      service.handleKeyboardSeek('left', 5);
      expect(seekBy).toHaveBeenCalledWith(-5);
    });
  });

  describe('setSeekTime', () => {
    it('should set progress time and player currentTime', () => {
      const setProgressTime = jasmine.createSpy();
      const currentTime = jasmine.createSpy();
      const play = jasmine.createSpy().and.returnValue(Promise.resolve());
      (service as any).playerState = { setProgressTime, player: { currentTime, play } };
      service.setSeekTime(42, false);
      expect(setProgressTime).toHaveBeenCalledWith(42);
      expect(currentTime).toHaveBeenCalledWith(42);
    });
    it('should play when run is true', async () => {
      const setProgressTime = jasmine.createSpy();
      const currentTime = jasmine.createSpy();
      const play = jasmine.createSpy().and.returnValue(Promise.resolve());
      (service as any).playerState = { setProgressTime, player: { currentTime, play } };
      await service.setSeekTime(42, true);
      expect(play).toHaveBeenCalled();
    });
    it('should show error if play fails', async () => {
      const setProgressTime = jasmine.createSpy();
      const currentTime = jasmine.createSpy();
      const play = jasmine.createSpy().and.returnValue(Promise.reject('fail'));
      const show = jasmine.createSpy();
      (service as any).playerState = { setProgressTime, player: { currentTime, play } };
      (service as any).errorService = { show };
      await service.setSeekTime(42, true);
      expect(show).toHaveBeenCalledWith('Error resuming playback after seek. Please try again.');
    });
  });

  describe('jumpTime', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });
    afterEach(() => {
      jasmine.clock().uninstall();
    });
    it('should debounce repeated jumps', () => {
      (service as any).playerState = {
        viewInitialized: () => true,
        player: {},
        videoId: () => 'vid',
        videoDuration: () => 100,
        progressTime: () => 10
      };
      (service as any).progressService = { getResumeTime: () => 0 };
      const seekTo = jasmine.createSpy();
      (service as any).seekTo = seekTo;
      let now = 1000;
      spyOn(Date, 'now').and.callFake(() => now);
      (service as any).lastSeekTime = 0;
      service.jumpTime(5);
      expect(seekTo).toHaveBeenCalled();
      seekTo.calls.reset();
      now += 100; // Not enough time passed
      service.jumpTime(5);
      expect(seekTo).not.toHaveBeenCalled();
      now += 501; // Enough time passed
      service.jumpTime(5);
      expect(seekTo).toHaveBeenCalled();
    });
    it('should show error if player not ready', () => {
      const show = jasmine.createSpy();
      (service as any).playerState = {
        viewInitialized: () => false,
        player: null,
        videoId: () => 'vid',
        videoDuration: () => undefined,
        progressTime: () => 10
      };
      (service as any).errorService = { show };
      service.jumpTime(5);
      expect(show).toHaveBeenCalledWith('Player is not ready for seeking');
    });
    it('should seek to resume time on init', () => {
      (service as any).playerState = {
        viewInitialized: () => true,
        player: {},
        videoId: () => 'vid',
        videoDuration: () => 100,
        progressTime: () => 10
      };
      (service as any).progressService = { getResumeTime: () => 50 };
      const seekTo = jasmine.createSpy();
      (service as any).seekTo = seekTo;
      service.jumpTime(5, true);
      expect(seekTo).toHaveBeenCalledWith(50);
    });
    it('should seek to clamped time if not init', () => {
      (service as any).playerState = {
        viewInitialized: () => true,
        player: {},
        videoId: () => 'vid',
        videoDuration: () => 100,
        progressTime: () => 95
      };
      (service as any).progressService = { getResumeTime: () => 0 };
      const seekTo = jasmine.createSpy();
      (service as any).seekTo = seekTo;
      service.jumpTime(10, false);
      expect(seekTo).toHaveBeenCalledWith(99);
    });
  });
});

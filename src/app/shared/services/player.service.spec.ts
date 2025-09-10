import { TestBed } from '@angular/core/testing';

import { PlayerService } from './player.service';
import { Profile } from '../models/profile';
import * as videojsModule from 'video.js';

(window as any).videojs = jasmine.createSpy('videojs').and.callFake(() => ({
  on: jasmine.createSpy('on'),
  one: jasmine.createSpy('one'),
  ready: jasmine.createSpy('ready'),
  error: jasmine.createSpy('error'),
  play: jasmine.createSpy('play'),
  pause: jasmine.createSpy('pause')
}));

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('playerErrorHandler', () => {
    let errorServiceSpy: jasmine.SpyObj<any>;

    beforeEach(() => {
      errorServiceSpy = jasmine.createSpyObj('ErrorService', ['show']);
      (service as any).errorService = errorServiceSpy;
    });

    it('should show correct message for MEDIA_ERR_ABORTED', () => {
      const error = { code: 1, MEDIA_ERR_ABORTED: 1 };
      service.playerErrorHandler(error as any);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Video loading was aborted');
    });

    it('should show correct message for MEDIA_ERR_NETWORK', () => {
      const error = { code: 2, MEDIA_ERR_NETWORK: 2 };
      service.playerErrorHandler(error as any);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Network error while loading video');
    });

    it('should show correct message for MEDIA_ERR_DECODE', () => {
      const error = { code: 3, MEDIA_ERR_DECODE: 3 };
      service.playerErrorHandler(error as any);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Video could not be decoded');
    });

    it('should show correct message for MEDIA_ERR_SRC_NOT_SUPPORTED', () => {
      const error = { code: 4, MEDIA_ERR_SRC_NOT_SUPPORTED: 4 };
      service.playerErrorHandler(error as any);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Video format not supported');
    });

    it('should show unknown error for unknown code', () => {
      const error = { code: 99 };
      service.playerErrorHandler(error as any);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Unknown video error occurred');
    });

    it('should show unexpected error for null', () => {
      service.playerErrorHandler(null);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('An unexpected error occurred');
    });
  });

  describe('togglePlay', () => {
    let playerMock: any;
    let playerStateMock: any;
    let overlayServiceSpy: jasmine.SpyObj<any>;
    let errorServiceSpy: jasmine.SpyObj<any>;

    beforeEach(() => {
      playerMock = {
        paused: jasmine.createSpy().and.returnValue(true),
        play: jasmine.createSpy().and.returnValue(Promise.resolve()),
        pause: jasmine.createSpy()
      };
      playerStateMock = {
        player: playerMock,
        setIsPlaying: jasmine.createSpy(),
        isPlaying: jasmine.createSpy('isPlaying')
      };
      overlayServiceSpy = jasmine.createSpyObj('OverlayService', ['resetOverlayTimer']);
      errorServiceSpy = jasmine.createSpyObj('ErrorService', ['show']);
      (service as any).playerState = playerStateMock;
      (service as any).overlayService = overlayServiceSpy;
      (service as any).errorService = errorServiceSpy;
    });

    it('should play and set isPlaying true if paused', async () => {
      await service.togglePlay();
      expect(playerMock.play).toHaveBeenCalled();
      expect(playerStateMock.setIsPlaying).toHaveBeenCalledWith(true);
      expect(overlayServiceSpy.resetOverlayTimer).toHaveBeenCalledWith(true);
    });

    it('should pause and set isPlaying false if not paused', async () => {
      playerMock.paused.and.returnValue(false);
      await service.togglePlay();
      expect(playerMock.pause).toHaveBeenCalled();
      expect(playerStateMock.setIsPlaying).toHaveBeenCalledWith(false);
    });

    it('should show error if player not available', async () => {
      playerStateMock.player = null;
      await service.togglePlay();
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Player not available.');
    });

    it('should handle error in togglePlay catch block', async () => {
      playerMock.play.and.returnValue(Promise.reject('ToggleError'));
      await service.togglePlay();
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Error playing video. Please try again.');
    });
  });

  describe('pause', () => {
    it('should call pause on player if available', () => {
      const playerMock = { pause: jasmine.createSpy() };
      (service as any).playerState = { player: playerMock };
      service.pause();
      expect(playerMock.pause).toHaveBeenCalled();
    });

    it('should do nothing if player is not available', () => {
      (service as any).playerState = { player: null };
      expect(() => service.pause()).not.toThrow();
    });
  });

  describe('initializePlayer', () => {
    // beforeEach(() => {
    //   spyOn<any>(videojsModule, 'default').and.callFake(() => ({
    //     on: jasmine.createSpy('on'),
    //     one: jasmine.createSpy('one'),
    //     ready: jasmine.createSpy('ready'),
    //     error: jasmine.createSpy('error'),
    //     play: jasmine.createSpy('play'),
    //     pause: jasmine.createSpy('pause')
    //   }));
    // });

    it('should show error if videoElement is null', () => {
      const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['show']);
      (service as any).errorService = errorServiceSpy;
      service.initializePlayer(null as any);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Video player could not be initialized');
    });

    it('should bind events and set player', () => {
      const playerMock: any = {
        ready: jasmine.createSpy().and.callFake((cb: any) => cb()),
        one: jasmine.createSpy().and.callFake((ev: string, cb: any) => cb()),
        on: jasmine.createSpy(),
        error: jasmine.createSpy()
      };
      spyOn(service, 'playerCreateHandler').and.returnValue(playerMock);
      const playerStateMock: any = { player: null, setViewInitialized: jasmine.createSpy() };
      (service as any).playerState = playerStateMock;
      (service as any).loadMetaHandler = jasmine.createSpy();
      service.initializePlayer({} as any);
      expect(service.playerCreateHandler).toHaveBeenCalled();
      expect(playerStateMock.player).toBe(playerMock);
      expect(playerMock.ready).toHaveBeenCalled();
      expect(playerMock.one).toHaveBeenCalled();
      expect(playerMock.on).toHaveBeenCalled();
    });

    it('should call timeUpdateHandler on timeupdate event', async () => {
      const playerMock = {
        on: jasmine.createSpy('on'),
        ready: jasmine.createSpy('ready'),
        one: jasmine.createSpy('one'),
        error: jasmine.createSpy('error'),
        play: jasmine.createSpy('play'),
        pause: jasmine.createSpy('pause'),
      };
      spyOn(service, 'playerCreateHandler').and.returnValue(playerMock);
      spyOn(service, 'timeUpdateHandler').and.returnValue(Promise.resolve());

      service.initializePlayer({} as any);

      expect(playerMock.on).toHaveBeenCalledWith('timeupdate', jasmine.any(Function));

      const timeUpdateCallback = playerMock.on.calls.all().find(call => call.args[0] === 'timeupdate')?.args[1];
      expect(timeUpdateCallback).toBeDefined();

      if (timeUpdateCallback) {
        await timeUpdateCallback();
        expect(service.timeUpdateHandler).toHaveBeenCalled();
      }
    });

    it('should set loading to false on canplay event', () => {
      const playerMock = {
        on: jasmine.createSpy('on'),
        ready: jasmine.createSpy('ready'),
        one: jasmine.createSpy('one'),
        error: jasmine.createSpy('error'),
        play: jasmine.createSpy('play'),
        pause: jasmine.createSpy('pause'),
      };
      spyOn(service, 'playerCreateHandler').and.returnValue(playerMock);
      spyOn(service.loadingService, 'setLoading');

      service.initializePlayer({} as any);

      expect(playerMock.on).toHaveBeenCalledWith('canplay', jasmine.any(Function));

      const canplayCallback = playerMock.on.calls.all().find(call => call.args[0] === 'canplay')?.args[1];
      expect(canplayCallback).toBeDefined();

      if (canplayCallback) {
        canplayCallback();
        expect(service.loadingService.setLoading).toHaveBeenCalledWith(false);
      }
    });

    it('should call playerPauseHandler on pause event', async () => {
      const playerMock = {
        on: jasmine.createSpy('on'),
        error: jasmine.createSpy(),
        ready: jasmine.createSpy('ready'),
        one: jasmine.createSpy('one'),
        play: jasmine.createSpy('play'),
        pause: jasmine.createSpy('pause'),
      };
      spyOn(service, 'playerCreateHandler').and.returnValue(playerMock);
      spyOn(service, 'playerPauseHandler').and.returnValue(Promise.resolve());

      service.initializePlayer({} as any);

      expect(playerMock.on).toHaveBeenCalledWith('pause', jasmine.any(Function));

      const pauseCallback = playerMock.on.calls.all().find(call => call.args[0] === 'pause')?.args[1];
      expect(pauseCallback).toBeDefined();

      if (pauseCallback) {
        await pauseCallback();
        expect(service.playerPauseHandler).toHaveBeenCalled();
      }
    });

    it('should call playerEndHandler on ended event', async () => {
      const playerMock = {
        on: jasmine.createSpy('on'),
        error: jasmine.createSpy(),
        ready: jasmine.createSpy('ready'),
        one: jasmine.createSpy('one'),
        play: jasmine.createSpy('play'),
        pause: jasmine.createSpy('pause'),
      };
      spyOn(service, 'playerCreateHandler').and.returnValue(playerMock);
      spyOn(service, 'playerEndHandler').and.returnValue(Promise.resolve());

      service.initializePlayer({} as any);

      expect(playerMock.on).toHaveBeenCalledWith('ended', jasmine.any(Function));

      const endedCallback = playerMock.on.calls.all().find(call => call.args[0] === 'ended')?.args[1];
      expect(endedCallback).toBeDefined();

      if (endedCallback) {
        await endedCallback();
        expect(service.playerEndHandler).toHaveBeenCalled();
      }
    });

    it('should call playerErrorHandler on error event', () => {
      const playerMock = {
        on: jasmine.createSpy('on'),
        error: jasmine.createSpy('error').and.returnValue('PlayerError'),
        ready: jasmine.createSpy('ready'),
        one: jasmine.createSpy('one'),
        play: jasmine.createSpy('play'),
        pause: jasmine.createSpy('pause'),
      };
      spyOn(service, 'playerCreateHandler').and.returnValue(playerMock);
      service.initializePlayer({} as any);
      expect(playerMock.on).toHaveBeenCalledWith('error', jasmine.any(Function));
      const errorCallback = playerMock.on.calls.all().find(call => call.args[0] === 'error')?.args[1];
      expect(errorCallback).toBeDefined();
      if (errorCallback) {
        errorCallback();
      }
    });
  });

  describe('playerCreateHandler', () => {
    it('should return a videojs player instance', () => {
      const videoElement = document.createElement('video');
      const player = service.playerCreateHandler(videoElement);
      expect(player).toBeDefined();
      expect(typeof player.on).toBe('function');
    });
  });

  describe('loadMetaHandler', () => {
    it('should set video duration and seek to start', () => {
      const playerMock = { duration: jasmine.createSpy().and.returnValue(123) };
      const playerStateMock = { player: playerMock, setVideoDuration: jasmine.createSpy() };
      const seekServiceMock = { jumpTime: jasmine.createSpy() };
      (service as any).playerState = playerStateMock;
      (service as any).seekService = seekServiceMock;
      service.loadMetaHandler();
      expect(playerStateMock.setVideoDuration).toHaveBeenCalledWith(123);
      expect(seekServiceMock.jumpTime).toHaveBeenCalledWith(0, true);
    });

    it('should set video duration to 0 if player.duration is falsy', () => {
      service.playerState.player = { duration: jasmine.createSpy('duration').and.returnValue(undefined) } as any;
      spyOn(service.playerState, 'setVideoDuration');
      service.loadMetaHandler();
      expect(service.playerState.setVideoDuration).toHaveBeenCalledWith(0);
    });
  });

  describe('timeUpdateHandler', () => {
    it('should update progress time and save progress', async () => {
      const playerMock = { currentTime: jasmine.createSpy().and.returnValue(50) };
      const playerStateMock = {
        player: playerMock,
        setProgressTime: jasmine.createSpy(),
        videoId: jasmine.createSpy().and.returnValue('vid'),
        lastSaveTime: jasmine.createSpy().and.returnValue(10),
        setLastSaveTime: jasmine.createSpy()
      };
      const apiMock = { CurrentProfile: Profile.empty() };
      const progressServiceMock = { updateProgress: jasmine.createSpy().and.resolveTo(99) };
      (service as any).playerState = playerStateMock;
      (service as any).api = apiMock;
      (service as any).progressService = progressServiceMock;
      await service.timeUpdateHandler();
      expect(playerStateMock.setProgressTime).toHaveBeenCalledWith(50);
      expect(progressServiceMock.updateProgress).toHaveBeenCalledWith('', 'vid', 10);
      expect(playerStateMock.setLastSaveTime).toHaveBeenCalledWith(99);
    });

    it('should call updateProgress with fallback values in timeUpdateHandler', async () => {
      const playerStateMock = {
        player: { currentTime: jasmine.createSpy('currentTime').and.returnValue(10) },
        videoId: jasmine.createSpy().and.returnValue('vid'),
        setIsPlaying: jasmine.createSpy(),
        setLastSaveTime: jasmine.createSpy(),
        resetState: jasmine.createSpy(),
        setProgressTime: jasmine.createSpy(),
        lastSaveTime: jasmine.createSpy().and.returnValue(undefined)
      };
      (service as any).playerState = playerStateMock;
      spyOnProperty(service.api, 'CurrentProfile', 'get').and.returnValue(Profile.empty());
      spyOn(service.playerState, 'player').and.returnValue({ currentTime: jasmine.createSpy('currentTime').and.returnValue(10) });
      const progressServiceMock = { updateProgress: jasmine.createSpy().and.resolveTo(99) };
      service.progressService = progressServiceMock as any;
      await service.timeUpdateHandler();
      expect(service.progressService.updateProgress).toHaveBeenCalledWith('', 'vid', 0);
    });
  });

  describe('playerPauseHandler', () => {
    it('should set end state and save progress', async () => {
      const playerMock = { currentTime: jasmine.createSpy().and.returnValue(50) };
      const playerStateMock = {
        player: playerMock,
        videoId: jasmine.createSpy().and.returnValue('vid'),
        setLastSaveTime: jasmine.createSpy()
      };
      const apiMock = { CurrentProfile: { id: 'user' } };
      const progressServiceMock = { updateProgress: jasmine.createSpy().and.resolveTo(99) };
      (service as any).playerState = playerStateMock;
      (service as any).api = apiMock;
      (service as any).progressService = progressServiceMock;
      (service as any).setEndState = jasmine.createSpy();
      await service.playerPauseHandler();
      expect(service.setEndState).toHaveBeenCalled();
      expect(progressServiceMock.updateProgress).toHaveBeenCalledWith('user', 'vid', 0);
      expect(playerStateMock.setLastSaveTime).toHaveBeenCalledWith(99);
    });

    it('should return early in playerPauseHandler if no videoId or player', async () => {
      spyOn(service.playerState, 'videoId').and.returnValue('');
      service.playerState.player = null;
      await service.playerPauseHandler();
    });

    it('should return early in playerPauseHandler if currentTime is falsy', async () => {
      spyOn(service.playerState, 'videoId').and.returnValue('vid');
      service.playerState.player = { currentTime: jasmine.createSpy('currentTime').and.returnValue(0) } as any;
      await service.playerPauseHandler();
    });
  });

  describe('playerEndHandler', () => {
    it('should set end state and save progress', async () => {
      const playerStateMock = {
        player: { currentTime: jasmine.createSpy('currentTime').and.returnValue(10) },
        videoId: jasmine.createSpy().and.returnValue('vid'),
        setIsPlaying: jasmine.createSpy(),
        setLastSaveTime: jasmine.createSpy(),
        resetState: jasmine.createSpy()
      };
      (service as any).playerState = playerStateMock;
      spyOnProperty(service.api, 'CurrentProfile', 'get').and.returnValue(Profile.empty());
      spyOn(service.playerState, 'player').and.returnValue({ currentTime: jasmine.createSpy('currentTime').and.returnValue(10) });
      const progressServiceMock = { updateProgress: jasmine.createSpy().and.resolveTo(99) };
      (service as any).progressService = progressServiceMock;
      (service as any).setEndState = jasmine.createSpy();
      await service.playerEndHandler();
      expect(service.setEndState).toHaveBeenCalled();
      expect(progressServiceMock.updateProgress).toHaveBeenCalledWith('', 'vid', 0);
      expect(service.setEndState).toHaveBeenCalledWith(99);
    });

    it('should return early in playerEndHandler if no videoId and no player', async () => {
      spyOn(service.playerState, 'videoId').and.returnValue('');
      spyOn(service.playerState, 'player').and.returnValue(null);
      await service.playerEndHandler();
    });

    it('should return early in playerEndHandler if currentTime is falsy', async () => {
      const playerStateMock = {
        player: { currentTime: jasmine.createSpy('currentTime').and.returnValue(0) },
        videoId: jasmine.createSpy().and.returnValue('vid'),
        setIsPlaying: jasmine.createSpy()
      };
      (service as any).playerState = playerStateMock;
      spyOn(service.playerState, 'player').and.returnValue({ currentTime: jasmine.createSpy('currentTime').and.returnValue(0) });
      await service.playerEndHandler();
    });

    it('should call updateProgress with fallback values in playerEndHandler', async () => {
      const playerStateMock = {
        player: { currentTime: jasmine.createSpy('currentTime').and.returnValue(10) },
        videoId: jasmine.createSpy().and.returnValue('vid'),
        setIsPlaying: jasmine.createSpy(),
        setLastSaveTime: jasmine.createSpy(),
        resetState: jasmine.createSpy()
      };
      (service as any).playerState = playerStateMock;
      spyOnProperty(service.api, 'CurrentProfile', 'get').and.returnValue(Profile.empty());
      spyOn(service.playerState, 'player').and.returnValue({ currentTime: jasmine.createSpy('currentTime').and.returnValue(10) });
      spyOn(service.progressService, 'updateProgress').and.returnValue(Promise.resolve(123));
      await service.playerEndHandler();
      expect(service.progressService.updateProgress).toHaveBeenCalledWith('', 'vid', jasmine.any(Number));
    });
  });

  describe('setEndState', () => {
    it('should reset state and session storage if lastSaveTime is provided', () => {
      const playerStateMock = {
        setLastSaveTime: jasmine.createSpy(),
        resetState: jasmine.createSpy()
      };
      const overlayServiceMock = {
        resetOverlayTimer: jasmine.createSpy(),
        clearOverlayTimer: jasmine.createSpy()
      };
      const progressServiceMock = { key: jasmine.createSpy().and.returnValue('key') };
      spyOn(sessionStorage, 'removeItem');
      (service as any).playerState = playerStateMock;
      (service as any).overlayService = overlayServiceMock;
      (service as any).progressService = progressServiceMock;
      service['setEndState'](123);
      expect(playerStateMock.setLastSaveTime).toHaveBeenCalledWith(123);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('key');
      expect(playerStateMock.resetState).toHaveBeenCalled();
    });

    it('should set isPlaying false and reset overlay if no lastSaveTime', () => {
      const playerStateMock = {
        setIsPlaying: jasmine.createSpy()
      };
      const overlayServiceMock = {
        resetOverlayTimer: jasmine.createSpy(),
        clearOverlayTimer: jasmine.createSpy()
      };
      (service as any).playerState = playerStateMock;
      (service as any).overlayService = overlayServiceMock;
      service['setEndState']();
      expect(playerStateMock.setIsPlaying).toHaveBeenCalledWith(false);
      expect(overlayServiceMock.resetOverlayTimer).toHaveBeenCalledWith(true);
      expect(overlayServiceMock.clearOverlayTimer).toHaveBeenCalled();
    });
  });

});

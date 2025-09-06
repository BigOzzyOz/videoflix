import { TestBed } from '@angular/core/testing';

import { PlayerService } from './player.service';

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
        setIsPlaying: jasmine.createSpy()
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
      const apiMock = { CurrentProfile: { id: 'user' } };
      const progressServiceMock = { updateProgress: jasmine.createSpy().and.resolveTo(99) };
      (service as any).playerState = playerStateMock;
      (service as any).api = apiMock;
      (service as any).progressService = progressServiceMock;
      await service.timeUpdateHandler();
      expect(playerStateMock.setProgressTime).toHaveBeenCalledWith(50);
      expect(progressServiceMock.updateProgress).toHaveBeenCalledWith('user', 'vid', 10);
      expect(playerStateMock.setLastSaveTime).toHaveBeenCalledWith(99);
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
  });

  describe('playerEndHandler', () => {
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
      await service.playerEndHandler();
      expect(service.setEndState).toHaveBeenCalled();
      expect(progressServiceMock.updateProgress).toHaveBeenCalledWith('user', 'vid', 0);
      expect(service.setEndState).toHaveBeenCalledWith(99);
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

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
});

import { TestBed } from '@angular/core/testing';

import { VolumeService } from './volume.service';

describe('VolumeService', () => {
  let service: VolumeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VolumeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setVolume', () => {
    let player: any;
    let playerState: any;
    beforeEach(() => {
      player = {
        volume: jasmine.createSpy(),
        muted: jasmine.createSpy().and.returnValue(false)
      };
      playerState = {
        player,
        setVolume: jasmine.createSpy(),
        setIsMuted: jasmine.createSpy()
      };
      (service as any).playerState = playerState;
    });
    it('should clamp and set volume, unmute if volume > 0 and muted', () => {
      player.muted.and.returnValue(true);
      service.setVolume(0.8);
      expect(playerState.setVolume).toHaveBeenCalledWith(0.8);
      expect(player.volume).toHaveBeenCalledWith(0.8);
      expect(player.muted).toHaveBeenCalledWith(false);
      expect(playerState.setIsMuted).toHaveBeenCalledWith(false);
    });
    it('should mute if volume is 0 and not muted', () => {
      player.muted.and.returnValue(false);
      service.setVolume(0);
      expect(player.muted).toHaveBeenCalledWith(true);
      expect(playerState.setIsMuted).toHaveBeenCalledWith(true);
    });
    it('should clamp volume to 1', () => {
      service.setVolume(2);
      expect(playerState.setVolume).toHaveBeenCalledWith(1);
      expect(player.volume).toHaveBeenCalledWith(1);
    });
    it('should clamp volume to 0', () => {
      service.setVolume(-1);
      expect(playerState.setVolume).toHaveBeenCalledWith(0);
      expect(player.volume).toHaveBeenCalledWith(0);
    });
    it('should do nothing if no player', () => {
      (service as any).playerState = { player: null };
      service.setVolume(0.5);
      // No error, no calls
    });
  });

  describe('toggleSound', () => {
    let player: any;
    let playerState: any;
    beforeEach(() => {
      player = {
        muted: jasmine.createSpy().and.returnValue(false),
        volume: jasmine.createSpy(),
        mutedSet: jasmine.createSpy()
      };
      playerState = {
        player,
        setIsMuted: jasmine.createSpy(),
        setVolume: jasmine.createSpy(),
        volume: jasmine.createSpy().and.returnValue(0.5)
      };
      (service as any).playerState = playerState;
    });

    it('should unmute and set volume to 0.5 if muted or volume is 0', () => {
      player.muted.and.returnValue(true);
      playerState.volume.and.returnValue(0);
      service.toggleSound();
      expect(player.muted).toHaveBeenCalledWith(false);
      expect(playerState.setIsMuted).toHaveBeenCalledWith(false);
      expect(playerState.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('should unmute and set volume to 1 if muted or volume is 1', () => {
      playerState.volume.and.returnValue(1);
      player.muted.and.returnValue(true);
      service.toggleSound();
      expect(player.muted).toHaveBeenCalledWith(false);
      expect(playerState.setIsMuted).toHaveBeenCalledWith(false);
      expect(playerState.setVolume).toHaveBeenCalledWith(1);
    });

    it('should mute if not muted and volume > 0', () => {
      player.muted.and.returnValue(false);
      playerState.volume.and.returnValue(0.5);
      service.toggleSound();
      expect(player.muted).toHaveBeenCalledWith(true);
      expect(playerState.setIsMuted).toHaveBeenCalledWith(true);
    });

    it('should do nothing if no player', () => {
      (service as any).playerState = { player: null };
      service.toggleSound();
    });
  });
});

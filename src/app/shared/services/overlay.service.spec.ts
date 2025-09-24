import { TestBed } from '@angular/core/testing';
import { OverlayService } from './overlay.service';
import { PlayerStateService } from './player-state.service';

describe('OverlayService', () => {
  let service: OverlayService;
  let playerState: PlayerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayService);
    playerState = TestBed.inject(PlayerStateService);
  });

  describe('with fake timers', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });
    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should show overlay and auto-hide after delay when playing', () => {
      playerState.setShowOverlay(false);
      service.resetOverlayTimer(true);
      expect(playerState.showOverlay()).toBe(true);
      jasmine.clock().tick(3000);
      expect(playerState.showOverlay()).toBe(false);
    });

    it('should show overlay and not auto-hide when not playing', () => {
      playerState.setShowOverlay(false);
      service.resetOverlayTimer(false);
      expect(playerState.showOverlay()).toBe(true);
      jasmine.clock().tick(3000);
      expect(playerState.showOverlay()).toBe(true);
    });

    it('should clear overlay timer', () => {
      service.resetOverlayTimer(true);
      service.clearOverlayTimer();
      jasmine.clock().tick(3000);
      expect(playerState.showOverlay()).toBe(true);
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get overlay visibility', () => {
    playerState.setShowOverlay(false);
    expect(playerState.showOverlay()).toBe(false);
    playerState.setShowOverlay(true);
    expect(playerState.showOverlay()).toBe(true);
  });

  it('should clear previous overlayTimeoutId in resetOverlayTimer', () => {
    (service as any).overlayTimeoutId = setTimeout(() => { }, 1000);
    spyOn(window, 'clearTimeout');
    service.resetOverlayTimer(false);
    expect(window.clearTimeout).toHaveBeenCalledWith(jasmine.any(Number));
  });
});

import { TestBed } from '@angular/core/testing';
import { OverlayService } from './overlay.service';

describe('OverlayService', () => {
  let service: OverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get overlay visibility', () => {
    service.setShowOverlay(false);
    expect(service.showOverlay()).toBe(false);
    service.setShowOverlay(true);
    expect(service.showOverlay()).toBe(true);
  });

  it('should show overlay and auto-hide after delay when playing', () => {
    service.setShowOverlay(false);
    service.resetOverlayTimer(true);
    expect(service.showOverlay()).toBe(true);
    jasmine.clock().tick(3000);
    expect(service.showOverlay()).toBe(false);
  });

  it('should show overlay and not auto-hide when not playing', () => {
    service.setShowOverlay(false);
    service.resetOverlayTimer(false);
    expect(service.showOverlay()).toBe(true);
    jasmine.clock().tick(3000);
    expect(service.showOverlay()).toBe(true);
  });

  it('should clear overlay timer', () => {
    service.resetOverlayTimer(true);
    service.clearOverlayTimer();
    jasmine.clock().tick(3000);
    expect(service.showOverlay()).toBe(true);
  });
});

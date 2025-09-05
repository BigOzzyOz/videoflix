
import { TestBed } from '@angular/core/testing';
import { FullscreenService } from './fullscreen.service';
import { PlayerStateService } from './player-state.service';

describe('FullscreenService', () => {
  let service: FullscreenService;
  let playerState: PlayerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlayerStateService]
    });
    service = TestBed.inject(FullscreenService);
    playerState = TestBed.inject(PlayerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should enter fullscreen and update player state', () => {
    (document.documentElement as any).requestFullscreen = () => { };
    (document.documentElement as any).webkitRequestFullscreen = () => { };
    (document.documentElement as any).msRequestFullscreen = () => { };
    spyOn((document.documentElement as any), 'requestFullscreen').and.stub();
    spyOn((document.documentElement as any), 'webkitRequestFullscreen').and.stub();
    spyOn((document.documentElement as any), 'msRequestFullscreen').and.stub();
    spyOn(playerState, 'setIsFullscreen');
    service.enterFullscreen();
    expect(playerState.setIsFullscreen).toHaveBeenCalledWith(true);
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    // Clean up
    delete (document.documentElement as any).requestFullscreen;
    delete (document.documentElement as any).webkitRequestFullscreen;
    delete (document.documentElement as any).msRequestFullscreen;
  });

  it('should exit fullscreen and update player state', () => {
    (document as any).exitFullscreen = () => { };
    (document as any).webkitExitFullscreen = () => { };
    (document as any).msExitFullscreen = () => { };
    spyOn((document as any), 'exitFullscreen').and.stub();
    spyOn((document as any), 'webkitExitFullscreen').and.stub();
    spyOn((document as any), 'msExitFullscreen').and.stub();
    spyOn(playerState, 'setIsFullscreen');
    service.exitFullscreen();
    expect(playerState.setIsFullscreen).toHaveBeenCalledWith(false);
    expect(document.exitFullscreen).toHaveBeenCalled();
    // Clean up
    delete (document as any).exitFullscreen;
    delete (document as any).webkitExitFullscreen;
    delete (document as any).msExitFullscreen;
  });

  it('should toggle fullscreen: enter if not fullscreen', () => {
    spyOn(playerState, 'isFullscreen').and.returnValue(false);
    spyOn(service, 'enterFullscreen');
    service.toggleFullscreen();
    expect(service.enterFullscreen).toHaveBeenCalled();
  });

  it('should toggle fullscreen: exit if fullscreen', () => {
    spyOn(playerState, 'isFullscreen').and.returnValue(true);
    spyOn(service, 'exitFullscreen');
    service.toggleFullscreen();
    expect(service.exitFullscreen).toHaveBeenCalled();
  });

  it('should use webkitRequestFullscreen if available', () => {
    const element: any = document.documentElement;
    element.requestFullscreen = undefined;
    element.webkitRequestFullscreen = () => { };
    element.msRequestFullscreen = undefined;
    spyOn((element as any), 'webkitRequestFullscreen').and.stub();
    spyOn(playerState, 'setIsFullscreen');
    service.enterFullscreen();
    expect(playerState.setIsFullscreen).toHaveBeenCalledWith(true);
    expect(element.webkitRequestFullscreen).toHaveBeenCalled();
    delete element.webkitRequestFullscreen;
  });

  it('should use msRequestFullscreen if available', () => {
    const element: any = document.documentElement;
    element.requestFullscreen = undefined;
    element.webkitRequestFullscreen = undefined;
    element.msRequestFullscreen = () => { };
    spyOn((element as any), 'msRequestFullscreen').and.stub();
    spyOn(playerState, 'setIsFullscreen');
    service.enterFullscreen();
    expect(playerState.setIsFullscreen).toHaveBeenCalledWith(true);
    expect(element.msRequestFullscreen).toHaveBeenCalled();
    delete element.msRequestFullscreen;
  });

  it('should use webkitExitFullscreen if available', () => {
    (document as any).exitFullscreen = undefined;
    (document as any).webkitExitFullscreen = () => { };
    (document as any).msExitFullscreen = undefined;
    spyOn((document as any), 'webkitExitFullscreen').and.stub();
    spyOn(playerState, 'setIsFullscreen');
    service.exitFullscreen();
    expect(playerState.setIsFullscreen).toHaveBeenCalledWith(false);
    expect((document as any).webkitExitFullscreen).toHaveBeenCalled();
    delete (document as any).webkitExitFullscreen;
  });

  it('should use msExitFullscreen if available', () => {
    const doc: any = document;
    doc.exitFullscreen = undefined;
    doc.webkitExitFullscreen = undefined;
    doc.msExitFullscreen = () => { };
    spyOn((doc as any), 'msExitFullscreen').and.stub();
    spyOn(playerState, 'setIsFullscreen');
    service.exitFullscreen();
    expect(playerState.setIsFullscreen).toHaveBeenCalledWith(false);
    expect(doc.msExitFullscreen).toHaveBeenCalled();
    delete doc.msExitFullscreen;
  });
});

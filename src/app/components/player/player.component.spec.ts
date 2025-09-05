import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PlayerComponent } from './player.component';

describe('PlayerComponent', () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: of({}) } }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call overlayService.resetOverlayTimer on mouse move', () => {
    const spy = spyOn(component.overlayService, 'resetOverlayTimer');
    spyOn(component.playerState, 'isPlaying').and.returnValue(true);
    component.onMouseMove();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should call overlayService.resetOverlayTimer on touch', () => {
    const spy = spyOn(component.overlayService, 'resetOverlayTimer');
    spyOn(component.playerState, 'isPlaying').and.returnValue(false);
    component.onTouch();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should handle keydown events for play, seek, mute, fullscreen', () => {
    const playSpy = spyOn(component.playerService, 'togglePlay');
    const seekSpy = spyOn(component.seekService, 'handleKeyboardSeek');
    const muteSpy = spyOn(component.volumeService, 'toggleSound');
    const fsSpy = spyOn(component.fullScreenService, 'toggleFullscreen');
    spyOn(component.overlayService, 'resetOverlayTimer');
    spyOn(component.playerState, 'isPlaying').and.returnValue(true);
    component.onKeyDown({ code: 'Space', preventDefault: () => { } } as any);
    expect(playSpy).toHaveBeenCalled();
    component.onKeyDown({ code: 'ArrowLeft', preventDefault: () => { } } as any);
    expect(seekSpy).toHaveBeenCalledWith('left', 10);
    component.onKeyDown({ code: 'ArrowRight', preventDefault: () => { } } as any);
    expect(seekSpy).toHaveBeenCalledWith('right', 10);
    component.onKeyDown({ code: 'KeyM', preventDefault: () => { } } as any);
    expect(muteSpy).toHaveBeenCalled();
    component.onKeyDown({ code: 'KeyF', preventDefault: () => { } } as any);
    expect(fsSpy).toHaveBeenCalled();
  });

  it('should hide controls on document click outside', () => {
    const setVolumeSpy = spyOn(component.playerState, 'setShowVolumeControl');
    const setSpeedSpy = spyOn(component.playerState, 'setShowSpeedMenu');
    component.onDocumentClick({ target: document.body } as any);
    expect(setVolumeSpy).toHaveBeenCalledWith(false);
    expect(setSpeedSpy).toHaveBeenCalledWith(false);
  });

  it('should add and remove session storage', () => {
    spyOn(sessionStorage, 'setItem');
    spyOn(sessionStorage, 'removeItem');
    spyOn(component.playerState, 'videoId').and.returnValue('vid');
    spyOn(component.playerState, 'video').and.returnValue({
      id: 'vid',
      title: 'Test',
      description: '',
      genres: [],
      language: '',
      availableLanguages: [],
      duration: 0,
      thumbnail: '',
      preview: '',
      hls: '',
      ready: true,
      created: new Date(),
      updated: new Date(),
      formattedDuration: '00:00',
      durationMs: 0,
      toApiFormat: () => ({
        id: 'vid',
        title: 'Test',
        description: '',
        genres: [],
        language: '',
        available_languages: [],
        duration: 0,
        thumbnail_url: '',
        preview_url: '',
        hls_url: '',
        is_ready: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
    component.manageSessionStorage(true);
    expect(sessionStorage.setItem).toHaveBeenCalled();
    component.manageSessionStorage(false);
    expect(sessionStorage.removeItem).toHaveBeenCalled();
  });

  it('showOverlay getter should call overlayService.showOverlay', () => {
    const showOverlaySpy = spyOn(component.overlayService, 'showOverlay');
    showOverlaySpy.and.returnValue(true);
    expect(component.showOverlay).toBeTrue();
    showOverlaySpy.and.returnValue(false);
    expect(component.showOverlay).toBeFalse();
  });

  it('isPlaying getter should call playerState.isPlaying', () => {
    const isPlayingSpy = spyOn(component.playerState, 'isPlaying');
    isPlayingSpy.and.returnValue(true);
    expect(component.isPlaying).toBeTrue();
    isPlayingSpy.and.returnValue(false);
    expect(component.isPlaying).toBeFalse();
  });
});

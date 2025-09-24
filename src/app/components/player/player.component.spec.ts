import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PlayerComponent } from './player.component';
import { LoadingService } from '../../shared/services/loading.service';
import { PlayerStateService } from '../../shared/services/player-state.service';
import { ApiService } from '../../shared/services/api.service';
import { Video } from '../../shared/models/video';
import { ApiResponse } from '../../shared/models/api-response';


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
    const showOverlaySpy = spyOn(component.playerState, 'showOverlay');
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
  })
});

describe('PlayerComponentSessionStorage', () => {
  let component: PlayerComponent;
  let fixture: ComponentFixture<PlayerComponent>;
  let loadingServiceMock: any;
  let playerStateMock: any;
  let queryParamsSubject: Subject<any>;

  beforeEach(async () => {
    loadingServiceMock = { setLoading: jasmine.createSpy() };
    playerStateMock = {
      setVideoId: jasmine.createSpy(),
      videoId: jasmine.createSpy().and.returnValue('vid123'),
      setVideo: jasmine.createSpy(),
      setVideoUrl: jasmine.createSpy(),
      video: jasmine.createSpy().and.returnValue(null),
      videoUrl: jasmine.createSpy().and.returnValue(null),
      viewInitialized: jasmine.createSpy().and.returnValue(true),
      isOptimizing: jasmine.createSpy().and.returnValue(false),
      title: jasmine.createSpy().and.returnValue('Test Title'),
      isPlaying: jasmine.createSpy().and.returnValue(false),
      setViewInitialized: jasmine.createSpy(),
      setShowVolumeControl: jasmine.createSpy(),
      setShowSpeedMenu: jasmine.createSpy(),
      isMuted: jasmine.createSpy().and.returnValue(false),
      volume: jasmine.createSpy().and.returnValue(1),
      showVolumeControl: jasmine.createSpy().and.returnValue(false),
      showSpeedMenu: jasmine.createSpy().and.returnValue(false),
      showVolumeTooltip: jasmine.createSpy().and.returnValue(false),
      playbackSpeed: jasmine.createSpy().and.returnValue(1),
      isFullscreen: jasmine.createSpy().and.returnValue(false),
      progressTime: jasmine.createSpy().and.returnValue('00:00'),
      durationTime: jasmine.createSpy().and.returnValue('00:00'),
      formattedDuration: jasmine.createSpy().and.returnValue('00:00'),
      currentTime: jasmine.createSpy().and.returnValue(0),
      videoDuration: jasmine.createSpy().and.returnValue(0),
      bufferedPercentage: jasmine.createSpy().and.returnValue(0),
      progress: jasmine.createSpy().and.returnValue(0),
      isScrubbing: jasmine.createSpy().and.returnValue(false),
      setIsScrubbing: jasmine.createSpy(),
      setCurrentTime: jasmine.createSpy(),
      showSeekTooltip: jasmine.createSpy().and.returnValue(false),
      seekTooltipTime: jasmine.createSpy().and.returnValue('00:00'),
      seekTooltipPosition: jasmine.createSpy().and.returnValue(0),
      resetState: jasmine.createSpy(),
      showOverlay: jasmine.createSpy().and.returnValue(false),
      showQualityMenu: jasmine.createSpy().and.returnValue(false),
    };
    const videoMock = {
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
    };
    queryParamsSubject = new Subject<any>();

    await TestBed.configureTestingModule({
      imports: [PlayerComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}), queryParams: queryParamsSubject.asObservable() } },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: PlayerStateService, useValue: playerStateMock },
        { provide: ApiService, useValue: { getVideoById: jasmine.createSpy().and.returnValue(Promise.resolve({ isSuccess: () => true, data: { id: 'vid123', hls: 'http://test/hls.m3u8' } })) } },
        { provide: PlayerStateService, useValue: playerStateMock },
      ]
    }).compileComponents();

    spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(videoMock));

    fixture = TestBed.createComponent(PlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    queryParamsSubject.next({ videoId: 'vid123' });
  });

  it('should call setLoading and setVideoId from queryParams in constructor', () => {
    expect(loadingServiceMock.setLoading).toHaveBeenCalledWith(true);
    expect(playerStateMock.setVideoId).toHaveBeenCalledWith('vid123');
  });

  it('should fetch video, set state, and initialize player if not in sessionStorage', async () => {
    (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
    playerStateMock.videoId.and.returnValue('vid123');
    playerStateMock.videoUrl.and.returnValue(null);

    const apiResponseMock = {
      ok: true,
      status: 200,
      data: { id: 'vid123', hls: 'http://test/hls.m3u8' },
      message: '',
      isSuccess: () => true,
      isClientError: () => false,
      isServerError: () => false
    };
    (component.api.getVideoById as jasmine.Spy).and.returnValue(Promise.resolve(apiResponseMock));
    spyOn(component, 'manageSessionStorage');
    playerStateMock.viewInitialized.and.returnValue(true);
    spyOn(component.playerService, 'initializePlayer');
    component.vjsRef = { nativeElement: {} } as any;

    playerStateMock.setVideo.and.callFake(() => {
      playerStateMock.video.and.returnValue({ id: 'vid123', hls: 'http://test/hls.m3u8' });
    });

    await component.ngOnInit();

    expect(component.api.getVideoById).toHaveBeenCalledWith('vid123');
    expect(playerStateMock.setVideo).toHaveBeenCalledWith(jasmine.any(Video));
    expect(playerStateMock.setVideoUrl).toHaveBeenCalledWith('http://test/hls.m3u8');
    expect(component.manageSessionStorage).toHaveBeenCalledWith(true);
    expect(component.playerService.initializePlayer).toHaveBeenCalledWith(component.vjsRef.nativeElement);
  });

  it('should show error if video fetch fails', async () => {
    (sessionStorage.getItem as jasmine.Spy).and.returnValue(null);
    playerStateMock.videoId.and.returnValue('vid123');
    playerStateMock.videoUrl.and.returnValue(null);

    const apiResponseMock = new ApiResponse(false, 400, 'error');
    (component.api.getVideoById as jasmine.Spy).and.returnValue(Promise.resolve(apiResponseMock));
    spyOn(component.errorService, 'show');
    await component.ngOnInit();
    expect(component.errorService.show).toHaveBeenCalledWith('Video not found or could not be loaded.');
  });

  it('should initialize player in ngAfterViewInit if videoUrl exists', () => {
    playerStateMock.videoUrl.and.returnValue('http://test/hls.m3u8');
    spyOn(component.playerService, 'initializePlayer');
    component.vjsRef = { nativeElement: {} } as any;

    component.ngAfterViewInit();

    expect(component.playerService.initializePlayer).toHaveBeenCalledWith(component.vjsRef.nativeElement);
  });

  it('should cleanup player state and dispose player in ngOnDestroy if player exists', async () => {
    const disposeSpy = jasmine.createSpy();
    playerStateMock.player = { dispose: disposeSpy };
    spyOn(component.playerService, 'playerEndHandler').and.returnValue(Promise.resolve());
    spyOn(component, 'manageSessionStorage');
    spyOn(component.overlayService, 'clearOverlayTimer');

    await component.ngOnDestroy();

    expect(component.playerService.playerEndHandler).toHaveBeenCalled();
    expect(playerStateMock.resetState).toHaveBeenCalled();
    expect(component.manageSessionStorage).toHaveBeenCalledWith(false);
    expect(disposeSpy).toHaveBeenCalled();
    expect(component.overlayService.clearOverlayTimer).toHaveBeenCalled();
  });
});
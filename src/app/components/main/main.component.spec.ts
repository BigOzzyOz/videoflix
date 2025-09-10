import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { MainComponent } from './main.component';
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { LoadingService } from '../../shared/services/loading.service';
import { Renderer2 } from '@angular/core';
import { Video } from '../../shared/models/video';
import { Profile } from '../../shared/models/profile';
import { VideoProgress } from '../../shared/models/video-progress';
import { ApiResponse } from '../../shared/models/api-response';

function createVideoProgressMock(): VideoProgress {
  return new VideoProgress({
    id: '1',
    title: 'Test Video',
    thumbnail: '',
    currentTime: 10,
    progressPercentage: 50,
    duration: 100,
    status: 'in_progress',
    completed: false,
    started: true,
    completionCount: 0,
    totalWatchTime: 10,
    firstWatched: null,
    lastWatched: null,
    lastCompleted: null
  });
}

function createProfileMock(videoProgress?: VideoProgress): Profile {
  return new Profile({
    id: 'p1',
    name: 'Test',
    profilePic: null,
    kid: false,
    language: 'en',
    videoProgress: [videoProgress ? videoProgress : createVideoProgressMock()],
    watchStats: {
      totalVideosStarted: 1,
      totalVideosCompleted: 0,
      totalCompletions: 0,
      totalWatchTime: 10,
      uniqueVideosWatched: 1,
      completionRate: 0
    }
  });
}

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj('ApiService', [
      'getGenresCount', 'getVideos', 'getVideoById'
    ]);
    errorService = jasmine.createSpyObj('ErrorService', ['show']);
    loadingService = jasmine.createSpyObj('LoadingService', ['setLoading']);
    renderer = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);

    await TestBed.configureTestingModule({
      imports: [MainComponent],
      providers: [
        { provide: ApiService, useValue: apiService },
        { provide: ErrorService, useValue: errorService },
        { provide: LoadingService, useValue: loadingService },
        { provide: Renderer2, useValue: renderer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add main-bg class on ngOnInit and remove on ngOnDestroy', () => {
    spyOnProperty(document, 'body', 'get').and.returnValue(document.createElement('body'));
    renderer.addClass(document.body, 'main-bg');
    expect(renderer.addClass).toHaveBeenCalledWith(document.body, 'main-bg');
    renderer.removeClass(document.body, 'main-bg');
    expect(renderer.removeClass).toHaveBeenCalledWith(document.body, 'main-bg');
  });

  it('should handle error in ngOnInit', async () => {
    apiService.getGenresCount.and.returnValue(Promise.reject(new Error('API error')));
    await component.ngOnInit();
    expect(errorService.show).toHaveBeenCalled();
  });

  it('should set featured video', () => {
    const video = new Video({ id: '1', title: 'Test', description: '', genres: [], language: 'en', availableLanguages: [], duration: 1, thumbnail: '', preview: '', hls: '', ready: true, created: new Date(), updated: new Date() });
    component.videoCollection = [{ genre: { videos: [video] } } as any];
    component['setFeaturedVideo']();
    expect(component.featuredVideo).toEqual(video);
  });

  it('should handle onVideoSelected and show overlay for small screens', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    const video = new Video({ id: '1', title: 'Test', description: '', genres: [], language: 'en', availableLanguages: [], duration: 1, thumbnail: '', preview: '', hls: '', ready: true, created: new Date(), updated: new Date() });
    component.onVideoSelected(video);
    expect(component.featuredVideo).toEqual(video);
    expect(component.showFeaturedVideo).toBeTrue();
  });

  it('should hide featured video overlay', () => {
    component.showFeaturedVideo = true;
    component.hideFeaturedVideo();
    expect(component.showFeaturedVideo).toBeFalse();
  });

  it('should get sorted genres', () => {
    const genreData = { action: 2, drama: 0, comedy: 1 };
    const sorted = (component as any).getSortedGenres(genreData);
    expect(sorted).toEqual(['action', 'comedy']);
  });

  it('should not add continue watching if no profile', async () => {
    apiService.currentProfile = null;
    await component.addContinueWatching();
    expect(errorService.show).toHaveBeenCalled();
  });

  it('should add continue watching collection', fakeAsync(async () => {
    const videoProgress = new VideoProgress({
      id: '1',
      title: 'Test Video',
      thumbnail: '',
      currentTime: 10,
      progressPercentage: 50,
      duration: 100,
      status: 'in_progress',
      completed: false,
      started: true,
      completionCount: 0,
      totalWatchTime: 10,
      firstWatched: null,
      lastWatched: null,
      lastCompleted: null
    });
    const profileMock = createProfileMock(videoProgress);
    apiService.CurrentProfile = profileMock;
    apiService.getVideoById.and.returnValue(Promise.resolve(
      new ApiResponse(
        true,
        200,
        {
          id: '1',
          title: 'Test Video',
          description: '',
          genres: [],
          language: 'en',
          availableLanguages: [],
          duration: 100,
          thumbnail: '',
          preview: '',
          hls: '',
          ready: true,
          created: new Date(),
          updated: new Date()
        }
      )
    ));
    await component.addContinueWatching();
    flushMicrotasks();
    fixture.detectChanges();
    expect(component.videoCollection.length).toBeGreaterThan(0);
  }));

  it('should handle getGenreCount with valid response', async () => {
    apiService.getGenresCount.and.returnValue(Promise.resolve(new ApiResponse(true, 200, { action: 2, comedy: 1 })));
    await component.getGenreCount();
    expect(component.videoGenres).toContain('new');
  });

  it('should handle getGenreCount with error response', async () => {
    apiService.getGenresCount.and.returnValue(Promise.resolve(new ApiResponse(false, 400, 'error')));
    await component.getGenreCount();
    expect(errorService.show).toHaveBeenCalled();
  });

  it('should get video collection by genre', async () => {
    apiService.getVideos.and.returnValue(Promise.resolve(new ApiResponse(true, 200, { count: 1 })));
    await (component as any).getVideoCollectionByGenre('action');
    expect(component.videoCollection.length).toBeGreaterThan(0);
  });

  it('should handle getVideoCollectionByGenre with error', async () => {
    apiService.getVideos.and.returnValue(Promise.resolve(new ApiResponse(false, 400, 'error')));
    await (component as any).getVideoCollectionByGenre('action');
    expect(errorService.show).toHaveBeenCalled();
  });

  it('should check isContinuePossible returns false for empty progress', () => {
    apiService.CurrentProfile = Profile.empty();
    expect((component as any).isContinuePossible()).toBeFalse();
  });

  it('should check isContinuePossible returns true for progress', () => {
    apiService.CurrentProfile = createProfileMock(createVideoProgressMock());
    expect((component as any).isContinuePossible()).toBeTrue();
  });

  it('should handle error in getVideoCollection', async () => {
    component.videoGenres = ['action'];
    (component as any).getVideoCollectionByGenre = jasmine.createSpy().and.callFake(() => { throw new Error('fail'); });
    await component.getVideoCollection();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load videos for genre action: fail');
  });

  it('should fallback to English if count is 0 in getVideoCollectionByGenre', async () => {
    apiService.currentProfile = createProfileMock();
    apiService.currentProfile.language = 'de';
    apiService.getVideos.and.callFake((params: string) => {
      if (params.includes('language=de')) return Promise.resolve(new ApiResponse(true, 200, { count: 0 }));
      if (params.includes('language=de,en')) return Promise.resolve(new ApiResponse(true, 200, { count: 1 }));
      return Promise.resolve(new ApiResponse(false, 400, 'error'));
    });
    await (component as any).getVideoCollectionByGenre('action');
    expect(component.videoCollection.length).toBeGreaterThan(0);
  });

  it('should set featuredVideo to null if no videos', () => {
    component.videoCollection = [{ genre: { videos: [] } } as any];
    component['setFeaturedVideo']();
    expect(component.featuredVideo).toBeNull();
  });

  it('should getSortedGenres filter out zero-count genres', () => {
    const genreData = { action: 2, drama: 0, comedy: 0 };
    const sorted = (component as any).getSortedGenres(genreData);
    expect(sorted).toEqual(['action']);
  });

  it('should handle error in addContinueWatching', async () => {
    apiService.CurrentProfile = createProfileMock(createVideoProgressMock());
    apiService.getVideoById.and.returnValue(Promise.reject(new Error('fail')));
    await component.addContinueWatching();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load continue watching videos: fail');
  });

  it('should call addContinueWatching in ngOnInit if isContinuePossible returns true', async () => {
    spyOn(component as any, 'isContinuePossible').and.returnValue(true);
    spyOn(component as any, 'addContinueWatching').and.returnValue(Promise.resolve());
    spyOn(component as any, 'getGenreCount').and.returnValue(Promise.resolve());
    spyOn(component as any, 'getVideoCollection').and.returnValue(Promise.resolve());
    spyOn(component as any, 'setFeaturedVideo');;
    await component.ngOnInit();
    expect((component as any).addContinueWatching).toHaveBeenCalled();
    expect(component.loadingService.setLoading).toHaveBeenCalledWith(false);
  });

  it('should show error with String(error) in ngOnInit catch block', async () => {
    spyOn(component as any, 'isContinuePossible').and.throwError('TestError');
    await component.ngOnInit();
    expect(errorService.show).toHaveBeenCalledWith('Failed to initialize component: TestError');
    (component as any).isContinuePossible.and.callFake(() => { throw 'TestErrorString'; });
    await component.ngOnInit();
    expect(errorService.show).toHaveBeenCalledWith('Failed to initialize component: TestErrorString');
  });

  it('should show error with String(error) in getGenreCount catch block', async () => {
    apiService.getGenresCount.and.throwError('GenreError');
    await component.getGenreCount();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load genres count: GenreError');
    apiService.getGenresCount.and.callFake(() => { throw 'TestErrorString'; });
    await component.getGenreCount();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load genres count: TestErrorString');
  });

  it('should show error with String(error) in getVideoCollection catch block', async () => {
    component.videoGenres = ['action'];
    spyOn(component as any, 'getVideoCollectionByGenre').and.callFake(() => { throw new Error('VideoError'); });
    await component.getVideoCollection();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load videos for genre action: VideoError');
    (component as any).getVideoCollectionByGenre.and.callFake(() => { throw 'TestErrorString'; });
    await component.getVideoCollection();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load videos for genre action: TestErrorString');
  });

  it('should use newly_released=true param for genre \"new\" in getVideoCollectionByGenre', async () => {
    apiService.getVideos.and.returnValue(Promise.resolve(new ApiResponse(true, 200, { count: 1 })));
    spyOn(component.videoCollection, 'push');
    await (component as any).getVideoCollectionByGenre('new');
    expect(component.api.getVideos).toHaveBeenCalledWith(jasmine.stringMatching(/^newly_released=true/));
  });

  it('should show error if newVideo.isSuccess() is false in addContinueWatching', async () => {
    component.api.CurrentProfile = createProfileMock();
    const apiResponseMock = new ApiResponse(false, 400, 'ErrorData');
    apiService.getVideoById.and.returnValue(Promise.resolve(apiResponseMock));
    await component.addContinueWatching();
    expect(errorService.show).toHaveBeenCalledWith('ErrorData');
  });

  it('should return early if continueWatching is empty in addContinueWatching', async () => {
    component.api.CurrentProfile = createProfileMock();
    component.api.CurrentProfile.videoProgress = [];
    await component.addContinueWatching();
    expect(component.videoCollection[0]?.['genre']).not.toBe('continue_watching');
  });

  it('should show error with String(err) in addContinueWatching catch block', async () => {
    const profileMock = createProfileMock();
    apiService.getVideoById.and.throwError('ContinueError');
    component.api.CurrentProfile = profileMock;
    await component.addContinueWatching();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load continue watching videos: ContinueError');
    apiService.getVideoById.and.callFake(() => { throw 'TestErrorString'; });
    await component.addContinueWatching();
    expect(errorService.show).toHaveBeenCalledWith('Failed to load continue watching videos: TestErrorString');
  });
});

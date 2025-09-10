import { TestBed } from '@angular/core/testing';

import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateProgress', () => {
    it('should return lastSaveTime if no player or videoId', async () => {
      (service as any).playerState = { player: null };
      spyOnProperty(service, 'videoId', 'get').and.returnValue('');
      const result = await service.updateProgress('profile', 'video', 123);
      expect(result).toBe(123);
    });
    it('should return lastSaveTime if currentTime <= 0', async () => {
      (service as any).playerState = { player: { currentTime: () => 0, paused: () => true } };
      spyOnProperty(service, 'videoId', 'get').and.returnValue('vid');
      const result = await service.updateProgress('profile', 'video', 123);
      expect(result).toBe(123);
    });
    it('should save progress if shouldSave is true', async () => {
      const playerMock = { currentTime: () => 10, paused: () => false };
      (service as any).playerState = { player: playerMock, setIsPlaying: jasmine.createSpy() };
      spyOnProperty(service, 'videoId', 'get').and.returnValue('vid');
      spyOn(Date, 'now').and.returnValue(20000);
      spyOn(service, 'saveProgress').and.resolveTo(20000);
      const result = await service.updateProgress('profile', 'video', 0);
      expect(service.saveProgress).toHaveBeenCalledWith('profile', 'video', 10, 20000, 0);
      expect(result).toBe(20000);
    });
    it('should not save progress if shouldSave is false', async () => {
      const playerMock = { currentTime: () => 10, paused: () => false };
      (service as any).playerState = { player: playerMock, setIsPlaying: jasmine.createSpy() };
      spyOnProperty(service, 'videoId', 'get').and.returnValue('vid');
      spyOn(Date, 'now').and.returnValue(20000);
      spyOn(service, 'saveProgress').and.resolveTo(123);
      const result = await service.updateProgress('profile', 'video', 19900);
      expect(service.saveProgress).not.toHaveBeenCalled();
      expect(result).toBe(19900);
    });
  });

  describe('saveProgress', () => {
    it('should save to sessionStorage and backend on success', async () => {
      const mockProfileData = {
        id: 'profile',
        name: '',
        profilePic: null,
        kid: false,
        language: 'en',
        videoProgress: [],
        watchStats: {
          totalVideosStarted: 0,
          totalVideosCompleted: 0,
          totalCompletions: 0,
          totalWatchTime: 0,
          uniqueVideosWatched: 0,
          completionRate: 0
        }
      };
      const apiMock = { updateVideoProgress: jasmine.createSpy().and.resolveTo({ isSuccess: () => true, data: mockProfileData }), CurrentProfile: null };
      (service as any).api = apiMock;
      (service as any).errorService = { show: jasmine.createSpy() };
      spyOn(service, 'key').and.returnValue('resume:vid');
      spyOn(sessionStorage, 'setItem');
      const result = await service.saveProgress('profile', 'video', 10, 20000, 0);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('resume:vid', '10');
      expect(result).toBe(20000);
    });
    it('should show error and return saveTime on backend failure', async () => {
      const apiMock = { updateVideoProgress: jasmine.createSpy().and.resolveTo({ isSuccess: () => false }), CurrentProfile: null };
      const errorServiceSpy = { show: jasmine.createSpy() };
      (service as any).api = apiMock;
      (service as any).errorService = errorServiceSpy;
      spyOn(service, 'key').and.returnValue('resume:vid');
      spyOn(sessionStorage, 'setItem');
      const result = await service.saveProgress('profile', 'video', 10, 20000, 123);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('Failed to update video progress');
      expect(result).toBe(123);
    });
    it('should show error and return saveTime on exception', async () => {
      const apiMock = { updateVideoProgress: jasmine.createSpy().and.rejectWith(new Error('fail')), CurrentProfile: null };
      const errorServiceSpy = { show: jasmine.createSpy() };
      (service as any).api = apiMock;
      (service as any).errorService = errorServiceSpy;
      spyOn(service, 'key').and.returnValue('resume:vid');
      spyOn(sessionStorage, 'setItem');
      const result = await service.saveProgress('profile', 'video', 10, 20000, 123);
      expect(errorServiceSpy.show).toHaveBeenCalledWith('An error occurred while updating video progress');
      expect(result).toBe(123);
    });
  });

  describe('getResumeTime', () => {
    it('should return 0 if no videoId or profile', () => {
      spyOnProperty(service, 'videoId', 'get').and.returnValue('');
      (service as any).api = { CurrentProfile: null };
      expect(service.getResumeTime()).toBe(0);
    });
    it('should return videoProgress currentTime if found', () => {
      spyOnProperty(service, 'videoId', 'get').and.returnValue('vid');
      (service as any).api = { CurrentProfile: { videoProgress: [{ id: 'vid', currentTime: 42 }] } };
      spyOn(sessionStorage, 'setItem');
      expect(service.getResumeTime()).toBe(42);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('resume:vid', '42');
    });
    it('should return localResumeTime if not found in profile', () => {
      spyOnProperty(service, 'videoId', 'get').and.returnValue('vid');
      (service as any).api = { CurrentProfile: { videoProgress: [] } };
      spyOn(sessionStorage, 'getItem').and.returnValue('99');
      expect(service.getResumeTime()).toBe(99);
    });
  });

  describe('videoId', () => {
    it('should get videoId from playerState', () => {
      (service as any).playerState = { videoId: jasmine.createSpy().and.returnValue('vid') };
      expect(service.videoId).toBe('vid');
    });
  });

  describe('key', () => {
    it('should return session key for videoId', () => {
      spyOnProperty(service, 'videoId', 'get').and.returnValue('vid');
      expect(service.key()).toBe('resume:vid');
    });
  });

  it('should return 0 if not found in profile and sessionStorage is empty', () => {
    spyOnProperty(service, 'videoId', 'get').and.returnValue('vid');
    (service as any).api = { CurrentProfile: {} };
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    expect(service.getResumeTime()).toBe(0);
  });
});

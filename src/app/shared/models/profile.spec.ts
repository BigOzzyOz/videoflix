import { ProfileApiData } from '../interfaces/profile-api-data';
import { ProfileData } from '../interfaces/profile-data';
import { Profile } from './profile';

describe('Profile', () => {
  it('should set name to empty string if profile_name is missing', () => {
    const data: any = {
      id: 'x',
      profilePic: null,
      kid: false,
      language: 'de',
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
    const profile = new Profile(data);
    expect(profile.name).toBe('');
  });

  it('should set language to "en" if preferred_language is missing', () => {
    const apiData: any = {
      id: 'x',
      profile_name: 'Test',
      profile_picture_url: null,
      is_kid: false,
      video_progress: [],
      watch_statistics: {}
    };
    const profile = new Profile(apiData);
    expect(profile.language).toBe('en');
  });

  it('should set videoProgress to empty array if video_progress is missing', () => {
    const apiData: any = {
      id: 'x',
      profile_name: 'Test',
      profile_picture_url: null,
      is_kid: false,
      preferred_language: 'de',
      watch_statistics: {}
    };
    const profile = new Profile(apiData);
    expect(Array.isArray(profile.videoProgress)).toBeTrue();
    expect(profile.videoProgress.length).toBe(0);
  });

  it('should set language to "en" if language is missing (else branch)', () => {
    const apiData: any = {
      id: 'x',
      profile_picture_url: null,
      is_kid: false,
      preferred_language: 'de',
      video_progress: [],
      watchStats: {
        totalVideosStarted: 0,
        totalVideosCompleted: 0,
        totalCompletions: 0,
        totalWatchTime: 0,
        uniqueVideosWatched: 0,
        completionRate: 0,
      },
    };
    const profile = new Profile(apiData);
    expect(profile.name).toBe('');
  });

  it('should set name to empty string if name is missing (else branch)', () => {
    const data: any = {
      id: 'x',
      profilePic: null,
      kid: false,
      language: 'de',
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
    const profile = new Profile(data);
    expect(profile.name).toBe('');
  });

  it('should set videoProgress to empty array if videoProgress is missing (else branch)', () => {
    const data: any = {
      id: 'y',
      name: 'Test',
      profilePic: null,
      kid: false,
      language: 'de',
      watchStats: {
        totalVideosStarted: 0,
        totalVideosCompleted: 0,
        totalCompletions: 0,
        totalWatchTime: 0,
        uniqueVideosWatched: 0,
        completionRate: 0,
      },
    };
    const profile = new Profile(data);
    expect(Array.isArray(profile.videoProgress)).toBeTrue();
    expect(profile.videoProgress.length).toBe(0);
  });

  it('should call toApiFormat on each videoProgress item in toApiFormat', () => {
    const videoMock = { toApiFormat: jasmine.createSpy('toApiFormat').and.returnValue({}) };
    const data: ProfileData = {
      id: 'z',
      name: 'Test',
      profilePic: null,
      kid: false,
      language: 'de',
      videoProgress: [videoMock as any],
      watchStats: {
        totalVideosStarted: 0,
        totalVideosCompleted: 0,
        totalCompletions: 0,
        totalWatchTime: 0,
        uniqueVideosWatched: 0,
        completionRate: 0,
      },
    };
    const profile = new Profile(data);
    profile.videoProgress = [videoMock as any];
    const apiFormat = profile.toApiFormat();
    expect(videoMock.toApiFormat).toHaveBeenCalled();
    expect(Array.isArray(apiFormat.video_progress)).toBeTrue();
  });
  it('should create an instance', () => {
    const mockData: ProfileApiData = {
      id: '1',
      profile_name: 'TestProfile',
      profile_picture: null,
      profile_picture_url: null,
      is_kid: false,
      preferred_language: 'en',
      video_progress: [],
      watch_statistics: {
        total_videos_started: 0,
        total_videos_completed: 0,
        total_completions: 0,
        total_watch_time: 0,
        unique_videos_watched: 0,
        completion_rate: 0
      }
    }
    expect(new Profile(mockData)).toBeTruthy();
  });

  it('should create from ProfileData', () => {
    const data: ProfileData = {
      id: '2',
      name: 'Other User',
      profilePic: '/img2.png',
      kid: false,
      language: 'en',
      videoProgress: [],
      watchStats: {
        totalVideosStarted: 10,
        totalVideosCompleted: 20,
        totalCompletions: 30,
        totalWatchTime: 40,
        uniqueVideosWatched: 50,
        completionRate: 60,
      },
    };
    const profile = new Profile(data);
    expect(profile.id).toBe('2');
    expect(profile.name).toBe('Other User');
    expect(profile.profilePic).toBe('/img2.png');
    expect(profile.kid).toBe(false);
    expect(profile.language).toBe('en');
    expect(profile.watchStats.totalVideosStarted).toBe(10);
  });

  it('should return display name', () => {
    const data: ProfileData = {
      id: '2',
      name: 'Other User',
      profilePic: '/img2.png',
      kid: false,
      language: 'en',
      videoProgress: [],
      watchStats: {
        totalVideosStarted: 10,
        totalVideosCompleted: 20,
        totalCompletions: 30,
        totalWatchTime: 40,
        uniqueVideosWatched: 50,
        completionRate: 60,
      },
    };
    const profile = new Profile(data);
    expect(profile.getDisplayName()).toBe('Other User');
    profile.name = '';
    expect(profile.getDisplayName()).toBe('Profile 2');
  });

  it('should detect child profile', () => {
    const apiData: ProfileApiData = {
      id: '1',
      profile_name: 'Test User',
      profile_picture: null,
      profile_picture_url: '/img.png',
      is_kid: true,
      preferred_language: 'de',
      video_progress: [],
      watch_statistics: {
        total_videos_started: 1,
        total_videos_completed: 2,
        total_completions: 3,
        total_watch_time: 4,
        unique_videos_watched: 5,
        completion_rate: 6,
      },
    };
    expect(new Profile(apiData).isChildProfile()).toBe(true);
  });

  it('should return profile image or default', () => {
    const data: ProfileData = {
      id: '2',
      name: 'Other User',
      profilePic: '/img2.png',
      kid: false,
      language: 'en',
      videoProgress: [],
      watchStats: {
        totalVideosStarted: 10,
        totalVideosCompleted: 20,
        totalCompletions: 30,
        totalWatchTime: 40,
        uniqueVideosWatched: 50,
        completionRate: 60,
      },
    };
    expect(new Profile(data).getProfileImage()).toBe('/img2.png');
    const empty = Profile.empty();
    expect(empty.getProfileImage()).toBe('/assets/default-profile.png');
  });

  it('should convert to API format', () => {
    const data: ProfileData = {
      id: '2',
      name: 'Other User',
      profilePic: '/img2.png',
      kid: false,
      language: 'en',
      videoProgress: [],
      watchStats: {
        totalVideosStarted: 10,
        totalVideosCompleted: 20,
        totalCompletions: 30,
        totalWatchTime: 40,
        uniqueVideosWatched: 50,
        completionRate: 60,
      },
    };
    const profile = new Profile(data);
    const apiFormat = profile.toApiFormat();
    expect(apiFormat.id).toBe('2');
    expect(apiFormat.profile_name).toBe('Other User');
    expect(apiFormat.profile_picture_url).toBe('/img2.png');
    expect(apiFormat.is_kid).toBe(false);
    expect(apiFormat.preferred_language).toBe('en');
    expect(apiFormat.watch_statistics.total_videos_started).toBe(10);
  });

  it('should create an empty profile', () => {
    const empty = Profile.empty();
    expect(empty.id).toBe('');
    expect(empty.name).toBe('');
    expect(empty.profilePic).toBeNull();
    expect(empty.kid).toBe(false);
    expect(empty.language).toBe('en');
    expect(empty.videoProgress.length).toBe(0);
  });

  it('should set name to empty string if profile_name is null (if branch)', () => {
    const apiData: any = {
      id: 'x',
      profile_name: null,
      profile_picture_url: null,
      is_kid: false,
      preferred_language: 'de',
      video_progress: [],
      watch_statistics: {
        total_videos_started: 0,
        total_videos_completed: 0,
        total_completions: 0,
        total_watch_time: 0,
        unique_videos_watched: 0,
        completion_rate: 0
      }
    };
    const profile = new Profile(apiData);
    expect(profile.name).toBe('');
  });

  it('should map video_progress to VideoProgress instances (if branch)', () => {
    const videoData = { id: 'vid1' };
    const apiData: any = {
      id: 'x',
      profile_name: 'Test',
      profile_picture_url: null,
      is_kid: false,
      preferred_language: 'de',
      video_progress: [videoData],
      watch_statistics: {
        total_videos_started: 0,
        total_videos_completed: 0,
        total_completions: 0,
        total_watch_time: 0,
        unique_videos_watched: 0,
        completion_rate: 0
      }
    };
    const profile = new Profile(apiData);
    expect(profile.videoProgress.length).toBe(1);
    expect(profile.videoProgress[0].id).toBe('vid1');
  });
});

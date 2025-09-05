import { ProfileApiData } from '../interfaces/profile-api-data';
import { ProfileData } from '../interfaces/profile-data';
import { Profile } from './profile';

describe('Profile', () => {
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
});

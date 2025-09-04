import { ProfileApiData } from '../interfaces/profile-api-data';
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
});

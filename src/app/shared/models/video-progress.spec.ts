import { VideoProgressApiData } from '../interfaces/video-progress-api-data';
import { VideoProgress } from './video-progress';

describe('VideoProgress', () => {
  it('should create an instance', () => {
    const mockData: VideoProgressApiData = {
      video_file_id: '1',
      title: 'Test Video',
      thumbnail_url: 'http://example.com/thumbnail.jpg',
      current_time: 0,
      progress_percentage: 0,
      duration: 120,
      status: 'in_progress',
      is_completed: false,
      is_started: false,
      completion_count: 0,
      total_watch_time: 0,
      first_watched: null,
      last_watched: null,
      last_completed: null,
    }
    expect(new VideoProgress(mockData)).toBeTruthy();
  });
});

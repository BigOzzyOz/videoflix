import { VideoProgressApiData } from '../interfaces/video-progress-api-data';
import { VideoProgressData } from '../interfaces/video-progress-data';
import { VideoProgress } from './video-progress';

describe('VideoProgress', () => {
  const apiData: VideoProgressApiData = {
    video_file_id: '1',
    title: 'Test Video',
    thumbnail_url: 'http://example.com/thumbnail.jpg',
    current_time: 90,
    progress_percentage: 75.5,
    duration: 120,
    status: 'in_progress',
    is_completed: false,
    is_started: true,
    completion_count: 2,
    total_watch_time: 180,
    first_watched: '2023-01-01T10:00:00Z',
    last_watched: '2023-01-02T10:00:00Z',
    last_completed: null,
  };

  const internalData: VideoProgressData = {
    id: '2',
    title: 'Internal Video',
    thumbnail: '',
    currentTime: 0,
    progressPercentage: 0,
    duration: 60,
    status: 'not_started',
    completed: false,
    started: false,
    completionCount: 0,
    totalWatchTime: 0,
    firstWatched: null,
    lastWatched: null,
    lastCompleted: null,
  };

  it('should create an instance from API data', () => {
    const vp = new VideoProgress(apiData);
    expect(vp.id).toBe(apiData.video_file_id);
    expect(vp.title).toBe(apiData.title);
    expect(vp.thumbnail).toBe(apiData.thumbnail_url);
    expect(vp.currentTime).toBe(apiData.current_time);
    expect(vp.progressPercentage).toBe(apiData.progress_percentage);
    expect(vp.duration).toBe(apiData.duration);
    expect(vp.status).toBe(apiData.status);
    expect(vp.completed).toBe(apiData.is_completed);
    expect(vp.started).toBe(apiData.is_started);
    expect(vp.completionCount).toBe(apiData.completion_count);
    expect(vp.totalWatchTime).toBe(apiData.total_watch_time);
    expect(vp.firstWatched).toBe(apiData.first_watched);
    expect(vp.lastWatched).toBe(apiData.last_watched);
    expect(vp.lastCompleted).toBe(apiData.last_completed);
  });

  it('should create an instance from internal data', () => {
    const vp = new VideoProgress(internalData);
    expect(vp.id).toBe(internalData.id);
    expect(vp.title).toBe(internalData.title);
    expect(vp.thumbnail).toBe(internalData.thumbnail);
    expect(vp.currentTime).toBe(internalData.currentTime);
    expect(vp.progressPercentage).toBe(internalData.progressPercentage);
    expect(vp.duration).toBe(internalData.duration);
    expect(vp.status).toBe(internalData.status);
    expect(vp.completed).toBe(internalData.completed);
    expect(vp.started).toBe(internalData.started);
    expect(vp.completionCount).toBe(internalData.completionCount);
    expect(vp.totalWatchTime).toBe(internalData.totalWatchTime);
    expect(vp.firstWatched).toBe(internalData.firstWatched);
    expect(vp.lastWatched).toBe(internalData.lastWatched);
    expect(vp.lastCompleted).toBe(internalData.lastCompleted);
  });

  it('should format current time correctly', () => {
    const vp = new VideoProgress({ ...apiData, current_time: 3661 });
    expect(vp.formattedCurrentTime).toBe('1:01:01');
    const vp2 = new VideoProgress({ ...apiData, current_time: 59 });
    expect(vp2.formattedCurrentTime).toBe('0:59');
  });

  it('should format progress percentage', () => {
    const vp = new VideoProgress(apiData);
    expect(vp.progressPercentageFormatted).toBe('75.50%');
  });

  it('should return correct status flags', () => {
    const vp = new VideoProgress(apiData);
    expect(vp.isCompleted).toBe(false);
    expect(vp.isStarted).toBe(true);
    expect(vp.isInProgress).toBe(true);
    expect(vp.isNotStarted).toBe(false);
    const vp2 = new VideoProgress({ ...apiData, is_started: false });
    expect(vp2.isNotStarted).toBe(true);
  });

  it('should handle recently watched, first watched, last completed flags', () => {
    const vp = new VideoProgress(apiData);
    expect(vp.isRecentlyWatched).toBe(true);
    expect(vp.isFirstWatched).toBe(true);
    expect(vp.isLastCompleted).toBe(false);
    const vp2 = new VideoProgress({ ...apiData, last_completed: '2023-01-03T10:00:00Z' });
    expect(vp2.isLastCompleted).toBe(true);
  });

  it('should format dates correctly', () => {
    const vp = new VideoProgress(apiData);
    expect(vp.formattedLastWatched).toContain('2023');
    expect(vp.formattedFirstWatched).toContain('2023');
    expect(vp.formattedLastCompleted).toBe('Never');
    const vp2 = new VideoProgress({ ...apiData, last_completed: '2023-01-03T10:00:00Z' });
    expect(vp2.formattedLastCompleted).toContain('2023');
  });

  it('should format completion count and total watch time', () => {
    const vp = new VideoProgress(apiData);
    expect(vp.formattedCompletionCount).toBe('2');
    expect(vp.formattedTotalWatchTime).toBe('3:00');
    const vp2 = new VideoProgress({ ...apiData, total_watch_time: 3661 });
    expect(vp2.formattedTotalWatchTime).toBe('1:01:01');
  });

  it('should return default thumbnail if not set', () => {
    const vp = new VideoProgress({ ...apiData, thumbnail_url: '' });
    expect(vp.formattedThumbnail).toBe('/assets/default-thumbnail.png');
    const vp2 = new VideoProgress(apiData);
    expect(vp2.formattedThumbnail).toBe(apiData.thumbnail_url);
  });

  it('should format duration correctly', () => {
    const vp = new VideoProgress(apiData);
    expect(vp.durationFormatted).toBe('2:00');
    const vp2 = new VideoProgress({ ...apiData, duration: 3661 });
    expect(vp2.durationFormatted).toBe('1:01:01');
  });

  it('should convert to API format', () => {
    const vp = new VideoProgress(apiData);
    const apiFormat = vp.toApiFormat();
    expect(apiFormat.video_file_id).toBe(apiData.video_file_id);
    expect(apiFormat.title).toBe(apiData.title);
    expect(apiFormat.thumbnail_url).toBe(apiData.thumbnail_url);
    expect(apiFormat.current_time).toBe(apiData.current_time);
    expect(apiFormat.progress_percentage).toBe(apiData.progress_percentage);
    expect(apiFormat.duration).toBe(apiData.duration);
    expect(apiFormat.status).toBe(apiData.status);
    expect(apiFormat.is_completed).toBe(apiData.is_completed);
    expect(apiFormat.is_started).toBe(apiData.is_started);
    expect(apiFormat.completion_count).toBe(apiData.completion_count);
    expect(apiFormat.total_watch_time).toBe(apiData.total_watch_time);
    expect(apiFormat.first_watched).toBe(apiData.first_watched);
    expect(apiFormat.last_watched).toBe(apiData.last_watched);
    expect(apiFormat.last_completed).toBe(apiData.last_completed);
  });

  it('should handle edge cases with null and zero values', () => {
    const vp = new VideoProgress({
      video_file_id: '',
      title: '',
      thumbnail_url: '',
      current_time: 0,
      progress_percentage: 0,
      duration: 0,
      status: '',
      is_completed: false,
      is_started: false,
      completion_count: 0,
      total_watch_time: 0,
      first_watched: null,
      last_watched: null,
      last_completed: null,
    });
    expect(vp.formattedCurrentTime).toBe('0:00');
    expect(vp.progressPercentageFormatted).toBe('0.00%');
    expect(vp.formattedLastWatched).toBe('Never');
    expect(vp.formattedFirstWatched).toBe('Never');
    expect(vp.formattedLastCompleted).toBe('Never');
    expect(vp.formattedThumbnail).toBe('/assets/default-thumbnail.png');
    expect(vp.durationFormatted).toBe('0:00');
  });
});

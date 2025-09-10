import { VideoApiData } from '../interfaces/video-api-data';
import { VideoData } from '../interfaces/video-data';
import { Video } from './video';

describe('Video', () => {
  const apiData: VideoApiData = {
    id: '1',
    title: 'Test Video',
    description: 'This is a test video',
    genres: ['Action', 'Drama'],
    language: 'en',
    available_languages: ['en', 'de'],
    duration: 3661,
    thumbnail_url: 'http://example.com/thumbnail.jpg',
    preview_url: 'http://example.com/preview.mp4',
    hls_url: 'http://example.com/stream.m3u8',
    is_ready: true,
    created_at: '2023-10-01T12:00:00Z',
    updated_at: '2023-10-02T12:00:00Z',
  };

  const internalData: VideoData = {
    id: '2',
    title: 'Internal Video',
    description: 'Internal description',
    genres: ['Comedy'],
    language: 'de',
    availableLanguages: ['de'],
    duration: 59,
    thumbnail: '',
    preview: '',
    hls: '',
    ready: false,
    created: new Date('2023-09-01T12:00:00Z'),
    updated: new Date('2023-09-02T12:00:00Z'),
  };

  it('should create an instance from API data', () => {
    const video = new Video(apiData);
    expect(video.id).toBe(apiData.id);
    expect(video.title).toBe(apiData.title);
    expect(video.description).toBe(apiData.description);
    expect(video.genres).toEqual(apiData.genres);
    expect(video.language).toBe(apiData.language);
    expect(video.availableLanguages).toEqual(apiData.available_languages);
    expect(video.duration).toBe(apiData.duration);
    expect(video.thumbnail).toBe(apiData.thumbnail_url);
    expect(video.preview).toBe(apiData.preview_url);
    expect(video.hls).toBe(apiData.hls_url);
    expect(video.ready).toBe(apiData.is_ready);
    expect(video.created.toISOString()).toBe(new Date(apiData.created_at).toISOString());
    expect(video.updated.toISOString()).toBe(new Date(apiData.updated_at).toISOString());
  });

  it('should create an instance from internal data', () => {
    const video = new Video(internalData);
    expect(video.id).toBe(internalData.id);
    expect(video.title).toBe(internalData.title);
    expect(video.description).toBe(internalData.description);
    expect(video.genres).toEqual(internalData.genres);
    expect(video.language).toBe(internalData.language);
    expect(video.availableLanguages).toEqual(internalData.availableLanguages);
    expect(video.duration).toBe(internalData.duration);
    expect(video.thumbnail).toBe(internalData.thumbnail);
    expect(video.preview).toBe(internalData.preview);
    expect(video.hls).toBe(internalData.hls);
    expect(video.ready).toBe(internalData.ready);
    expect(video.created.toISOString()).toBe(internalData.created.toISOString());
    expect(video.updated.toISOString()).toBe(internalData.updated.toISOString());
  });

  it('should format duration correctly', () => {
    const video = new Video(apiData);
    expect(video.formattedDuration).toBe('1:01:01');
    const video2 = new Video({ ...apiData, duration: 59 });
    expect(video2.formattedDuration).toBe('0:59');
  });

  it('should return duration in milliseconds', () => {
    const video = new Video(apiData);
    expect(video.durationMs).toBe(apiData.duration * 1000);
  });

  it('should convert to API format', () => {
    const video = new Video(apiData);
    const apiFormat = video.toApiFormat();
    expect(apiFormat.id).toBe(apiData.id);
    expect(apiFormat.title).toBe(apiData.title);
    expect(apiFormat.description).toBe(apiData.description);
    expect(apiFormat.genres).toEqual(apiData.genres);
    expect(apiFormat.language).toBe(apiData.language);
    expect(apiFormat.available_languages).toEqual(apiData.available_languages);
    expect(apiFormat.duration).toBe(apiData.duration);
    expect(apiFormat.thumbnail_url).toBe(apiData.thumbnail_url);
    expect(apiFormat.preview_url).toBe(apiData.preview_url);
    expect(apiFormat.hls_url).toBe(apiData.hls_url);
    expect(apiFormat.is_ready).toBe(apiData.is_ready);
    expect(apiFormat.created_at).toBe(apiData.created_at);
    expect(apiFormat.updated_at).toBe(apiData.updated_at);
  });

  it('should handle edge cases with zero and missing values', () => {
    const video = new Video({
      id: '',
      title: '',
      description: '',
      genres: [],
      language: '',
      available_languages: [],
      duration: 0,
      thumbnail_url: '',
      preview_url: '',
      hls_url: '',
      is_ready: false,
      created_at: '',
      updated_at: '',
    });
    expect(video.formattedDuration).toBe('0:00');
    expect(video.durationMs).toBe(0);
  });

  it('should fallback to empty array if available_languages is missing', () => {
    const apiData: any = {
      id: '3',
      title: 'No Languages',
      description: '',
      genres: [],
      language: 'en',
      duration: 10,
      thumbnail_url: '',
      preview_url: '',
      hls_url: '',
      is_ready: true,
      created_at: '2023-10-01T12:00:00Z',
      updated_at: '2023-10-02T12:00:00Z'
    };
    const video = new Video(apiData);
    expect(Array.isArray(video.availableLanguages)).toBeTrue();
    expect(video.availableLanguages.length).toBe(0);
  });

  it('should fallback to current date if created_at is missing', () => {
    const apiData: any = {
      id: '4',
      title: 'No Created',
      description: '',
      genres: [],
      language: 'en',
      available_languages: ['en'],
      duration: 10,
      thumbnail_url: '',
      preview_url: '',
      hls_url: '',
      is_ready: true,
      updated_at: '2023-10-02T12:00:00Z'
    };
    const video = new Video(apiData);
    expect(video.created instanceof Date).toBeTrue();
    expect(isNaN(video.created.getTime())).toBeFalse();
  });

  it('should fallback to current date if updated_at is missing', () => {
    const apiData: any = {
      id: '5',
      title: 'No Updated',
      description: '',
      genres: [],
      language: 'en',
      available_languages: ['en'],
      duration: 10,
      thumbnail_url: '',
      preview_url: '',
      hls_url: '',
      is_ready: true,
      created_at: '2023-10-01T12:00:00Z'
    };
    const video = new Video(apiData);
    expect(video.updated instanceof Date).toBeTrue();
    expect(isNaN(video.updated.getTime())).toBeFalse();
  });
});

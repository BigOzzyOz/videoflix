import { VideoApiData } from '../interfaces/video-api-data';
import { Video } from './video';

describe('Video', () => {
  it('should create an instance', () => {
    const mockData: VideoApiData = {
      id: '1',
      title: 'Test Video',
      description: 'This is a test video',
      genres: ['Action', 'Drama'],
      language: 'en',
      available_languages: ['en', 'de'],
      duration: 3600,
      thumbnail_url: 'http://example.com/thumbnail.jpg',
      preview_url: 'http://example.com/preview.mp4',
      hls_url: 'http://example.com/stream.m3u8',
      is_ready: true,
      created_at: '2023-10-01T12:00:00Z',
      updated_at: '2023-10-02T12:00:00Z',
    }
    expect(new Video(mockData)).toBeTruthy();
  });
});

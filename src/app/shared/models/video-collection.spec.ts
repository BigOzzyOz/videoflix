import { VideoCollectionApiData } from '../interfaces/video-collection-api-data';
import { VideoCollectionData } from '../interfaces/video-collection-data';
import { VideoCollections } from './video-collection';
import { Video } from './video';

describe('VideoCollections', () => {
  it('should create an instance', () => {
    const mockData: VideoCollectionApiData = {
      count: 1,
      next: null,
      previous: null,
      results: []
    };
    expect(new VideoCollections('test', mockData)).toBeTruthy();
  });

  it('should create from VideoCollectionData', () => {
    const data: VideoCollectionData = {
      lastUpdated: '2025-09-06T00:00:00.000Z',
      videos: [],
      next: null,
      previous: null,
      params: 'test',
    };
    const col = new VideoCollections('test', data);
    expect(col.getGenreData('test')).toEqual(data);
  });

  it('should return formatted genre name', () => {
    const data: VideoCollectionData = {
      lastUpdated: '2025-09-06T00:00:00.000Z',
      videos: [],
      next: null,
      previous: null,
      params: 'test',
    };
    const col = new VideoCollections('new_action', data);
    expect(col.getName()).toContain('Recently Added');
    const col2 = new VideoCollections('comedy', data);
    expect(col2.getName()).toBe('Comedy');
  });

  it('should return first genre key or null', () => {
    const data: VideoCollectionData = {
      lastUpdated: '2025-09-06T00:00:00.000Z',
      videos: [],
      next: null,
      previous: null,
      params: 'test',
    };
    const col = new VideoCollections('test', data);
    expect(col.getFirstGenreKey()).toBe('test');
    const empty = VideoCollections.empty('empty', '', []);
    expect(empty.getFirstGenreKey()).toBe('empty');
  });

  it('should return videos from first genre', () => {
    const video = new Video({ id: '1', title: 'Test', description: '', genres: [], language: '', availableLanguages: [], duration: 0, thumbnail: '', preview: '', hls: '', ready: true, created: new Date(), updated: new Date() });
    const data: VideoCollectionData = {
      lastUpdated: '2025-09-06T00:00:00.000Z',
      videos: [video],
      next: null,
      previous: null,
      params: 'test',
    };
    const col = new VideoCollections('test', data);
    expect(col.getVideos()).toEqual([video]);
  });

  it('should create an empty VideoCollections', () => {
    const empty = VideoCollections.empty('empty', '', []);
    const genreData = empty.getGenreData('empty');
    expect(genreData ? genreData.videos.length : 0).toBe(0);
  });

  it('should map results to Video instances in constructor', () => {
    const videoData = {
      id: '1',
      title: 'Test',
      description: '',
      genres: [],
      language: 'de',
      available_languages: ['de'],
      duration: 120,
      thumbnail_url: '/thumb.png',
      preview_url: '/preview.mp4',
      hls_url: '/hls.m3u8',
      ready: true,
      is_ready: true,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const apiData: VideoCollectionApiData = {
      count: 1,
      next: null,
      previous: null,
      results: [videoData]
    };
    const col = new VideoCollections('test', apiData);
    expect(col['test'].videos.length).toBe(1);
    expect(col['test'].videos[0]).toBeInstanceOf(Video);
    expect(col['test'].videos[0].id).toBe('1');
  });

  it('should return empty string in getName if no genre key exists', () => {
    const col = new VideoCollections('constructor', {} as any);
    expect(col.getName()).toBe('');
  });

  it('should return null in getFirstGenreKey if no genre key exists', () => {
    const col = new VideoCollections('constructor', {} as any);
    expect(col.getFirstGenreKey()).toBeNull();
  });

  it('should return null in getGenreData if key does not exist', () => {
    const col = new VideoCollections('test', { videos: [], lastUpdated: '', next: null, previous: null, params: 'test' });
    expect(col.getGenreData('notfound')).toBeNull();
  });

  it('should return empty array in getVideos if no genre key exists', () => {
    const col = new VideoCollections('constructor', {} as any);
    expect(col.getVideos()).toEqual([]);
  });

  it('should create empty VideoCollections with empty videos array by default', () => {
    const empty = VideoCollections.empty('empty', 'params');
    expect(empty.getGenreData('empty')?.videos.length).toBe(0);
  });
});

import { VideoCollectionApiData } from '../interfaces/video-collection-api-data';
import { VideoCollections } from './video-collection';

describe('VideoCollection', () => {
  it('should create an instance', () => {
    const mockData: VideoCollectionApiData = {
      count: 1,
      next: null,
      previous: null,
      results: []
    };
    expect(new VideoCollections('test', mockData)).toBeTruthy();
  });
});

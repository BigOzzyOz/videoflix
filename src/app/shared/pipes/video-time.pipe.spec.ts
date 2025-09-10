import { VideoTimePipe } from './video-time.pipe';

describe('VideoTimePipe', () => {
  let pipe: VideoTimePipe;
  beforeEach(() => {
    pipe = new VideoTimePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format 0 seconds as 00:00', () => {
    expect(pipe.transform(0)).toBe('00:00');
  });

  it('should format negative seconds as 00:00', () => {
    expect(pipe.transform(-5)).toBe('00:00');
  });

  it('should format seconds less than 1 minute', () => {
    expect(pipe.transform(45)).toBe('00:45');
  });

  it('should format seconds more than 1 minute', () => {
    expect(pipe.transform(75)).toBe('01:15');
  });

  it('should format seconds more than 1 hour', () => {
    expect(pipe.transform(3661)).toBe('01:01:01');
  });

  it('should pad single digit minutes and seconds', () => {
    expect(pipe.transform(5)).toBe('00:05');
    expect(pipe.transform(65)).toBe('01:05');
    expect(pipe.transform(3605)).toBe('01:00:05');
  });

  it('should handle undefined and null input as 00:00', () => {
    expect(pipe.transform(undefined as any)).toBe('00:00');
    expect(pipe.transform(null as any)).toBe('00:00');
  });
});

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'videoTime',
  standalone: true
})
/**
 * Pipe to format seconds as video time (HH:MM:SS or MM:SS).
 */
export class VideoTimePipe implements PipeTransform {

  /**
   * Transforms seconds to formatted time string.
   * @param seconds Number of seconds to format.
   * @returns Formatted time string (HH:MM:SS or MM:SS).
   */
  transform(seconds: number): string {
    if (!seconds || seconds < 0) return '00:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }

}

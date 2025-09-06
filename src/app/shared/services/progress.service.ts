import { inject, Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { PlayerStateService } from './player-state.service';
import { Profile } from '../models/profile';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for managing video progress, resume time, and syncing with backend and session storage.
 */
export class ProgressService {
  api = inject(ApiService);
  errorService = inject(ErrorService);
  playerState = inject(PlayerStateService);

  SAVE_INTERVAL_MS = 15000;

  /**
   * Constructs the ProgressService and injects required dependencies.
   */
  constructor() { }

  /**
   * Updates the video progress for the current user and video, saving to backend if needed.
   * @param profileId The profile/user ID.
   * @param videoFileId The video file ID.
   * @param lastSaveTime The last time progress was saved (timestamp).
   * @returns The new last save time (timestamp).
   */
  async updateProgress(profileId: string, videoFileId: string, lastSaveTime: number): Promise<number> {
    const player = this.playerState.player;
    let saveTime = lastSaveTime;
    if (!player || !this.videoId) return saveTime;
    const currentTime = player.currentTime();
    if (currentTime <= 0) return saveTime;
    this.playerState.setIsPlaying(!player.paused());
    const now = Date.now();
    const shouldSave = saveTime === 0 || (now - saveTime > this.SAVE_INTERVAL_MS);
    if (currentTime && shouldSave) {
      saveTime = await this.saveProgress(profileId, videoFileId, currentTime, now, saveTime);
    }
    return saveTime;
  }

  /**
   * Saves the current video progress to session storage and backend API.
   * @param profileId The profile/user ID.
   * @param videoFileId The video file ID.
   * @param currentTime The current playback time.
   * @param now The current timestamp.
   * @param saveTime The previous save time.
   * @returns The new last save time (timestamp).
   */
  async saveProgress(profileId: string, videoFileId: string, currentTime: any, now: number, saveTime: number): Promise<number> {
    sessionStorage.setItem(this.key(), currentTime.toString());
    const newLastSaveTime = now;
    try {
      const response = await this.api.updateVideoProgress(profileId, videoFileId, currentTime);
      if (response.isSuccess()) {
        this.api.CurrentProfile = new Profile(response.data);
        return newLastSaveTime;
      } else {
        this.errorService.show('Failed to update video progress');
        return saveTime;
      }
    } catch (error) {
      this.errorService.show('An error occurred while updating video progress');
      return saveTime;
    }
  }

  /**
   * Gets the resume time for the current video, from backend or session storage.
   * @returns The resume time in seconds.
   */
  getResumeTime(): number {
    if (!this.videoId || !this.api.CurrentProfile) return 0;
    const data = this.api.CurrentProfile.videoProgress || [];
    const videoProgress = data.find(item => item.id === this.videoId);
    if (videoProgress && videoProgress.currentTime) {
      sessionStorage.setItem(this.key(), videoProgress.currentTime.toString());
      return videoProgress.currentTime;
    }
    const localResumeTime = Number(sessionStorage.getItem(this.key())) || 0;
    return localResumeTime;
  }

  /**
   * Gets the current video ID from player state.
   */
  get videoId(): string {
    return this.playerState.videoId();
  }

  /**
   * Returns the session storage key for the current video's resume time.
   * @returns The session storage key string.
   */
  key(): string {
    return `resume:${this.videoId}`;
  }
}

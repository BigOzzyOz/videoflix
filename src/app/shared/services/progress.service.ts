import { inject, Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { PlayerStateService } from './player-state.service';
import { Profile } from '../models/profile';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  api = inject(ApiService);
  errorService = inject(ErrorService);
  playerState = inject(PlayerStateService);

  constructor() { }

  async updateProgress(profileId: string, videoFileId: string, lastSaveTime: number): Promise<number> {
    const player = this.playerState.player;
    if (!player || !this.videoId) return lastSaveTime;

    const currentTime = player.currentTime();
    if (currentTime <= 0) return lastSaveTime;

    this.playerState.setIsPlaying(!player.paused());
    const now = Date.now();

    const shouldSave = lastSaveTime === 0 || (now - lastSaveTime > 15000);

    if (currentTime && shouldSave) {
      sessionStorage.setItem(this.key(), currentTime.toString());
      const newLastSaveTime = now;

      try {
        const response = await this.api.updateVideoProgress(profileId, videoFileId, currentTime);

        if (response.isSuccess()) {
          this.api.CurrentProfile = new Profile(response.data);
          return newLastSaveTime;
        } else {
          this.errorService.show('Failed to update video progress');
          return lastSaveTime;
        }
      } catch (error) {
        this.errorService.show('An error occurred while updating video progress');
        return lastSaveTime;
      }
    }
    return lastSaveTime;
  }

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

  get videoId(): string {
    return this.playerState.videoId();
  }

  key(): string {
    return `resume:${this.videoId}`;
  }
}

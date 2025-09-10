import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Video } from '../../../shared/models/video';
import { ApiService } from '../../../shared/services/api.service';
import { ErrorService } from '../../../shared/services/error.service';

@Component({
  selector: 'app-movie',
  imports: [],
  templateUrl: './movie.component.html',
  styleUrl: './movie.component.scss'
})
/**
 * MovieComponent displays a single movie item, tracks user progress, and emits selection events.
 * It initializes progress state, handles user selection, and provides error feedback if no video is present.
 */
export class MovieComponent implements OnInit {
  @Input() video: Video | null = null;
  @Output() videoSelected: EventEmitter<Video> = new EventEmitter<Video>();

  api = inject(ApiService);
  errorService = inject(ErrorService);

  continueWatching: boolean = false;
  progressPercentage: number = 0;

  constructor() { }

  ngOnInit(): void {
    /**
     * Initializes the component state based on the user's video progress.
     * Sets continueWatching and progressPercentage if progress is found and above threshold.
     */
    if (!this.video) return;
    const progress = this.api.CurrentProfile.videoProgress.find(p => p.id === this.video?.id)
    if (progress && progress.progressPercentage > 2) {
      this.continueWatching = true;
      this.progressPercentage = progress.progressPercentage;
    } else {
      this.continueWatching = false;
      this.progressPercentage = 0;
    }
  }

  onVideoClick(): void {
    /**
     * Emits the selected video via the videoSelected output, or shows an error if no video is present.
     */
    if (this.video) this.videoSelected.emit(this.video);
    else this.errorService.show('No video selected');
  }
}

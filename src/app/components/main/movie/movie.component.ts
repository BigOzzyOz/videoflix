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
export class MovieComponent implements OnInit {
  @Input() video: Video | null = null;
  @Output() videoSelected: EventEmitter<Video> = new EventEmitter<Video>();

  api = inject(ApiService);
  errorService = inject(ErrorService);

  continueWatching: boolean = false;
  progressPercentage: number = 0;

  constructor() { }

  ngOnInit() {
    if (this.video) {
      const progress = this.api.currentProfile?.videoProgress.find(p => p.id === this.video!.id)
      if (progress && progress.progressPercentage > 2) {
        this.continueWatching = true;
        this.progressPercentage = progress.progressPercentage;
      } else {
        this.continueWatching = false;
        this.progressPercentage = 0;
      }
    }
  }

  onVideoClick() {
    if (this.video) this.videoSelected.emit(this.video);
    else this.errorService.show('No video selected');
  }
}

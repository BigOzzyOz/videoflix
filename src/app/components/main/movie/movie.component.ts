import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Video } from '../../../shared/models/video';
import { ApiService } from '../../../shared/services/api.service';

@Component({
  selector: 'app-movie',
  imports: [],
  templateUrl: './movie.component.html',
  styleUrl: './movie.component.scss'
})
export class MovieComponent {
  @Input() video: Video | null = null;
  @Output() videoSelected: EventEmitter<Video> = new EventEmitter<Video>();

  api = inject(ApiService);

  constructor() {

  }

  onVideoClick() {
    if (this.video) this.videoSelected.emit(this.video);
    else console.warn('No video data available');
  }
}

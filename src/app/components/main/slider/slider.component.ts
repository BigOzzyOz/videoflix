import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { VideoCollections } from '../../../shared/models/video-collection';
import { ApiService } from '../../../shared/services/api.service';
import { MovieComponent } from '../movie/movie.component';
import { Video } from '../../../shared/models/video';

@Component({
  selector: 'app-slider',
  imports: [MovieComponent],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent {
  @Input() collection: VideoCollections | null = null;
  @Output() videoSelected = new EventEmitter<Video>();

  api = inject(ApiService);

  constructor() { }

  onVideoSelected(video: Video): void {
    this.videoSelected.emit(video);
  }
}

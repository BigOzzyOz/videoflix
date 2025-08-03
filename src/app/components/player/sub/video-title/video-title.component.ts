import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-title',
  imports: [CommonModule],
  templateUrl: './video-title.component.html',
  styleUrl: './video-title.component.scss'
})
export class VideoTitleComponent {
  @Input() title: string | undefined = '';
}

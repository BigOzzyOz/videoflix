import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { FeaturedComponent } from "./featured/featured.component";
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { Video } from '../../shared/models/video';
import { VideoCollections } from '../../shared/models/video-collection';

@Component({
  selector: 'app-main',
  imports: [HeaderComponent, FooterComponent, FeaturedComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  private renderer = inject(Renderer2);
  private api = inject(ApiService);
  private errorService = inject(ErrorService);

  videoGenres: string[] = [];
  featuredVideo: Video | null = null;
  videoCollection: VideoCollections[] = [];


  constructor() { }

  async ngOnInit() {
    console.log('MainComponent initializing...');
    this.renderer.addClass(document.body, 'main-bg');

    try {
      await this.getGenreCount();
      await this.getVideoCollection();

      if (this.videoCollection.length > 0) {
        const firstGenreKey = Object.keys(this.videoCollection[0])[0];
        const videos = this.videoCollection[0][firstGenreKey].videos;
        this.featuredVideo = Array.isArray(videos) && videos.length > 0 ? videos[0] : null;
      }
    } catch (error) {
      const errorMsg = (error instanceof Error) ? error.message : String(error);
      this.errorService.show('Failed to initialize component: ' + errorMsg);
    }

    console.log('MainComponent initialized');
    console.log('Current Profile:', this.api.currentProfile);
    console.log('Video Genres:', this.videoGenres);
    console.log('Video Collection:', this.videoCollection);
    console.log('Featured Video:', this.featuredVideo);
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'main-bg');
  }

  async getGenreCount(): Promise<void> {
    try {
      const response = await this.api.getGenresCount();
      if (response.ok && response.data) {
        const sortedGenres = Object.entries(response.data)
          .filter(([key, value]) => value != null && value > 0)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([key]) => key);
        this.videoGenres = sortedGenres;
        this.videoGenres.unshift('new');
      } else {
        this.errorService.show(response.data);
      }
    } catch (error) {
      const errorMsg = (error instanceof Error) ? error.message : String(error);
      this.errorService.show('Failed to load genres count: ' + errorMsg);
    }
  }

  async getVideoCollection(): Promise<void> {
    for (const genre of this.videoGenres) {
      try {
        const paramGenre = genre === 'new' ? 'newly_released=true' : 'genre=' + genre;
        let paramLanguage = 'language=' + this.api.currentProfile?.language;
        let params = `${paramGenre}&${paramLanguage}`;
        let response = await this.api.getVideos(params);

        if (response.ok && response.data) {
          if (response.data['count'] === 0) {
            paramLanguage = paramLanguage + ',en';
            params = `${paramGenre}&${paramLanguage}`;
            response = await this.api.getVideos(params);
          }
          const collection = new VideoCollections(genre, response.data, params);
          this.videoCollection.push(collection);
        } else {
          this.errorService.show(response.data);
        }
      } catch (error) {
        const errorMsg = (error instanceof Error) ? error.message : String(error);
        this.errorService.show('Failed to load videos for genre ' + genre + ': ' + errorMsg);
      }
    }

  }
}

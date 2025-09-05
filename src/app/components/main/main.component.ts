import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { FeaturedComponent } from "./featured/featured.component";
import { SliderComponent } from "./slider/slider.component";
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';
import { Video } from '../../shared/models/video';
import { VideoCollections } from '../../shared/models/video-collection';
import { GenreCountData } from '../../shared/interfaces/genre-count-data';
import { LoadingService } from '../../shared/services/loading.service';


/**
 * MainComponent is the central page for displaying featured videos and genre-based video collections.
 * It manages loading state, error handling, and user interactions for selecting and viewing videos.
 * Integrates header, footer, featured, and slider components, and fetches data from the API service.
 */
@Component({
  selector: 'app-main',
  imports: [HeaderComponent, FooterComponent, FeaturedComponent, SliderComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  private renderer = inject(Renderer2);
  private errorService = inject(ErrorService);
  api = inject(ApiService);
  loadingService = inject(LoadingService);

  videoGenres: string[] = [];
  featuredVideo: Video | null = null;
  videoCollection: VideoCollections[] = [];
  showFeaturedVideo: boolean = false;

  /**
   * Initializes loading state when the component is constructed.
   */
  constructor() {
    this.loadingService.setLoading(true);
  }

  /**
   * Lifecycle hook: runs on component initialization.
   * Sets up background, loads genres and video collections, and handles errors.
   */
  async ngOnInit() {
    this.renderer.addClass(document.body, 'main-bg');
    try {
      if (this.isContinuePossible()) await this.addContinueWatching();
      await this.getGenreCount();
      await this.getVideoCollection();
      this.setFeaturedVideo();
      this.loadingService.setLoading(false);
    } catch (error) {
      const errorMsg = (error instanceof Error) ? error.message : String(error);
      this.errorService.show('Failed to initialize component: ' + errorMsg);
    }
  }

  /**
   * Determines if the 'Continue Watching' feature should be shown for the current profile.
   * Returns true if there is at least one video with progress.
   */
  private isContinuePossible(): boolean {
    return this.api.CurrentProfile.videoProgress.length > 0 && this.api.CurrentProfile.videoProgress.some(v => v.currentTime > 0);
  }

  /**
   * Sets the featured video to the first video in the first genre collection, if available.
   */
  private setFeaturedVideo(): void {
    if (this.videoCollection.length > 0) {
      const firstGenreKey = Object.keys(this.videoCollection[0])[0];
      const videos = this.videoCollection[0][firstGenreKey].videos;
      this.featuredVideo = Array.isArray(videos) && videos.length > 0 ? videos[0] : null;
    }
  }

  /**
   * Lifecycle hook: cleans up background class on component destroy.
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'main-bg');
  }

  /**
   * Handles selection of a video, updates featured video and scrolls to top.
   * Shows overlay on small screens.
   * @param video The selected Video object.
   */
  onVideoSelected(video: Video): void {
    this.featuredVideo = video;
    const screenwidth = window.innerWidth;
    if (screenwidth < 768 && this.featuredVideo) {
      this.showFeaturedVideo = true;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Hides the featured video overlay.
   */
  hideFeaturedVideo(): void {
    this.showFeaturedVideo = false;
  }

  /**
   * Fetches and sorts video genres from the API, updates the genre list.
   */
  async getGenreCount(): Promise<void> {
    try {
      const response = await this.api.getGenresCount();
      if (response.ok && response.data) {
        const genreData: GenreCountData = response.data;
        this.videoGenres = this.getSortedGenres(genreData);
        this.videoGenres.unshift('new');
      } else this.errorService.show(response.data);
    } catch (error) {
      const errorMsg = (error instanceof Error) ? error.message : String(error);
      this.errorService.show('Failed to load genres count: ' + errorMsg);
    }
  }

  /**
   * Sorts genres by count, filters out empty genres.
   * @param genreData Genre count data from API.
   * @returns Sorted array of genre names.
   */
  private getSortedGenres(genreData: GenreCountData): string[] {
    return Object.entries(genreData)
      .filter(([key, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([key]) => key);
  }

  /**
   * Loads video collections for each genre in the genre list.
   */
  async getVideoCollection(): Promise<void> {
    for (const genre of this.videoGenres) {
      try {
        await this.getVideoCollectionByGenre(genre);
      } catch (error) {
        const errorMsg = (error instanceof Error) ? error.message : String(error);
        this.errorService.show('Failed to load videos for genre ' + genre + ': ' + errorMsg);
      }
    }
  }

  /**
   * Loads video collection for a specific genre, with fallback to English if no videos found.
   * @param genre The genre name to fetch videos for.
   */
  private async getVideoCollectionByGenre(genre: string): Promise<void> {
    const paramGenre = genre === 'new' ? 'newly_released=true' : 'genres=' + genre;
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
    } else this.errorService.show(response.data);
  }


  /**
   * Adds a 'Continue Watching' collection for videos in progress for the current profile.
   */
  async addContinueWatching(): Promise<void> {
    try {
      const continueWatching: Video[] = [];
      for (const video of this.api.CurrentProfile.videoProgress.filter(v => v.isStarted && !v.isCompleted)) {
        const newVideo = await this.api.getVideoById(video?.id);
        if (newVideo.isSuccess()) continueWatching.push(new Video(newVideo.data));
        else this.errorService.show(newVideo.data);
      }
      if (continueWatching.length === 0) return;

      const continueWatchingData = VideoCollections.empty('continue_watching', 'continue_watching=true', continueWatching)
      this.videoCollection.unshift(continueWatchingData);
    } catch (err) {
      const errorMsg = (err instanceof Error) ? err.message : String(err);
      this.errorService.show('Failed to load continue watching videos: ' + errorMsg);
    }
  }
};



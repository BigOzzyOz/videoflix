import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { FeaturedComponent } from "./featured/featured.component";
import { ApiService } from '../../shared/services/api.service';
import { ErrorService } from '../../shared/services/error.service';

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

  videoGenres: any[] = [];
  featuredVideos: any[] = [];



  constructor() { }

  ngOnInit() {
    this.renderer.addClass(document.body, 'main-bg');
    this.getGenreCount();
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'main-bg');
  }

  async getGenreCount(): Promise<void> {
    this.api.getGenresCount().then((response) => {
      if (response.ok && response.data) {
        const sortedGenres = Object.entries(response.data)
          .sort(([, a], [, b]) => b - a)
          .map(([key]) => key);
        this.videoGenres = sortedGenres;
      } else {
        this.errorService.show(response.data);
      }
    }).catch((error) => {
      this.errorService.show('Failed to load genres count: ' + error.message);
    });
  }
}

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { VideoCollections } from '../../../shared/models/video-collection';
import { Video } from '../../../shared/models/video';
import { ApiService } from '../../../shared/services/api.service';
import { OverflowDetectionService } from '../../../shared/services/overflow-detection.service';
import { MovieComponent } from '../movie/movie.component';
import { OverflowState } from '../../../shared/interfaces/overflow-state';

@Component({
  selector: 'app-slider',
  imports: [MovieComponent],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements AfterViewInit, OnDestroy {
  @Input() collection: VideoCollections | null = null;
  @Output() videoSelected = new EventEmitter<Video>();
  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;

  api = inject(ApiService);
  private overflowService = inject(OverflowDetectionService);
  private resizeObserver?: ResizeObserver;
  private cdr = inject(ChangeDetectorRef);

  // Separate Properties für bessere Kontrolle
  hasOverflow: boolean = false;
  atStart: boolean = true;
  atEnd: boolean = false;
  atMiddle: boolean = false;
  private scrollTimeout: number | undefined;
  private resizeTimeout: number | undefined;

  // Für Debug (optional)
  overflowState: OverflowState = {
    hasOverflow: false,
    atStart: true,
    atEnd: false,
    atMiddle: false,
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
    scrollableWidth: 0,
    visibleStart: 0,
    visibleEnd: 0,
    percentage: 0
  };


  ngAfterViewInit(): void {
    // Mehrere Frames warten für DOM-Stabilität
    setTimeout(() => {
      this.checkOverflow();
      this.setupObservers();
      this.cdr.detectChanges();
    }, 50);
  }

  onVideoSelected(video: Video): void {
    this.videoSelected.emit(video);
  }

  onScroll(): void {
    this.clearScrollTimeout();
    this.scrollTimeout = setTimeout(() => {
      this.checkOverflow();
      this.scrollTimeout = undefined;
    }, 16); // ~60fps
  }

  scrollLeft(): void {
    if (!this.sliderContainer || this.atStart) return;

    const container = this.sliderContainer.nativeElement;
    const scrollAmount = this.calculateItemScrollAmount();

    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }

  scrollRight(): void {
    if (!this.sliderContainer || this.atEnd) return;

    const container = this.sliderContainer.nativeElement;
    const scrollAmount = this.calculateItemScrollAmount();

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }

  private calculateItemScrollAmount(): number {
    const container = this.sliderContainer.nativeElement;
    const firstItem = container.querySelector('app-movie') as HTMLElement;

    if (firstItem) {
      const itemWidth = firstItem.offsetWidth;
      const containerStyle = window.getComputedStyle(container);
      const gap = parseFloat(containerStyle.gap) || 32;

      return itemWidth + gap;
    }

    return 432; // fallback
  }

  private checkOverflow(): void {
    if (!this.sliderContainer) return;

    const container = this.sliderContainer.nativeElement;
    const newOverflowState = this.overflowService.checkOverflow(container);

    // Nur bei echten Änderungen updaten
    const hasChanged =
      this.hasOverflow !== newOverflowState.hasOverflow ||
      this.atStart !== newOverflowState.atStart ||
      this.atEnd !== newOverflowState.atEnd ||
      this.atMiddle !== newOverflowState.atMiddle;

    if (hasChanged) {
      this.hasOverflow = newOverflowState.hasOverflow;
      this.atStart = newOverflowState.atStart;
      this.atEnd = newOverflowState.atEnd;
      this.atMiddle = newOverflowState.atMiddle;
      this.overflowState = newOverflowState;

      // Nur markieren, nicht sofort detectChanges
      this.cdr.markForCheck();
    }
  }

  private setupObservers(): void {
    // Intersection Observer für Performance
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.checkOverflow();
        }
      });
    });

    intersectionObserver.observe(this.sliderContainer.nativeElement);

    // Resize Observer
    this.resizeObserver = new ResizeObserver(() => {
      this.clearResizeTimeout();
      this.resizeTimeout = setTimeout(() => {
        this.checkOverflow();
      }, 100);
    });

    this.resizeObserver.observe(this.sliderContainer.nativeElement);
  }

  private clearScrollTimeout(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = undefined;
    }
  }

  private clearResizeTimeout(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = undefined;
    }
  }

  ngOnDestroy(): void {
    this.clearScrollTimeout();
    this.clearResizeTimeout();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

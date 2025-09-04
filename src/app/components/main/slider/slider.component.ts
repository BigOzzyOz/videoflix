import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { VideoCollections } from '../../../shared/models/video-collection';
import { Video } from '../../../shared/models/video';
import { ApiService } from '../../../shared/services/api.service';
import { OverflowDetectionService } from '../../../shared/services/overflow-detection.service';
import { MovieComponent } from '../movie/movie.component';
import { OverflowState } from '../../../shared/interfaces/overflow-state';

/**
 * SliderComponent displays a horizontal scrollable list of movies (Video items) from a given collection.
 * It provides navigation controls to scroll left/right, emits events when a video is selected,
 * and manages overflow state for UI responsiveness. Uses ResizeObserver and IntersectionObserver
 * to detect container changes and update scroll/overflow state.
 */
@Component({
  selector: 'app-slider',
  imports: [MovieComponent],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderComponent implements AfterViewInit, OnDestroy {
  @Input() collection: VideoCollections | null = null;
  /**
   * Emits when a video is selected from the slider.
   */
  @Output() videoSelected = new EventEmitter<Video>();
  /**
   * Reference to the slider container element.
   */
  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;

  api = inject(ApiService);
  private overflowService = inject(OverflowDetectionService);
  private resizeObserver?: ResizeObserver;
  private cdr = inject(ChangeDetectorRef);

  /**
   * Default scroll amount in pixels if no item width can be determined.
   */
  DEFAULT_SCROLL_AMOUNT = 432;
  hasOverflow: boolean = false;
  atStart: boolean = true;
  atEnd: boolean = false;
  atMiddle: boolean = false;
  private scrollTimeout: number | undefined;
  private resizeTimeout: number | undefined;

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


  /**
   * Called after the view is initialized. Sets up overflow detection and observers.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkOverflow();
      this.setupObservers();
      this.cdr.detectChanges();
    }, 50);
  }

  /**
   * Emits the selected video via the videoSelected output.
   * @param video The selected Video object.
   */
  onVideoSelected(video: Video): void {
    this.videoSelected.emit(video);
  }

  /**
   * Handles scroll events, debouncing overflow checks for performance.
   */
  onScroll(): void {
    this.clearScrollTimeout();
    this.scrollTimeout = setTimeout(() => {
      this.checkOverflow();
      this.scrollTimeout = undefined;
    }, 16);
  }

  /**
   * Scrolls the slider container to the left by one item width, unless at the start.
   */
  scrollLeft(): void {
    if (!this.sliderContainer || this.atStart) return;

    const container = this.sliderContainer.nativeElement;
    const scrollAmount = this.calculateItemScrollAmount();

    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }

  /**
   * Scrolls the slider container to the right by one item width, unless at the end.
   */
  scrollRight(): void {
    if (!this.sliderContainer || this.atEnd) return;

    const container = this.sliderContainer.nativeElement;
    const scrollAmount = this.calculateItemScrollAmount();

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }

  /**
   * Calculates the scroll amount based on the first item's width and container gap.
   * Returns DEFAULT_SCROLL_AMOUNT if no item is found.
   */
  private calculateItemScrollAmount(): number {
    const container = this.sliderContainer.nativeElement;
    const firstItem = container.querySelector('app-movie') as HTMLElement;

    if (firstItem) {
      const itemWidth = firstItem.offsetWidth;
      const containerStyle = window.getComputedStyle(container);
      const gap = parseFloat(containerStyle.gap) || 32;

      return itemWidth + gap;
    }

    return this.DEFAULT_SCROLL_AMOUNT;
  }

  /**
   * Checks and updates the overflow state of the slider container.
   * Triggers change detection if state changes.
   */
  private checkOverflow(): void {
    if (!this.sliderContainer) return;

    const container = this.sliderContainer.nativeElement;
    const newOverflowState = this.overflowService.checkOverflow(container);
    const hasChanged = this.checkHasChanged(container);

    if (hasChanged) {
      this.setNewOverflowState(newOverflowState);
      this.cdr.markForCheck();
    }
  }

  /**
   * Determines if the overflow state has changed compared to the previous state.
   */
  private checkHasChanged(container: HTMLDivElement): boolean {
    const newOverflowState = this.overflowService.checkOverflow(container);
    return (
      this.hasOverflow !== newOverflowState.hasOverflow ||
      this.atStart !== newOverflowState.atStart ||
      this.atEnd !== newOverflowState.atEnd ||
      this.atMiddle !== newOverflowState.atMiddle
    );
  }

  /**
   * Updates the overflow state properties from the given state object.
   */
  private setNewOverflowState(state: OverflowState): void {
    this.hasOverflow = state.hasOverflow;
    this.atStart = state.atStart;
    this.atEnd = state.atEnd;
    this.atMiddle = state.atMiddle;
    this.overflowState = state;
  }

  /**
   * Sets up IntersectionObserver and ResizeObserver to monitor container changes.
   */
  private setupObservers(): void {
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) this.checkOverflow();
      });
    });

    intersectionObserver.observe(this.sliderContainer.nativeElement);

    this.resizeObserver = new ResizeObserver(() => {
      this.clearResizeTimeout();
      this.resizeTimeout = setTimeout(() => this.checkOverflow(), 100);
    });

    this.resizeObserver.observe(this.sliderContainer.nativeElement);
  }

  /**
   * Clears the scroll timeout if set.
   */
  private clearScrollTimeout(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = undefined;
    }
  }

  /**
   * Clears the resize timeout if set.
   */
  private clearResizeTimeout(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = undefined;
    }
  }

  /**
   * Cleans up observers and timeouts when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.clearScrollTimeout();
    this.clearResizeTimeout();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

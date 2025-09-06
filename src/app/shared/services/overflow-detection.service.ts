import { Injectable } from '@angular/core';
import { OverflowState } from '../interfaces/overflow-state';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for detecting horizontal overflow and visibility in scrollable containers.
 */
export class OverflowDetectionService {

  constructor() { }

  /**
   * Checks the overflow state of an element and returns detailed metrics and flags.
   * @param element The element to check
   * @param threshold Threshold for edge detection (default: 10px)
   * @returns OverflowState with all scroll and position information
   */
  checkOverflow(element: HTMLElement, threshold: number = 10): OverflowState {
    const metrics = this.getScrollMetrics(element);
    const flags = this.getOverflowFlags(metrics, threshold);
    return { ...metrics, ...flags };
  }

  /**
   * Extracts scroll metrics from an element (scrollLeft, scrollWidth, etc.).
   * @param element The element to read metrics from
   */
  private getScrollMetrics(element: HTMLElement) {
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;
    const scrollableWidth = scrollWidth - clientWidth;
    const visibleStart = scrollLeft;
    const visibleEnd = scrollLeft + clientWidth;
    return {
      scrollLeft,
      scrollWidth,
      clientWidth,
      scrollableWidth,
      visibleStart,
      visibleEnd
    };
  }

  /**
   * Calculates overflow flags and scroll percentage for a given metrics object.
   * @param metrics Scroll metrics object
   * @param threshold Threshold for edge detection
   */
  private getOverflowFlags(metrics: any, threshold: number) {
    const { scrollLeft, scrollWidth, clientWidth, scrollableWidth } = metrics;
    const hasOverflow = scrollWidth > clientWidth;
    const atStart = scrollLeft <= threshold;
    const atEnd = scrollLeft >= (scrollableWidth - threshold);
    const atMiddle = !atStart && !atEnd && hasOverflow;
    const percentage = hasOverflow && scrollableWidth > 0 ? (scrollLeft / scrollableWidth) * 100 : 0;
    return {
      hasOverflow,
      atStart,
      atEnd,
      atMiddle,
      percentage
    };
  }

  /**
   * Calculates the visible range and scroll percentage for a container/content pair.
   * @param containerWidth Width of the container
   * @param contentWidth Width of the content
   * @param scrollPosition Current scroll position
   * @returns Object with visible range and percentages
   */
  getVisibleRange(containerWidth: number, contentWidth: number, scrollPosition: number) {
    const visibleStart = scrollPosition;
    const visibleEnd = scrollPosition + containerWidth;

    return {
      visibleStart,
      visibleEnd,
      isOverflowing: contentWidth > containerWidth,
      visiblePercentage: (containerWidth / contentWidth) * 100,
      scrollPercentage: (scrollPosition / (contentWidth - containerWidth)) * 100
    };
  }

  /**
   * Checks if a given item range is visible within the visible area.
   * @param itemStart Start position of the item
   * @param itemEnd End position of the item
   * @param visibleStart Start of the visible area
   * @param visibleEnd End of the visible area
   * @returns True if item is at least partially visible
   */
  isItemVisible(itemStart: number, itemEnd: number, visibleStart: number, visibleEnd: number): boolean {
    return itemStart < visibleEnd && itemEnd > visibleStart;
  }

  /**
   * Calculates the percentage of an item that is visible within the visible area.
   * @param itemStart Start position of the item
   * @param itemEnd End position of the item
   * @param visibleStart Start of the visible area
   * @param visibleEnd End of the visible area
   * @returns Percentage of the item that is visible (0-100)
   */
  getVisibilityPercentage(itemStart: number, itemEnd: number, visibleStart: number, visibleEnd: number): number {
    if (!this.isItemVisible(itemStart, itemEnd, visibleStart, visibleEnd)) {
      return 0;
    }
    const visibleItemStart = Math.max(itemStart, visibleStart);
    const visibleItemEnd = Math.min(itemEnd, visibleEnd);
    const visibleItemWidth = visibleItemEnd - visibleItemStart;
    const totalItemWidth = itemEnd - itemStart;

    return (visibleItemWidth / totalItemWidth) * 100;
  }
}

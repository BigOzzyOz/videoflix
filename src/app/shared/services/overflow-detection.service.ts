import { Injectable } from '@angular/core';
import { OverflowState } from '../interfaces/overflow-state';


@Injectable({
  providedIn: 'root'
})
export class OverflowDetectionService {

  constructor() { }

  /**
   * Prüft Overflow-Status eines Elements
   * @param element - Das zu prüfende Element
   * @param threshold - Schwellenwert für "am Rand" (default: 10px)
   * @returns OverflowState mit allen Informationen
   */
  checkOverflow(element: HTMLElement, threshold: number = 10): OverflowState {
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;
    const scrollableWidth = scrollWidth - clientWidth;

    // Sichtbarer Bereich
    const visibleStart = scrollLeft;
    const visibleEnd = scrollLeft + clientWidth;

    // Overflow vorhanden?
    const hasOverflow = scrollWidth > clientWidth;

    // Position-Checks
    const atStart = scrollLeft <= threshold;
    const atEnd = scrollLeft >= (scrollableWidth - threshold);
    const atMiddle = !atStart && !atEnd && hasOverflow;

    // Scroll-Prozentsatz
    const percentage = hasOverflow ? (scrollLeft / scrollableWidth) * 100 : 0;

    return {
      hasOverflow,
      atStart,
      atEnd,
      atMiddle,
      scrollLeft,
      scrollWidth,
      clientWidth,
      scrollableWidth,
      visibleStart,
      visibleEnd,
      percentage
    };
  }

  /**
   * Beispiel: Container 100px, Content 300px, sichtbar 125px-225px
   * @param containerWidth - Breite des Containers
   * @param contentWidth - Breite des Contents
   * @param scrollPosition - Aktuelle Scroll-Position
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
   * Prüft ob ein bestimmter Bereich sichtbar ist
   * @param itemStart - Start-Position des Items
   * @param itemEnd - End-Position des Items
   * @param visibleStart - Start des sichtbaren Bereichs
   * @param visibleEnd - Ende des sichtbaren Bereichs
   */
  isItemVisible(itemStart: number, itemEnd: number, visibleStart: number, visibleEnd: number): boolean {
    return itemStart < visibleEnd && itemEnd > visibleStart;
  }

  /**
   * Berechnet wie viel Prozent eines Items sichtbar sind
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

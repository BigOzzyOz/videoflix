import { TestBed } from '@angular/core/testing';

import { OverflowDetectionService } from './overflow-detection.service';


describe('OverflowDetectionService', () => {
  let service: OverflowDetectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverflowDetectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should detect overflow and positions correctly', () => {
    const el = {
      scrollLeft: 0,
      scrollWidth: 200,
      clientWidth: 100
    } as HTMLElement;
    const state = service.checkOverflow(el);
    expect(state.hasOverflow).toBeTrue();
    expect(state.atStart).toBeTrue();
    expect(state.atEnd).toBeFalse();
    expect(state.atMiddle).toBeFalse();
    expect(state.percentage).toBe(0);
  });

  it('should detect atEnd and percentage', () => {
    const el = {
      scrollLeft: 100,
      scrollWidth: 200,
      clientWidth: 100
    } as HTMLElement;
    const state = service.checkOverflow(el);
    expect(state.atEnd).toBeTrue();
    expect(state.percentage).toBeCloseTo(100);
  });

  it('should detect atMiddle', () => {
    const el = {
      scrollLeft: 50,
      scrollWidth: 200,
      clientWidth: 100
    } as HTMLElement;
    const state = service.checkOverflow(el);
    expect(state.atMiddle).toBeTrue();
  });

  it('should return no overflow if content fits', () => {
    const el = {
      scrollLeft: 0,
      scrollWidth: 100,
      clientWidth: 100
    } as HTMLElement;
    const state = service.checkOverflow(el);
    expect(state.hasOverflow).toBeFalse();
    expect(state.percentage).toBe(0);
  });

  it('should calculate visible range and percentages', () => {
    const range = service.getVisibleRange(100, 200, 50);
    expect(range.visibleStart).toBe(50);
    expect(range.visibleEnd).toBe(150);
    expect(range.isOverflowing).toBeTrue();
    expect(range.visiblePercentage).toBe(50);
    expect(range.scrollPercentage).toBeCloseTo(50);
  });

  it('should check item visibility', () => {
    expect(service.isItemVisible(10, 30, 0, 20)).toBeTrue();
    expect(service.isItemVisible(30, 40, 0, 20)).toBeFalse();
    expect(service.isItemVisible(0, 20, 0, 20)).toBeTrue();
  });

  it('should calculate visibility percentage', () => {
    expect(service.getVisibilityPercentage(10, 30, 0, 20)).toBe(50);
    expect(service.getVisibilityPercentage(30, 40, 0, 20)).toBe(0);
    expect(service.getVisibilityPercentage(0, 20, 0, 20)).toBe(100);
  });
});

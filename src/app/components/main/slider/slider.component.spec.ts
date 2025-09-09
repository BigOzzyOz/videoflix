import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent } from './slider.component';
import { Video } from '../../../shared/models/video';
import { OverflowDetectionService } from '../../../shared/services/overflow-detection.service';
import { ChangeDetectorRef, ElementRef } from '@angular/core';

function createVideoMock(): Video {
  return new Video({
    id: '1',
    title: 'Test',
    description: 'Test description',
    genres: [],
    language: 'en',
    availableLanguages: [],
    duration: 120,
    thumbnail: '',
    preview: '',
    hls: '',
    ready: true,
    created: new Date(),
    updated: new Date()
  });
}

function createOverflowStateMock(): any {
  return {
    hasOverflow: true,
    atStart: false,
    atEnd: true,
    atMiddle: false,
    scrollLeft: 0,
    scrollWidth: 0,
    clientWidth: 0,
    scrollableWidth: 0,
    visibleStart: 0,
    visibleEnd: 0,
    percentage: 0
  };
}

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;
  let overflowService: jasmine.SpyObj<OverflowDetectionService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;
  let originalResizeObserver: any;
  let originalIntersectionObserver: any;

  beforeEach(async () => {
    overflowService = jasmine.createSpyObj('OverflowDetectionService', ['checkOverflow']);

    originalResizeObserver = window.ResizeObserver;
    originalIntersectionObserver = window.IntersectionObserver;
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
    await TestBed.configureTestingModule({
      imports: [SliderComponent],
      providers: [
        { provide: OverflowDetectionService, useValue: overflowService },
        { provide: ChangeDetectorRef, useValue: cdr }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;
    component['overflowService'] = overflowService;
    component['cdr'] = cdr;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
    window.IntersectionObserver = originalIntersectionObserver;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit videoSelected on onVideoSelected', () => {
    const video = createVideoMock();
    spyOn(component.videoSelected, 'emit');
    component.onVideoSelected(video);
    expect(component.videoSelected.emit).toHaveBeenCalledWith(video);
  });

  describe('with fake timers', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });
    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should call checkOverflow on scroll with timeout', () => {
      spyOn(component as any, 'checkOverflow');
      component.sliderContainer = new ElementRef(document.createElement('div'));
      component.onScroll();
      jasmine.clock().tick(17);
      expect((component as any).checkOverflow).toHaveBeenCalled();
    });

    it('should call checkOverflow and setupObservers in ngAfterViewInit', () => {
      spyOn(component as any, 'checkOverflow');
      spyOn(component as any, 'setupObservers');
      component.sliderContainer = new ElementRef(document.createElement('div'));
      component.ngAfterViewInit();
      jasmine.clock().tick(51);
      expect((component as any).checkOverflow).toHaveBeenCalled();
      expect((component as any).setupObservers).toHaveBeenCalled();
      expect(cdr.detectChanges).toHaveBeenCalled();
    });

    it('should clear resize timeout and set new timeout to call checkOverflow on resize', () => {
      const originalResizeObserver = window.ResizeObserver;
      const container = document.createElement('div');
      component.sliderContainer = new ElementRef(container);
      spyOn(component as any, 'clearResizeTimeout');
      spyOn(component as any, 'checkOverflow');
      let resizeCallback: (() => void) | undefined = undefined;
      const mockObserve = jasmine.createSpy('observe');
      (window as any).ResizeObserver = function (cb: () => void) {
        resizeCallback = cb;
        return { observe: mockObserve };
      };
      (component as any).setupObservers();
      component['resizeObserver'] = {
        observe: jasmine.createSpy('observe'),
        unobserve: jasmine.createSpy('unobserve'),
        disconnect: jasmine.createSpy('disconnect')
      };
      if (resizeCallback) {
        (resizeCallback as (() => void))();
      }
      jasmine.clock().tick(101);
      expect((component as any).clearResizeTimeout).toHaveBeenCalled();
      expect((component as any).checkOverflow).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledWith(container);
      window.ResizeObserver = originalResizeObserver;
    });

    it('should call checkOverflow when intersection entry is intersecting', () => {
      const container = document.createElement('div');
      component.sliderContainer = new ElementRef(container);
      spyOn(component as any, 'checkOverflow');
      const mockObserve = jasmine.createSpy('observe');
      (window as any).IntersectionObserver = function (cb: Function) {
        cb([{ isIntersecting: true }]);
        return { observe: mockObserve };
      };
      (component as any).setupObservers();
      expect((component as any).checkOverflow).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalledWith(container);
    });
  });

  it('should scroll left if not at start', () => {
    const container = document.createElement('div');
    (container as any).scrollBy = jasmine.createSpy('scrollBy');
    component.sliderContainer = new ElementRef(container);
    component.atStart = false;
    spyOn(component as any, 'calculateItemScrollAmount').and.returnValue(100);
    component.scrollLeft();
    expect((container as any).scrollBy).toHaveBeenCalledWith({ left: -100, behavior: 'smooth' });
  });

  it('should not scroll left if at start', () => {
    const container = document.createElement('div');
    spyOn(container, 'scrollBy');
    component.sliderContainer = new ElementRef(container);
    component.atStart = true;
    component.scrollLeft();
    expect(container.scrollBy).not.toHaveBeenCalled();
  });

  it('should scroll right if not at end', () => {
    const container = document.createElement('div');
    (container as any).scrollBy = jasmine.createSpy('scrollBy');
    component.sliderContainer = new ElementRef(container);
    component.atEnd = false;
    spyOn(component as any, 'calculateItemScrollAmount').and.returnValue(100);
    component.scrollRight();
    expect((container as any).scrollBy).toHaveBeenCalledWith({ left: 100, behavior: 'smooth' });
  });

  it('should not scroll right if at end', () => {
    const container = document.createElement('div');
    spyOn(container, 'scrollBy');
    component.sliderContainer = new ElementRef(container);
    component.atEnd = true;
    component.scrollRight();
    expect(container.scrollBy).not.toHaveBeenCalled();
  });

  it('should calculate fallback scroll amount if no item found', () => {
    const container = document.createElement('div');
    component.sliderContainer = new ElementRef(container);
    expect((component as any).calculateItemScrollAmount()).toBe(432);
  });

  it('should disconnect resizeObserver on destroy', () => {
    const disconnectSpy = jasmine.createSpy('disconnect');
    component['resizeObserver'] = { disconnect: disconnectSpy } as any;
    component.ngOnDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should clear resize timeout', () => {
    component['resizeTimeout'] = setTimeout(() => { }, 1000);
    component['clearResizeTimeout']();
    expect(component['resizeTimeout']).toBeUndefined();
  });

  it('should call checkOverflow and markForCheck if overflow state changed', () => {
    const container = document.createElement('div');
    component.sliderContainer = new ElementRef(container);
    overflowService.checkOverflow.and.returnValue(createOverflowStateMock());
    spyOn(component as any, 'checkHasChanged').and.returnValue(true);
    spyOn(component as any, 'setNewOverflowState');
    component['cdr'] = cdr;
    (component as any).checkOverflow();
    expect(component['setNewOverflowState']).toHaveBeenCalled();
    expect(cdr.markForCheck).toHaveBeenCalled();
  });

  it('should calculate scroll amount using first item width and gap', () => {
    const container = document.createElement('div');
    const firstItem = document.createElement('div');
    firstItem.style.width = '200px';
    Object.defineProperty(firstItem, 'offsetWidth', { value: 200 });
    firstItem.classList.add('app-movie');
    container.appendChild(firstItem);
    container.style.gap = '40px';
    spyOn(window, 'getComputedStyle').and.returnValue({ gap: '40px' } as any);
    spyOn(container, 'querySelector').and.returnValue(firstItem);
    component.sliderContainer = new ElementRef(container);
    let result = (component as any).calculateItemScrollAmount();
    expect(result).toBe(240);
    (window.getComputedStyle as jasmine.Spy).and.returnValue({ gap: 'invalid' } as any);
    (container.querySelector as jasmine.Spy).and.returnValue(firstItem);
    component.sliderContainer = new ElementRef(container);
    result = (component as any).calculateItemScrollAmount();
    expect(result).toBe(232);
  });

  it('should return early in checkOverflow if sliderContainer is not set', () => {
    component.sliderContainer = undefined as any;
    overflowService.checkOverflow.and.returnValue(createOverflowStateMock());
    (component as any).checkOverflow();
    expect(component['overflowService'].checkOverflow).not.toHaveBeenCalled();
  });

  it('should return true if atStart changed in checkHasChanged', () => {
    const container = document.createElement('div');
    component.hasOverflow = false;
    component.atStart = false;
    component.atEnd = false;
    component.atMiddle = false;
    overflowService.checkOverflow.and.returnValue({
      hasOverflow: false,
      atStart: true,
      atEnd: false,
      atMiddle: false,
      percentage: 0,
      scrollLeft: 0,
      scrollWidth: 0,
      clientWidth: 0,
      scrollableWidth: 0,
      visibleStart: 0,
      visibleEnd: 0
    });
    expect((component as any).checkHasChanged(container)).toBeTrue();
  });

  it('should return true if atEnd changed in checkHasChanged', () => {
    const container = document.createElement('div');
    component.hasOverflow = false;
    component.atStart = false;
    component.atEnd = false;
    component.atMiddle = false;
    overflowService.checkOverflow.and.returnValue({
      hasOverflow: false,
      atStart: false,
      atEnd: true,
      atMiddle: false,
      percentage: 0,
      scrollLeft: 0,
      scrollWidth: 0,
      clientWidth: 0,
      scrollableWidth: 0,
      visibleStart: 0,
      visibleEnd: 0
    });
    expect((component as any).checkHasChanged(container)).toBeTrue();
  });

  it('should return true if atMiddle changed in checkHasChanged', () => {
    const container = document.createElement('div');
    component.hasOverflow = false;
    component.atStart = false;
    component.atEnd = false;
    component.atMiddle = false;
    overflowService.checkOverflow.and.returnValue({
      hasOverflow: false,
      atStart: false,
      atEnd: false,
      atMiddle: true,
      percentage: 0,
      scrollLeft: 0,
      scrollWidth: 0,
      clientWidth: 0,
      scrollableWidth: 0,
      visibleStart: 0,
      visibleEnd: 0
    });
    expect((component as any).checkHasChanged(container)).toBeTrue();
  });
});

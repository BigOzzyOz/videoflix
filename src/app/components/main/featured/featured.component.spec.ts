import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedComponent } from './featured.component';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';

describe('FeaturedComponent', () => {
  let component: FeaturedComponent;
  let fixture: ComponentFixture<FeaturedComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [FeaturedComponent],
      providers: [
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
    jasmine.clock().install();
    fixture = TestBed.createComponent(FeaturedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should reset preview and play video with timeouts', () => {
      component.video = { description: 'desc' } as any;
      const videoMock = {
        currentTime: 0,
        load: jasmine.createSpy('load'),
        play: jasmine.createSpy('play'),
        pause: jasmine.createSpy('pause'),
        muted: false,
        paused: true
      } as unknown as HTMLVideoElement;
      component.videoElement = new ElementRef(videoMock);
      spyOn(component as any, 'checkTextOverflow');
      component.ngOnChanges({ video: { currentValue: component.video, previousValue: null, firstChange: true, isFirstChange: () => true } });
      jasmine.clock().tick(100);
      expect((component as any).checkTextOverflow).toHaveBeenCalled();
      jasmine.clock().tick(2000);
      expect(videoMock.play).toHaveBeenCalled();
    });
  });

  describe('checkTextOverflow', () => {
    it('should set overflow attributes if overflow detected', () => {
      component.video = { description: 'desc' } as any;
      const element = document.createElement('div');
      spyOnProperty(element, 'scrollHeight', 'get').and.returnValue(200);
      spyOn(component as any, 'getElementLineHeight').and.returnValue(10);
      component.videoDescription = new ElementRef(element);
      spyOn(component as any, 'styleNormalSize').and.returnValue(200);
      spyOn(component as any, 'styleClampedSize');
      spyOn(component as any, 'changeOverflowStyle');
      (component as any).checkTextOverflow();
      expect(component.hasDescriptionOverflow).toBeTrue();
      expect((component as any).changeOverflowStyle).toHaveBeenCalledWith(element);
    });

    it('should not set overflow attributes if no overflow', () => {
      component.video = { description: 'desc' } as any;
      const element = document.createElement('div');
      spyOnProperty(element, 'scrollHeight', 'get').and.returnValue(20);
      spyOn(component as any, 'getElementLineHeight').and.returnValue(10);
      component.videoDescription = new ElementRef(element);
      spyOn(component as any, 'styleNormalSize').and.returnValue(20);
      spyOn(component as any, 'styleClampedSize');
      spyOn(component as any, 'changeOverflowStyle');
      (component as any).checkTextOverflow();
      expect(component.hasDescriptionOverflow).toBeFalse();
      expect((component as any).changeOverflowStyle).toHaveBeenCalledWith(element);
    });
  });

  describe('togglePreview', () => {
    it('should play video if paused', () => {
      const videoMock = { paused: true, play: jasmine.createSpy('play'), pause: jasmine.createSpy('pause') } as unknown as HTMLVideoElement;
      component.videoElement = new ElementRef(videoMock);
      component.togglePreview();
      expect(videoMock.play).toHaveBeenCalled();
    });

    it('should pause video if playing', () => {
      const videoMock = { paused: false, play: jasmine.createSpy('play'), pause: jasmine.createSpy('pause') } as unknown as HTMLVideoElement;
      component.videoElement = new ElementRef(videoMock);
      component.togglePreview();
      expect(videoMock.pause).toHaveBeenCalled();
    });
  });

  describe('toggleSound', () => {
    it('should toggle sound and mute video', () => {
      const videoMock = { muted: false } as unknown as HTMLVideoElement;
      component.videoElement = new ElementRef(videoMock);
      component.isSoundEnabled = true;
      component.toggleSound();
      expect(component.isSoundEnabled).toBeFalse();
      expect(videoMock.muted).toBeTrue();
      component.toggleSound();
      expect(component.isSoundEnabled).toBeTrue();
      expect(videoMock.muted).toBeFalse();
    });
  });

  describe('endPreview', () => {
    it('should reset video preview', () => {
      const videoMock = {
        pause: jasmine.createSpy('pause'),
        currentTime: 5,
        load: jasmine.createSpy('load')
      } as unknown as HTMLVideoElement;
      component.videoElement = new ElementRef(videoMock);
      component.endPreview();
      expect(videoMock.pause).toHaveBeenCalled();
      expect(videoMock.currentTime).toBe(0);
      expect(videoMock.load).toHaveBeenCalled();
    });
  });

  describe('playVideo', () => {
    it('should not navigate if videoId is empty', () => {
      spyOn(component, 'endPreview');
      component.playVideo('');
      expect(component.endPreview).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate and set sessionStorage if videoId is provided', () => {
      spyOn(component, 'endPreview');
      spyOn(sessionStorage, 'setItem');
      component.playVideo('123');
      expect(component.endPreview).toHaveBeenCalled();
      expect(component.isPreviewPlaying).toBeFalse();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('videoId', '123');
      expect(router.navigate).toHaveBeenCalledWith(['/video'], { queryParams: { videoId: '123' } });
    });
  });

  describe('getElementLineHeight', () => {
    it('should return lineHeight if available', () => {
      const element = document.createElement('div');
      spyOn(window, 'getComputedStyle').and.returnValue({ lineHeight: '20', fontSize: '10' } as any);
      expect((component as any).getElementLineHeight(element)).toBe(20);
    });

    it('should return fontSize if lineHeight is not available', () => {
      const element = document.createElement('div');
      spyOn(window, 'getComputedStyle').and.returnValue({ lineHeight: '', fontSize: '10' } as any);
      expect((component as any).getElementLineHeight(element)).toBe(10);
    });
  });

  describe('styleNormalSize', () => {
    it('should set styles and return scrollHeight', () => {
      const element = document.createElement('div');
      spyOnProperty(element, 'scrollHeight', 'get').and.returnValue(42);
      const result = (component as any).styleNormalSize(element);
      expect(element.style.height).toBe('auto');
      expect(element.style.overflow).toBe('visible');
      expect(element.style.display).toBe('block');
      expect(result).toBe(42);
    });
  });

  describe('styleClampedSize', () => {
    it('should set clamped styles', () => {
      const element = document.createElement('div');
      (component as any).styleClampedSize(element);
      expect(element.style.height).toBe('10rem');
      expect(element.style.overflow).toBe('hidden');
      expect(element.style.display).toBe('grid');
    });
  });

  describe('changeOverflowStyle', () => {
    it('should set overflow attributes if overflow', () => {
      component.hasDescriptionOverflow = true;
      component.video = { description: 'desc' } as any;
      const element = document.createElement('div');
      (component as any).changeOverflowStyle(element);
      expect(element.getAttribute('data-has-overflow')).toBe('true');
      expect(element.getAttribute('data-full-text')).toBe('desc');
    });

    it('should remove overflow attributes if no overflow', () => {
      component.hasDescriptionOverflow = false;
      component.video = { description: 'desc' } as any;
      const element = document.createElement('div');
      element.setAttribute('data-has-overflow', 'true');
      element.setAttribute('data-full-text', 'desc');
      (component as any).changeOverflowStyle(element);
      expect(element.getAttribute('data-has-overflow')).toBeNull();
      expect(element.getAttribute('data-full-text')).toBeNull();
    });
  });
});

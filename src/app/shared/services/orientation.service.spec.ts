import { TestBed } from '@angular/core/testing';

import { OrientationService } from './orientation.service';



describe('OrientationService', () => {
  let service: OrientationService;

  it('should be created', () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrientationService);
    expect(service).toBeTruthy();
  });

  it('should detect portrait mode', () => {
    spyOnProperty(window, 'innerHeight').and.returnValue(800);
    spyOnProperty(window, 'innerWidth').and.returnValue(400);
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrientationService);
    expect(service.isPortrait).toBeTrue();
    expect(service.isLandscape).toBeFalse();
  });

  it('should detect landscape mode', () => {
    spyOnProperty(window, 'innerHeight').and.returnValue(400);
    spyOnProperty(window, 'innerWidth').and.returnValue(800);
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrientationService);
    expect(service.isPortrait).toBeFalse();
    expect(service.isLandscape).toBeTrue();
  });

  it('should update isPortrait$ on orientationchange', () => {
    spyOnProperty(window, 'innerHeight').and.returnValue(900);
    spyOnProperty(window, 'innerWidth').and.returnValue(400);
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrientationService);
    let value: boolean | undefined;
    const sub = service.isPortrait$.subscribe(v => value = v);
    window.dispatchEvent(new Event('orientationchange'));
    expect(value).toBeTrue();
    sub.unsubscribe();
  });

  it('should update isPortrait$ on resize', () => {
    spyOnProperty(window, 'innerHeight').and.returnValue(400);
    spyOnProperty(window, 'innerWidth').and.returnValue(900);
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrientationService);
    let value: boolean | undefined;
    const sub = service.isPortrait$.subscribe(v => value = v);
    window.dispatchEvent(new Event('resize'));
    expect(value).toBeFalse();
    sub.unsubscribe();
  });
});

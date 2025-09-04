import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieComponent } from './movie.component';
import { ErrorService } from '../../../shared/services/error.service';

describe('MovieComponent', () => {
  let component: MovieComponent;
  let fixture: ComponentFixture<MovieComponent>;
  let errorService: jasmine.SpyObj<ErrorService>;

  beforeEach(async () => {
    errorService = jasmine.createSpyObj('ErrorService', ['show']);
    await TestBed.configureTestingModule({
      imports: [MovieComponent],
      providers: [
        { provide: ErrorService, useValue: errorService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieComponent);
    component = fixture.componentInstance;
    component.errorService = errorService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not set continueWatching if video is null', () => {
    component.video = null;
    component.ngOnInit();
    expect(component.continueWatching).toBeFalse();
    expect(component.progressPercentage).toBe(0);
  });

  it('should set continueWatching and progressPercentage if progress > 2', () => {
    const video = { id: 1 } as any;
    const profile = { videoProgress: [{ id: 1, progressPercentage: 50 }] };
    component.video = video;
    component.api = { CurrentProfile: profile } as any;
    component.ngOnInit();
    expect(component.continueWatching).toBeTrue();
    expect(component.progressPercentage).toBe(50);
  });

  it('should not set continueWatching if progress <= 2', () => {
    const video = { id: 1 } as any;
    const profile = { videoProgress: [{ id: 1, progressPercentage: 2 }] };
    component.video = video;
    component.api = { CurrentProfile: profile } as any;
    component.ngOnInit();
    expect(component.continueWatching).toBeFalse();
    expect(component.progressPercentage).toBe(0);
  });

  it('should not set continueWatching if no progress found', () => {
    const video = { id: 1 } as any;
    const profile = { videoProgress: [{ id: 2, progressPercentage: 50 }] };
    component.video = video;
    component.api = { CurrentProfile: profile } as any;
    component.ngOnInit();
    expect(component.continueWatching).toBeFalse();
    expect(component.progressPercentage).toBe(0);
  });

  it('should emit videoSelected on video click', () => {
    const video = { id: 1 } as any;
    component.video = video;
    spyOn(component.videoSelected, 'emit');
    component.onVideoClick();
    expect(component.videoSelected.emit).toHaveBeenCalledWith(video);
  });

  it('should show error if no video on click', () => {
    component.video = null;
    component.onVideoClick();
    expect(errorService.show).toHaveBeenCalledWith('No video selected');
  });
});

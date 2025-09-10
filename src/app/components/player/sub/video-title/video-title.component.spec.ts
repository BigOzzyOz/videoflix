import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoTitleComponent } from './video-title.component';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

describe('VideoTitleComponent', () => {
  let component: VideoTitleComponent;
  let fixture: ComponentFixture<VideoTitleComponent>;
  let playerStateSpy: jasmine.SpyObj<PlayerStateService>;

  beforeEach(async () => {
    playerStateSpy = jasmine.createSpyObj('PlayerStateService', ['title']);

    await TestBed.configureTestingModule({
      imports: [VideoTitleComponent],
      providers: [
        { provide: PlayerStateService, useValue: playerStateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VideoTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('videoTitle getter should return value from PlayerStateService', () => {
    playerStateSpy.title.and.returnValue('Test Title');
    expect(component.videoTitle).toBe('Test Title');
  });
});

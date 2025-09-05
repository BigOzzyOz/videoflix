import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayButtonComponent } from './play-button.component';
import { PlayerService } from '../../../../shared/services/player.service';
import { PlayerStateService } from '../../../../shared/services/player-state.service';

describe('PlayButtonComponent', () => {
  let component: PlayButtonComponent;
  let fixture: ComponentFixture<PlayButtonComponent>;
  let playerServiceSpy: jasmine.SpyObj<PlayerService>;
  let playerStateServiceSpy: jasmine.SpyObj<PlayerStateService>;

  beforeEach(async () => {
    playerServiceSpy = jasmine.createSpyObj('PlayerService', ['togglePlay']);
    playerStateServiceSpy = jasmine.createSpyObj('PlayerStateService', ['isPlaying']);

    await TestBed.configureTestingModule({
      imports: [PlayButtonComponent],
      providers: [
        { provide: PlayerService, useValue: playerServiceSpy },
        { provide: PlayerStateService, useValue: playerStateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call togglePlay on PlayerService when onTogglePlay is called', () => {
    component.onTogglePlay();
    expect(playerServiceSpy.togglePlay).toHaveBeenCalled();
  });

  it('isPlaying should return value from PlayerStateService', () => {
    playerStateServiceSpy.isPlaying.and.returnValue(true);
    expect(component.isPlaying).toBeTrue();
    playerStateServiceSpy.isPlaying.and.returnValue(false);
    expect(component.isPlaying).toBeFalse();
  });
});

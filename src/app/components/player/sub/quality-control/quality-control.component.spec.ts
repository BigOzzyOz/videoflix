import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QualityControlComponent } from './quality-control.component';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { PlayerService } from '../../../../shared/services/player.service';

describe('QualityControlComponent', () => {
  let component: QualityControlComponent;
  let fixture: ComponentFixture<QualityControlComponent>;
  let playerState: jasmine.SpyObj<PlayerStateService>;
  let playerService: jasmine.SpyObj<PlayerService>;

  beforeEach(async () => {
    playerState = jasmine.createSpyObj('PlayerStateService', [
      'availableQualities',
      'currentQuality',
      'setCurrentQuality',
      'showQualityMenu',
      'setShowQualityMenu'
    ]);
    playerService = jasmine.createSpyObj('PlayerService', ['setQuality']);

    await TestBed.configureTestingModule({
      imports: [QualityControlComponent],
      providers: [
        { provide: PlayerStateService, useValue: playerState },
        { provide: PlayerService, useValue: playerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QualityControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setQuality and setCurrentQuality on select', () => {
    playerState.setCurrentQuality.and.stub();
    playerState.setShowQualityMenu.and.stub();
    playerService.setQuality.and.stub();

    component.onSelectQuality('720p');
    expect(playerService.setQuality).toHaveBeenCalledWith('720p');
    expect(playerState.setCurrentQuality).toHaveBeenCalledWith('720p');
    expect(playerState.setShowQualityMenu).toHaveBeenCalledWith(false);
  });

  it('should stop event propagation on container click', () => {
    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');
    component.onContainerClick(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});

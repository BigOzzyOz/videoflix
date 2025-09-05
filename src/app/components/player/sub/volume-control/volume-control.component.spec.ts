import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VolumeControlComponent } from './volume-control.component';
import { PlayerStateService } from '../../../../shared/services/player-state.service';
import { VolumeService } from '../../../../shared/services/volume.service';

describe('VolumeControlComponent', () => {
  let component: VolumeControlComponent;
  let fixture: ComponentFixture<VolumeControlComponent>;
  let playerStateSpy: jasmine.SpyObj<PlayerStateService>;
  let volumeServiceSpy: jasmine.SpyObj<VolumeService>;

  beforeEach(async () => {
    playerStateSpy = jasmine.createSpyObj('PlayerStateService', [
      'setShowVolumeControl', 'setShowVolumeTooltip', 'volume', 'isMuted', 'showVolumeControl', 'setVolumeTooltipPosition', 'showVolumeTooltip'
    ]);
    playerStateSpy.volume.and.returnValue(0.5);
    playerStateSpy.isMuted.and.returnValue(false);
    playerStateSpy.showVolumeControl.and.returnValue(false);
    playerStateSpy.showVolumeTooltip.and.returnValue(false);
    volumeServiceSpy = jasmine.createSpyObj('VolumeService', ['toggleSound', 'setVolume']);

    await TestBed.configureTestingModule({
      imports: [VolumeControlComponent],
      providers: [
        { provide: PlayerStateService, useValue: playerStateSpy },
        { provide: VolumeService, useValue: volumeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VolumeControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setShowVolumeControl and hideVolumeControlDelayed on onTouchStart', () => {
    spyOn(component, 'hideVolumeControlDelayed');
    component.onTouchStart();
    expect(playerStateSpy.setShowVolumeControl).toHaveBeenCalledWith(true);
    expect(component.hideVolumeControlDelayed).toHaveBeenCalled();
  });

  it('should call toggleSound and setShowVolumeControl on onToggleSound', () => {
    component.onToggleSound();
    expect(volumeServiceSpy.toggleSound).toHaveBeenCalled();
    expect(playerStateSpy.setShowVolumeControl).toHaveBeenCalledWith(true);
  });

  it('volume getter should return value from PlayerStateService', () => {
    playerStateSpy.volume.and.returnValue(0.5);
    expect(component.volume).toBe(0.5);
  });

  it('isMuted getter should return value from PlayerStateService', () => {
    playerStateSpy.isMuted.and.returnValue(true);
    expect(component.isMuted).toBeTrue();
    playerStateSpy.isMuted.and.returnValue(false);
    expect(component.isMuted).toBeFalse();
  });

  it('showVolumeControl getter should return value from PlayerStateService', () => {
    playerStateSpy.showVolumeControl.and.returnValue(true);
    expect(component.showVolumeControl).toBeTrue();
    playerStateSpy.showVolumeControl.and.returnValue(false);
    expect(component.showVolumeControl).toBeFalse();
  });

  it('volumePercentage getter should return correct percentage', () => {
    playerStateSpy.volume.and.returnValue(0.75);
    expect(component.volumePercentage).toBe(75);
  });

  it('should set volume and show/hide tooltip on setVolumeFromClick', () => {
    const event = {
      target: { classList: { contains: () => false } },
      currentTarget: { getBoundingClientRect: () => ({ top: 0, height: 100 }) },
      clientY: 50
    } as any;
    spyOn(component as any, 'setVolumeAndUpdate');
    component.setVolumeFromClick(event);
    expect((component as any).setVolumeAndUpdate).toHaveBeenCalled();
    expect(playerStateSpy.setShowVolumeTooltip).toHaveBeenCalledWith(true);
  });

  it('should set volume and show/hide tooltip on setVolumeFromTouch', () => {
    const event = {
      touches: [{ clientY: 50 }],
      currentTarget: { getBoundingClientRect: () => ({ top: 0, height: 100 }) }
    } as any;
    spyOn(component as any, 'setVolumeAndUpdate');
    component.setVolumeFromTouch(event);
    expect((component as any).setVolumeAndUpdate).toHaveBeenCalled();
    expect(playerStateSpy.setShowVolumeTooltip).toHaveBeenCalledWith(true);
  });

  it('should start drag and update state on startVolumeDrag (mouse)', () => {
    const handle = document.createElement('div');
    handle.classList.add('volume-handle');
    const track = document.createElement('div');
    track.classList.add('volume-track');
    track.appendChild(handle);
    document.body.appendChild(track);
    const event = {
      preventDefault: jasmine.createSpy(),
      stopPropagation: jasmine.createSpy(),
      type: 'mousedown',
      target: handle
    } as any;
    spyOn(handle, 'closest').and.returnValue(track);
    spyOn(track, 'getBoundingClientRect').and.returnValue({
      top: 0,
      height: 100,
      width: 100,
      x: 0,
      y: 0,
      bottom: 100,
      left: 0,
      right: 100,
      toJSON: () => ({})
    });
    spyOn(handle.classList, 'add');
    spyOn(component as any, 'handleMouseDrag');
    component.startVolumeDrag(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(handle.classList.add).toHaveBeenCalledWith('dragging');
    expect((component as any).handleMouseDrag).toHaveBeenCalled();
    document.body.removeChild(track);
  });

  it('should start drag and update state on startVolumeDrag (touch)', () => {
    const handle = document.createElement('div');
    handle.classList.add('volume-handle');
    const track = document.createElement('div');
    track.classList.add('volume-track');
    track.appendChild(handle);
    document.body.appendChild(track);
    const event = {
      preventDefault: jasmine.createSpy(),
      stopPropagation: jasmine.createSpy(),
      type: 'touchstart',
      target: handle
    } as any;
    spyOn(handle, 'closest').and.returnValue(track);
    spyOn(track, 'getBoundingClientRect').and.returnValue({
      top: 0,
      height: 100,
      width: 100,
      x: 0,
      y: 0,
      bottom: 100,
      left: 0,
      right: 100,
      toJSON: () => ({})
    });
    spyOn(handle.classList, 'add');
    spyOn(component as any, 'handleTouchDrag');
    component.startVolumeDrag(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(handle.classList.add).toHaveBeenCalledWith('dragging');
    expect((component as any).handleTouchDrag).toHaveBeenCalled();
    document.body.removeChild(track);
  });

  it('should call setVolumeTooltipPosition and setShowVolumeTooltip on updateVolumeTooltip', () => {
    const event = {
      currentTarget: { getBoundingClientRect: () => ({ top: 0 }) },
      clientY: 42
    } as any;
    component.updateVolumeTooltip(event);
    expect(playerStateSpy.setVolumeTooltipPosition).toHaveBeenCalledWith(42);
    expect(playerStateSpy.setShowVolumeTooltip).toHaveBeenCalledWith(true);
  });

  it('should call setShowVolumeTooltip(false) on hideVolumeTooltip', () => {
    component.hideVolumeTooltip();
    expect(playerStateSpy.setShowVolumeTooltip).toHaveBeenCalledWith(false);
  });

  it('should call setShowVolumeControl(true) and clearVolumeHideTimeout on onVolumeContainerEnter', () => {
    spyOn(component, 'clearVolumeHideTimeout');
    component.onVolumeContainerEnter();
    expect(playerStateSpy.setShowVolumeControl).toHaveBeenCalledWith(true);
    expect(component.clearVolumeHideTimeout).toHaveBeenCalled();
  });

  it('should call hideVolumeControlDelayed on onVolumeContainerLeave if not dragging', () => {
    spyOn(component, 'hideVolumeControlDelayed');
    (component as any).isDragging = false;
    component.onVolumeContainerLeave();
    expect(component.hideVolumeControlDelayed).toHaveBeenCalled();
  });

  it('should not call hideVolumeControlDelayed on onVolumeContainerLeave if dragging', () => {
    spyOn(component, 'hideVolumeControlDelayed');
    (component as any).isDragging = true;
    component.onVolumeContainerLeave();
    expect(component.hideVolumeControlDelayed).not.toHaveBeenCalled();
  });

  it('should call setShowVolumeControl(true) on onTouchStartSlider', () => {
    component.onTouchStartSlider();
    expect(playerStateSpy.setShowVolumeControl).toHaveBeenCalledWith(true);
  });

  it('should call Renderer2.setStyle for setVolumeProgress and setVolumeHandlePosition', () => {
    const volumeProgress = document.createElement('div');
    volumeProgress.classList.add('volume-progress');
    document.body.appendChild(volumeProgress);
    const volumeHandle = document.createElement('div');
    volumeHandle.classList.add('volume-handle');
    document.body.appendChild(volumeHandle);
    const rendererSpy = spyOn(component.renderer, 'setStyle');
    component.setVolumeProgress(10, 2);
    component.setVolumeHandlePosition(5);
    expect(rendererSpy).toHaveBeenCalledWith(jasmine.objectContaining({ className: 'volume-progress' }), 'height', '10rem');
    expect(rendererSpy).toHaveBeenCalledWith(jasmine.objectContaining({ className: 'volume-progress' }), 'bottom', '2rem');
    expect(rendererSpy).toHaveBeenCalledWith(jasmine.objectContaining({ className: 'volume-handle' }), 'bottom', '5rem');
    expect(rendererSpy).toHaveBeenCalledTimes(3);
    document.body.removeChild(volumeProgress);
    document.body.removeChild(volumeHandle);
  });
});

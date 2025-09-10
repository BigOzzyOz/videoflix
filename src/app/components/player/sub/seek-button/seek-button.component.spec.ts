import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeekButtonComponent } from './seek-button.component';
import { SeekService } from '../../../../shared/services/seek.service';

describe('SeekButtonComponent', () => {
  let component: SeekButtonComponent;
  let fixture: ComponentFixture<SeekButtonComponent>;
  let seekServiceSpy: jasmine.SpyObj<SeekService>;

  beforeEach(async () => {
    seekServiceSpy = jasmine.createSpyObj('SeekService', ['seekBy']);

    await TestBed.configureTestingModule({
      imports: [SeekButtonComponent],
      providers: [
        { provide: SeekService, useValue: seekServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SeekButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call seekBy with positive seconds when direction is forward', () => {
    component.direction = 'forward';
    component.seconds = 15;
    component.onSeek();
    expect(seekServiceSpy.seekBy).toHaveBeenCalledWith(15);
  });

  it('should call seekBy with negative seconds when direction is back', () => {
    component.direction = 'back';
    component.seconds = 7;
    component.onSeek();
    expect(seekServiceSpy.seekBy).toHaveBeenCalledWith(-7);
  });

  it('buttonClass should return correct class for forward', () => {
    component.direction = 'forward';
    expect(component.buttonClass).toBe('vjs-seek-forward');
  });

  it('buttonClass should return correct class for back', () => {
    component.direction = 'back';
    expect(component.buttonClass).toBe('vjs-seek-back');
  });
});

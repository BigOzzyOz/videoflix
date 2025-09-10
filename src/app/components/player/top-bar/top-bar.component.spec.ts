import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBarComponent } from './top-bar.component';
import { NavigationService } from '../../../shared/services/navigation.service';
import { PlayerStateService } from '../../../shared/services/player-state.service';

describe('TopBarComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;
  let navigationServiceSpy: jasmine.SpyObj<NavigationService>;
  let playerStateServiceSpy: jasmine.SpyObj<PlayerStateService>;

  beforeEach(async () => {
    navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['goBack']);
    playerStateServiceSpy = jasmine.createSpyObj('PlayerStateService', ['isOptimizing', 'title']);
    playerStateServiceSpy.title.and.returnValue('Test Title');

    await TestBed.configureTestingModule({
      imports: [TopBarComponent],
      providers: [
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: PlayerStateService, useValue: playerStateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call goBack on NavigationService when goBack() is called', () => {
    component.goBack();
    expect(navigationServiceSpy.goBack).toHaveBeenCalled();
  });

  it('isOptimizing should return value from PlayerStateService', () => {
    playerStateServiceSpy.isOptimizing.and.returnValue(true);
    expect(component.isOptimizing).toBeTrue();
    playerStateServiceSpy.isOptimizing.and.returnValue(false);
    expect(component.isOptimizing).toBeFalse();
  });
});

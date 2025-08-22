import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ErrorDialogComponent } from './error-dialog.component';
import { ErrorService } from '../../../services/error.service';

describe('ErrorDialogComponent', () => {
  let component: ErrorDialogComponent;
  let fixture: ComponentFixture<ErrorDialogComponent>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let errorMessage$: BehaviorSubject<string | null>;

  beforeEach(async () => {
    errorMessage$ = new BehaviorSubject<string | null>(null);
    const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['clear'], {
      errorMessage$: errorMessage$.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ErrorDialogComponent],
      providers: [
        { provide: ErrorService, useValue: errorServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ErrorDialogComponent);
    component = fixture.componentInstance;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null error message', () => {
    expect(component.errorMessage()).toBeNull();
  });

  it('should display error dialog when error message exists', () => {
    errorMessage$.next('Test error message');
    fixture.detectChanges();

    const errorDialog = fixture.nativeElement.querySelector('.error-dialog');
    const errorText = fixture.nativeElement.querySelector('p');

    expect(errorDialog).toBeTruthy();
    expect(errorText?.textContent).toBe('Test error message');
  });

  it('should not display error dialog when no error message', () => {
    errorMessage$.next(null);
    fixture.detectChanges();

    const errorDialog = fixture.nativeElement.querySelector('.error-dialog');
    expect(errorDialog).toBeFalsy();
  });

  it('should call errorService.clear() when hide() is called', () => {
    component.hide();

    expect(errorService.clear).toHaveBeenCalled();
  });

  it('should hide dialog when close button is clicked', () => {
    errorMessage$.next('Test error');
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.error-dialog__button');
    closeButton.click();

    expect(errorService.clear).toHaveBeenCalled();
  });

  it('should hide dialog when X icon is clicked', () => {
    spyOn(component, 'hide');
    errorMessage$.next('Test error');
    fixture.detectChanges();

    const closeIcon = fixture.nativeElement.querySelector('.error-dialog__close');
    const clickEvent = new Event('click');
    closeIcon.dispatchEvent(clickEvent);

    expect(component.hide).toHaveBeenCalled();
  });

  it('should update error message when errorService emits new value', () => {
    errorMessage$.next('First error');
    fixture.detectChanges();
    expect(component.errorMessage()).toBe('First error');

    errorMessage$.next('Second error');
    fixture.detectChanges();
    expect(component.errorMessage()).toBe('Second error');
  });
});

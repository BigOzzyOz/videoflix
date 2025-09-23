import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { DialogService } from '../../../services/dialog.service';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogService: jasmine.SpyObj<DialogService>;

  beforeEach(async () => {
    dialogService = jasmine.createSpyObj('DialogService', ['confirmDialogResponse']);

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: DialogService, useValue: dialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call confirmDialogResponse(true) on confirm', () => {
    component.onConfirm();
    expect(dialogService.confirmDialogResponse).toHaveBeenCalledWith(true);
  });

  it('should call confirmDialogResponse(false) on cancel', () => {
    component.onCancel();
    expect(dialogService.confirmDialogResponse).toHaveBeenCalledWith(false);
  });
});

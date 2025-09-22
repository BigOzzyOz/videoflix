import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DialogService } from '../../../services/dialog.service';


@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  standalone: true,
  imports: [AsyncPipe]
})
export class ConfirmDialogComponent {
  dialogService = inject(DialogService);

  constructor() { }

  onConfirm() {
    this.dialogService.confirmDialogResponse(true);
  }

  onCancel() {
    this.dialogService.confirmDialogResponse(false);
  }
}

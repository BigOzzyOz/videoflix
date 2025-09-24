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

  /**
   * Called when the user confirms the action.
   * Resolves the confirm dialog promise with true.
   */
  onConfirm() {
    this.dialogService.confirmDialogResponse(true);
  }

  /**
   * Called when the user cancels the action or clicks outside the dialog.
   * Resolves the confirm dialog promise with false.
   */
  onCancel() {
    this.dialogService.confirmDialogResponse(false);
  }
}

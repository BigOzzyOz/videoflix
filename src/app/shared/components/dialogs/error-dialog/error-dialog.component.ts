import { Component, inject } from '@angular/core';
import { ErrorService } from '../../../services/error.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-error-dialog',
  imports: [],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss'
})
/**
 * Dialog component for displaying error messages. Listens to ErrorService and provides UI to hide errors.
 */
export class ErrorDialogComponent {
  errorService = inject(ErrorService);
  errorMessage = toSignal(this.errorService.errorMessage$, { initialValue: null });

  /**
   * Creates the error dialog component.
   */
  constructor() { }

  /**
   * Hides the error dialog by clearing the error message in the service.
   */
  hide(): void {
    this.errorService.clear();
  }
}

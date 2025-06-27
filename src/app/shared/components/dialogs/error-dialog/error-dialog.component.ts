import { Component, inject } from '@angular/core';
import { ErrorService } from '../../../services/error.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-error-dialog',
  imports: [],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss'
})
export class ErrorDialogComponent {
  errorService = inject(ErrorService);
  errorMessage = toSignal(this.errorService.errorMessage$, { initialValue: null });


  constructor() { }

  hide() {
    this.errorService.clear();
  }

}

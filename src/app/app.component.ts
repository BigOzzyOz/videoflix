import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorDialogComponent } from "./shared/components/dialogs/error-dialog/error-dialog.component";
import { ProfileSelectionComponent } from "./shared/components/dialogs/profile-selection/profile-selection.component";
import { LoadingComponent } from './shared/components/loading/loading.component';
import { ConfirmDialogComponent } from "./shared/components/dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorDialogComponent, ProfileSelectionComponent, LoadingComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
/**
 * The root component for the Videoflix app.
 * Renders the router outlet and global dialogs.
 */
export class AppComponent {
  title = 'Videoflix';
}

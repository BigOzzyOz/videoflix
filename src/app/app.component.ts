import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorDialogComponent } from "./shared/components/dialogs/error-dialog/error-dialog.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ErrorDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Videoflix';
}

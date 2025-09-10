import { Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
/**
 * LoadingComponent displays a loading spinner when the application is in a loading state.
 * It uses LoadingService to determine visibility.
 */
export class LoadingComponent {
  loadingService = inject(LoadingService);
}

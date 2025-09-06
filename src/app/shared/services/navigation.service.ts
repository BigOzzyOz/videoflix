import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
/**
 * Service for handling navigation actions in the application.
 */
export class NavigationService {
  private router = inject(Router);

  constructor() { }

  /**
   * Navigates back to the main page.
   */
  goBack(): void {
    this.router.navigate(['/main']);
  }
}

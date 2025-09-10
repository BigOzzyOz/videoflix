import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-four-o-four',
  imports: [],
  templateUrl: './four-o-four.component.html',
  styleUrl: './four-o-four.component.scss'
})
/**
 * FourOFourComponent displays a 404 error page with a button to navigate back to the landing page.
 */
export class FourOFourComponent {
  private router = inject(Router);

  /**
   * Navigates to the landing page.
   */
  toLanding() {
    this.router.navigate(['/landing']);
  }
}

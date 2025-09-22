import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
/**
 * FooterComponent displays the application footer with navigation links to privacy policy and imprint.
 * It provides methods to open these pages in a new browser tab.
 */
export class FooterComponent {
  private router = inject(Router);

  /**
   * Opens the privacy policy page in a new browser tab.
   */
  toPrivacyPolicy(): void {
    this.router.navigate(['/privacy'], { queryParams: { subSite: 'privacy' } });
  }

  /**
   * Opens the imprint page in a new browser tab.
   */
  toImprint(): void {
    this.router.navigate(['/imprint'], { queryParams: { subSite: 'imprint' } });
  }
}

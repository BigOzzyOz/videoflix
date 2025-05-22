import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  private router = inject(Router);

  toPrivacyPolicy() {
    const targetTree = this.router.createUrlTree(['/privacy'], {
      queryParams: { subSite: 'privacy' }
    });
    const targetUrl = this.router.serializeUrl(targetTree);
    window.open(targetUrl, '_blank');
  }

  toImprint() {
    const targetTree = this.router.createUrlTree(['/imprint'], {
      queryParams: { subSite: 'imprint' }
    });
    const targetUrl = this.router.serializeUrl(targetTree);
    window.open(targetUrl, '_blank');
  }
}

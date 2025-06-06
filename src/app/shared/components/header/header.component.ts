import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() loginButton: Boolean = false;
  @Input() logoutButton: Boolean = false;
  @Input() backArrow: Boolean = false;
  @Input() responsiveLogo: Boolean = false;
  @Input() shortLogo: Boolean = false;
  @Input() longLogo: Boolean = false;
  private router = inject(Router);

  constructor() { }

  toLogin() {
    this.router.navigate(['/login']);
  }

  goBack() {
    this.router.navigate(['/']);
  }

}

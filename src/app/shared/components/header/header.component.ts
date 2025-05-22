import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() loginButton: Boolean = true;
  @Input() longLogo: Boolean = true;
  private router = inject(Router);

  constructor() { }

  toLogin() {
    this.router.navigate(['/login']);
  }

}

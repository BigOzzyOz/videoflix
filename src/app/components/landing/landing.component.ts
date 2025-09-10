import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { Router } from '@angular/router';
import { OrientationWarningComponent } from '../../shared/components/orientation-warning/orientation-warning.component';
import { LoadingService } from '../../shared/services/loading.service';

@Component({
  selector: 'app-landing',
  imports: [HeaderComponent, FooterComponent, FormsModule, OrientationWarningComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
/**
 * LandingComponent
 *
 * Displays the landing page where users can enter their email and sign up.
 * Handles background styling, navigation, and loading state.
 */
export class LandingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private renderer = inject(Renderer2);
  loadingService = inject(LoadingService);

  /**
   * The email address entered by the user.
   */
  mailInput: string = '';

  /**
   * Constructor: Disables loading since the landing page should be shown immediately.
   */
  constructor() {
    this.loadingService.setLoading(false);
  }

  /**
   * Lifecycle hook: Adds the CSS class for the landing page background when initialized.
   */
  ngOnInit() {
    this.renderer.addClass(document.body, 'landing-bg');
  }

  /**
   * Lifecycle hook: Removes the CSS class for the landing page background when destroyed.
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'landing-bg');
  }

  /**
   * Navigates to the registration page and passes the entered email as a query parameter.
   */
  toSignup() {
    this.router.navigate(['/register'], {
      queryParams: { email: this.mailInput }
    });
  }

}

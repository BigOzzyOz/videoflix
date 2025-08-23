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
export class LandingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private loadingService = inject(LoadingService);

  mailInput: string = '';

  constructor() {
    this.loadingService.setLoading(false);
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'landing-bg');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'landing-bg');
  }

  toSignup() {
    this.router.navigate(['/register'], {
      queryParams: { email: this.mailInput }
    });
  }

}

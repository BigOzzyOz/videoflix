import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  imports: [HeaderComponent, FooterComponent, FormsModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private renderer = inject(Renderer2);

  mailInput: string = '';

  constructor() { }

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

import { Component, inject } from '@angular/core';
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
export class LandingComponent {
  private router = inject(Router);

  mailInput: string = '';

  constructor() { }

  toSignup() {
    this.router.navigate(['/register'], {
      queryParams: { email: this.mailInput }
    });
  }

}

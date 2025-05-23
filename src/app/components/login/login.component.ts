import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isVisible: boolean = false;
  constructor() { }
  toggleVisibility() {
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    this.isVisible = !this.isVisible;
    if (passwordInput) {
      passwordInput.type = this.isVisible ? 'text' : 'password';
    }
  }


}

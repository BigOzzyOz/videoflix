import { Component } from '@angular/core';
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { HeaderComponent } from "../../shared/components/header/header.component";
import { PasswordInputComponent } from "../../shared/components/input-elements/password-input/password-input.component";

@Component({
  selector: 'app-password-reset',
  imports: [FooterComponent, HeaderComponent, PasswordInputComponent],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent {
  passwordVerify: boolean = false;
  passwordReset: boolean = false;
  passwordForget: boolean = false;


  constructor() { }

  toggleVisibility() { }

}

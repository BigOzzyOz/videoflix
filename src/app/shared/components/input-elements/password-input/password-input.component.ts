import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  imports: [ReactiveFormsModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss'
})
export class PasswordInputComponent {
  @ViewChild('passwordInput') passwordInput: ElementRef | undefined;
  @Input() placeholder: string = 'Password';
  @Input() password!: FormControl;

  isVisible: boolean = false;

  constructor() { }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    if (this.passwordInput) {
      const inputElement = this.passwordInput.nativeElement;
      inputElement.type = this.isVisible ? 'text' : 'password';
    }
  }
}

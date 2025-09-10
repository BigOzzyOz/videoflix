import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  imports: [ReactiveFormsModule],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.scss'
})
/**
 * PasswordInputComponent provides a styled password input field with visibility toggle and validation error display.
 * It binds to a FormControl and supports a customizable placeholder.
 */
export class PasswordInputComponent {
  @ViewChild('passwordInput') passwordInput: ElementRef | undefined;
  @Input() placeholder: string = 'Password';
  @Input() password!: FormControl;

  isVisible: boolean = false;

  constructor() { }

  /**
   * Toggles the visibility of the password input field between plain text and masked.
   */
  toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    if (this.passwordInput) {
      const inputElement = this.passwordInput.nativeElement;
      inputElement.type = this.isVisible ? 'text' : 'password';
    }
  }
}

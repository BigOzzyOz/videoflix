import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-input',
  imports: [ReactiveFormsModule],
  templateUrl: './email-input.component.html',
  styleUrl: './email-input.component.scss'
})
/**
 * EmailInputComponent provides a styled email input field with validation and error display.
 * It binds to a FormControl and supports a customizable placeholder.
 */
export class EmailInputComponent {
  @Input() placeholder: string = 'Email Address';
  @Input() email!: FormControl;


}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private activeRoute = inject(ActivatedRoute);

  email: string = '';
  constructor() {
    this.activeRoute.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }



}

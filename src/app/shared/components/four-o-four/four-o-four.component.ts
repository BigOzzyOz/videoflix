import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-four-o-four',
  imports: [],
  templateUrl: './four-o-four.component.html',
  styleUrl: './four-o-four.component.scss'
})
export class FourOFourComponent {
  private router = inject(Router);

  toLanding() {
    this.router.navigate(['/landing']);
  }
}

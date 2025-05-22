import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-legal-notice',
  imports: [],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
  private activeRoute = inject(ActivatedRoute);

  subSite: string = '';
  constructor() {
    this.activeRoute.queryParams.subscribe(params => {
      this.subSite = params['subSite'] || '';
    }
    );
  }

}

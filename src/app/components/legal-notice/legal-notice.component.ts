import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

@Component({
  selector: 'app-legal-notice',
  imports: [HeaderComponent, FooterComponent],
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

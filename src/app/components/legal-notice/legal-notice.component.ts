import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

@Component({
  selector: 'app-legal-notice',
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent implements OnInit, OnDestroy {
  private activeRoute = inject(ActivatedRoute);
  private renderer = inject(Renderer2);

  subSite: string = '';
  constructor() {
    this.activeRoute.queryParams.subscribe(params => {
      this.subSite = params['subSite'] || '';
    }
    );
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'legal-notice-bg');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'legal-notice-bg');
  }

}

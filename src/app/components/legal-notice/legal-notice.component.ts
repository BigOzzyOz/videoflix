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
/**
 * LegalNoticeComponent
 *
 * Displays legal information such as site notice or privacy policy based on the query parameter.
 * Handles background styling and reads the 'subSite' parameter from the URL.
 */
export class LegalNoticeComponent implements OnInit, OnDestroy {
  private activeRoute = inject(ActivatedRoute);
  private renderer = inject(Renderer2);

  /**
   * The currently selected sub-site (e.g. 'imprint', 'privacy').
   */
  subSite: string = '';
  /**
   * Constructor: Subscribes to query parameters and sets the subSite value.
   */
  constructor() {
    this.activeRoute.queryParams.subscribe(params => {
      this.subSite = params['subSite'] || '';
    }
    );
  }

  /**
   * Lifecycle hook: Adds the CSS class for the legal notice background when initialized.
   */
  ngOnInit() {
    this.renderer.addClass(document.body, 'legal-notice-bg');
  }

  /**
   * Lifecycle hook: Removes the CSS class for the legal notice background when destroyed.
   */
  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'legal-notice-bg');
  }

}

import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";
import { FeaturedComponent } from "./featured/featured.component";

@Component({
  selector: 'app-main',
  imports: [HeaderComponent, FooterComponent, FeaturedComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  private renderer = inject(Renderer2);

  constructor() { }

  ngOnInit() {
    this.renderer.addClass(document.body, 'main-bg');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'main-bg');
  }

}

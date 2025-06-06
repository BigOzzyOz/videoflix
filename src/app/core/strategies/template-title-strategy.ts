import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TemplatePageTitleStrategy extends TitleStrategy {
    private readonly title = inject(Title);

    override updateTitle(routerState: RouterStateSnapshot): void {
        const title = this.buildTitle(routerState);
        if (title !== undefined) {
            this.title.setTitle(`Videoflix | ${title}`);
        }
        else {
            this.title.setTitle('Videoflix');
        }
    }
}

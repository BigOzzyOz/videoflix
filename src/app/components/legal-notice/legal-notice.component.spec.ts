import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { LegalNoticeComponent } from './legal-notice.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

describe('LegalNoticeComponent', () => {
  let component: LegalNoticeComponent;
  let fixture: ComponentFixture<LegalNoticeComponent>;

  beforeEach(async () => {
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: of({ subSite: '' })
    });

    await TestBed.configureTestingModule({
      imports: [LegalNoticeComponent, HeaderComponent, FooterComponent],
      providers: [{ provide: ActivatedRoute, useValue: routeSpy }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LegalNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty subSite', () => {
    expect(component.subSite).toBe('');
  });

  it('should render header and footer components', () => {
    const header = fixture.debugElement.query(By.directive(HeaderComponent));
    const footer = fixture.debugElement.query(By.directive(FooterComponent));

    expect(header).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should display imprint content when subSite is imprint', () => {
    component.subSite = 'imprint';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title?.textContent).toBe('Site Notice');
  });

  it('should display privacy policy when subSite is privacy', () => {
    component.subSite = 'privacy';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title?.textContent).toBe('Privacy Policy');
  });

  it('should not display any content when subSite is empty', () => {
    component.subSite = '';
    fixture.detectChanges();

    // Keine h1 sollte vorhanden sein
    const title = fixture.nativeElement.querySelector('h1');
    expect(title).toBeNull();

    // Section sollte leer sein (nur header/footer)
    const sectionContent = fixture.nativeElement.querySelector('section.legal-notice');
    expect(sectionContent?.textContent?.trim()).toBe('');
  });

  it('should not display any content for unknown subSite', () => {
    component.subSite = 'unknown';
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('h1');
    expect(title).toBeNull();

    const sectionContent = fixture.nativeElement.querySelector('section.legal-notice');
    expect(sectionContent?.textContent?.trim()).toBe('');
  });

  it('should add legal-notice-bg class to body on init and remove on destroy', () => {
    const renderer = (component as any).renderer;
    spyOn(renderer, 'addClass').and.callThrough();
    spyOn(renderer, 'removeClass').and.callThrough();

    component.ngOnInit();
    expect(renderer.addClass).toHaveBeenCalledWith(document.body, 'legal-notice-bg');

    component.ngOnDestroy();
    expect(renderer.removeClass).toHaveBeenCalledWith(document.body, 'legal-notice-bg');
  });
});

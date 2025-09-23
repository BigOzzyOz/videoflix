import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    spyOn(window, 'open');

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render footer links and copyright', () => {
    const privacyLink = fixture.nativeElement.querySelector('a:first-child');
    const imprintLink = fixture.nativeElement.querySelector('a:last-child');
    const copyright = fixture.nativeElement.querySelector('p');

    expect(privacyLink?.textContent).toBe('Privacy Policy');
    expect(imprintLink?.textContent).toBe('Site Notice');
    expect(copyright?.textContent).toBe('© 2025 Jan Holtschke');
  });

  it('should trigger privacy policy navigation when link is clicked', () => {
    spyOn(component, 'toPrivacyPolicy');
    const privacyLink = fixture.nativeElement.querySelector('a:first-child');

    privacyLink.click();

    expect(component.toPrivacyPolicy).toHaveBeenCalled();
  });

  it('should trigger imprint navigation when link is clicked', () => {
    spyOn(component, 'toImprint');
    const imprintLink = fixture.nativeElement.querySelector('a:last-child');

    imprintLink.click();

    expect(component.toImprint).toHaveBeenCalled();
  });

  it('should navigate to privacy policy when clicked', () => {
    component.toPrivacyPolicy();
    expect(router.navigate).toHaveBeenCalledWith(['/privacy'], {
      queryParams: { subSite: 'privacy' }
    });
  });

  it('should navigate to imprint when clicked', () => {
    component.toImprint();
    expect(router.navigate).toHaveBeenCalledWith(['/imprint'], {
      queryParams: { subSite: 'imprint' }
    });
  });
});

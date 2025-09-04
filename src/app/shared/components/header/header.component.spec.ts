import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default input values', () => {
    expect(component.loginButton).toBe(false);
    expect(component.logoutButton).toBe(false);
    expect(component.backArrow).toBe(false);
    expect(component.responsiveLogo).toBe(false);
    expect(component.shortLogo).toBe(false);
    expect(component.longLogo).toBe(false);
  });

  it('should display responsive logo when responsiveLogo is true', () => {
    component.responsiveLogo = true;
    fixture.detectChanges();

    const picture = fixture.nativeElement.querySelector('picture');
    const img = fixture.nativeElement.querySelector('img');

    expect(picture).toBeTruthy();
    expect(img?.src).toContain('logo_great.png');
    expect(img?.alt).toBe('Logo great');
  });

  it('should display short logo when shortLogo is true', () => {
    component.shortLogo = true;
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img?.src).toContain('logo.png');
    expect(img?.alt).toBe('Logo');
  });

  it('should display long logo when longLogo is true', () => {
    component.longLogo = true;
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img?.src).toContain('logo_great.png');
    expect(img?.alt).toBe('Logo great');
  });

  it('should display login button when loginButton is true', () => {
    component.loginButton = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.login-button');
    expect(button?.textContent).toBe('Log In');
  });

  it('should display logout text when logoutButton is true', () => {
    component.logoutButton = true;
    fixture.detectChanges();

    const logoutDiv = fixture.nativeElement.querySelector('div:last-child');
    const displayedText = logoutDiv?.textContent;
    expect(displayedText.trim()).toBe('Log Out');
  });

  it('should display back arrow when backArrow is true', () => {
    component.backArrow = true;
    fixture.detectChanges();

    const backArrow = fixture.nativeElement.querySelector('.header__back_arrow');
    expect(backArrow).toBeTruthy();
  });

  it('should navigate to login when toLogin is called', () => {
    component.toLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to home when goBack is called', () => {
    component.goBack();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should trigger login navigation when login button is clicked', () => {
    component.loginButton = true;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.login-button');
    button.click();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should trigger back navigation when back arrow is clicked', () => {
    component.backArrow = true;
    fixture.detectChanges();

    const backArrow = fixture.nativeElement.querySelector('.header__back_arrow');

    const clickEvent = new Event('click');
    backArrow.dispatchEvent(clickEvent);

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});

import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
    {
        path: 'landing',
        component: LandingComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Register',
    },
    {
        path: 'imprint',
        component: LegalNoticeComponent,
        title: 'Imprint',
    },
    {
        path: 'privacy',
        component: LegalNoticeComponent,
        title: 'Privacy Policy',
    },
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    },
];

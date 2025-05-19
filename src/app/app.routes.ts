import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
    {
        path: 'landing',
        component: LandingComponent,
        data: {
            title: 'Videoflix'
        }
    },
    {
        path: 'login',
        component: LoginComponent,
        data: {
            title: 'Videoflix Login'
        }
    },
    {
        path: 'register',
        component: RegisterComponent,
        data: {
            title: 'Videoflix Register'
        }
    },
    {
        path: 'imprint',
        component: LegalNoticeComponent,
        data: {
            title: 'Videoflix Imprint'
        }
    },
    {
        path: 'privacy',
        component: LegalNoticeComponent,
        data: {
            title: 'Videoflix Privacy Policy'
        }
    },
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    },
];

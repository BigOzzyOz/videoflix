import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';
import { ApiResponse } from '../models/api-response';
import { User } from '../models/user';
import { Profile } from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private router = inject(Router);
  private errorService = inject(ErrorService);
  BASE_URL: string = 'http://localhost:8000/api';
  LOGIN_URL: string = `${this.BASE_URL}/users/login/`;
  LOGOUT_URL: string = `${this.BASE_URL}/users/logout/`;
  REGISTER_URL: string = `${this.BASE_URL}/users/register/`;
  VERIFY_URL: string = `${this.BASE_URL}/users/verify-email/`;
  RESET_URL: string = `${this.BASE_URL}/users/password-reset/`;
  RESET_CONFIRM_URL: string = `${this.BASE_URL}/users/password-reset/confirm/`;

  access_token: string | null = null;
  refresh_token: string | null = null;
  currentUser: User | null = null;
  currentProfile: Profile | null = null;

  constructor() { }

  createHeaders(method: string): RequestInit {
    const headers = new Headers();
    const apiMethod = method.toUpperCase();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this.AccessToken) {
      headers.append('Authorization', `Bearer ${this.AccessToken}`);
    }

    return {
      method: apiMethod,
      headers: headers,
      credentials: 'include' as RequestCredentials,
    };
  }

  async fetchData(url: string, method: string, body?: Object): Promise<ApiResponse> {
    let options = this.createPayload(method, body);
    try {
      let response = await fetch(url, options);
      if (response.status === 401 && this.RefreshToken !== null) {
        const tokenResponse: ApiResponse = await this.refreshToken();
        if (!tokenResponse.ok || tokenResponse.data === null) {
          this.errorService.show('Session expired. Please log in again.');
          return this.logout();
        }
        this.AccessToken = tokenResponse.data['access'];
        options = this.createPayload(method, body);
        response = await fetch(url, options);
      }
      const responseData = await ApiResponse.create(response);
      return responseData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  createPayload(method: string, body?: any) {
    const options = this.createHeaders(method);
    if (body) {
      options.body = JSON.stringify(body);
    }
    return options;
  }

  get CurrentUser(): User {
    return this.currentUser || new User(JSON.parse(sessionStorage.getItem('currentUser') || 'null'));
  }

  set CurrentUser(user: User | null) {
    this.currentUser = user ? new User(user) : null;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  get Profile(): Profile {
    return this.currentProfile || new Profile(JSON.parse(sessionStorage.getItem('currentProfile') || 'null'));
  }

  set Profile(profile: Profile | null) {
    this.currentProfile = profile ? new Profile(profile) : null;
    sessionStorage.setItem('currentProfile', JSON.stringify(profile));
  }

  set AccessToken(token: string | null) {
    if (!token) {
      sessionStorage.removeItem('token');
      this.access_token = null;
      return;
    }
    this.access_token = token;
    sessionStorage.setItem('token', token);
  }

  get AccessToken(): string | null {
    return this.access_token || sessionStorage.getItem('token');

  }
  set RefreshToken(token: string | null) {
    if (!token) {
      sessionStorage.removeItem('refresh_token');
      this.refresh_token = null;
      return;
    }
    this.refresh_token = token;
    sessionStorage.setItem('refresh_token', token);
  }

  get RefreshToken(): string | null {
    return this.refresh_token || sessionStorage.getItem('refresh_token');
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const body = { username: email, password: password };
    return await this.fetchData(this.LOGIN_URL, 'POST', body);
  }

  async register(email: string, password: string, repeatPassword: string): Promise<ApiResponse> {
    const body = { email: email, password: password, password2: repeatPassword };
    return await this.fetchData(this.REGISTER_URL, 'POST', body);
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const url = `${this.VERIFY_URL}${token}/`;
    return await this.fetchData(url, 'GET');
  }

  async resetPassword(email: string): Promise<ApiResponse> {
    const body = { email: email };
    return await this.fetchData(this.RESET_URL, 'POST', body);
  }

  async resetPasswordConfirm(token: string, password: string, confirmedPassword?: string): Promise<ApiResponse> {
    const body = { token: token, new_password: password, new_password2: confirmedPassword };
    return await this.fetchData(this.RESET_CONFIRM_URL, 'POST', body);
  }

  async logout(): Promise<ApiResponse> {
    this.AccessToken = null;
    this.RefreshToken = null;
    this.CurrentUser = null;
    sessionStorage.clear();
    this.router.navigate(['/']);
    const apiResponse = await this.fetchData(this.LOGOUT_URL, 'POST');
    return apiResponse;
  }

  async refreshToken(): Promise<ApiResponse> {
    this.AccessToken = null;
    const body = { refresh_token: this.refreshToken };
    return await this.fetchData(this.LOGIN_URL, 'POST', body);
  }

}

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
  REFRESH_URL: string = `${this.BASE_URL}/token/refresh/`;
  RESET_URL: string = `${this.BASE_URL}/users/password-reset/`;
  RESET_CONFIRM_URL: string = `${this.BASE_URL}/users/password-reset/confirm/`;
  GENRES_COUNT_URL: string = `${this.BASE_URL}/videos/genre-count/`;
  VIDEOS_URL: string = `${this.BASE_URL}/videos/`;
  PROGRESS_UPDATE_URL(profileId: string, videoFileId: string) {
    return `${this.BASE_URL}/users/me/profiles/${profileId}/progress/${videoFileId}/update/`;
  }


  access_token: string | null = null;
  refresh_token: string | null = null;
  currentUser: User | null = null;
  currentProfile: Profile | null = null;

  constructor() {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      this.access_token = storedToken;
    }
    const storedRefreshToken = sessionStorage.getItem('refresh_token');
    if (storedRefreshToken) {
      this.refresh_token = storedRefreshToken;
    }
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = new User(JSON.parse(storedUser));
    }
    const storedProfile = sessionStorage.getItem('currentProfile');
    if (storedProfile) {
      this.currentProfile = new Profile(JSON.parse(storedProfile));
    }
  }

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
        this.AccessToken = null;
        const tokenResponse: ApiResponse = await this.refreshToken();
        if (!tokenResponse.ok || tokenResponse.data === null) {
          this.errorService.show('Session expired. Please log in again.');
          return this.logout();
        }
        this.AccessToken = tokenResponse.data['access'];
        options = this.createPayload(method, body);
        response = await fetch(url, options);
      }

      if (response.status === 204 || response.status === 205 || !response.headers.get('content-length') || response.headers.get('content-length') === '0') {
        return new ApiResponse(response.ok, response.status, null);
      }

      const responseData = await ApiResponse.create(response);
      return responseData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  private async directFetch(url: string, method: string, body?: Object): Promise<ApiResponse> {
    const options = this.createPayload(method, body);
    try {
      const response = await fetch(url, options);
      return await ApiResponse.create(response);
    } catch (error) {
      console.error('Error in directFetch:', error);
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

  get CurrentProfile(): Profile {
    return this.currentProfile || new Profile(JSON.parse(sessionStorage.getItem('currentProfile') || 'null'));
  }

  set CurrentProfile(profile: Profile | null) {
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
    const body = { refresh_token: this.RefreshToken };
    try {
      const response = await this.directFetch(this.LOGOUT_URL, 'POST', body);
      if (!response.ok) {
        this.errorService.show('Logout failed. Please try again.');
        return response;
      }
      this.AccessToken = null;
      this.RefreshToken = null;
      this.CurrentUser = null;
      this.CurrentProfile = null;
      sessionStorage.clear();
      this.router.navigate(['/']);
      return response;
    } catch (error) {
      this.errorService.show('An error occurred while logging out. Please try again.');
      return new ApiResponse(false, 500, 'Logout failed due to an error.');
    }
  }

  async refreshToken(): Promise<ApiResponse> {
    this.AccessToken = null;
    const body = { refresh: this.RefreshToken };
    return await this.directFetch(this.REFRESH_URL, 'POST', body);
  }

  async getGenresCount(): Promise<ApiResponse> {
    const url = this.GENRES_COUNT_URL;
    return await this.fetchData(url, 'GET');
  }

  async getVideos(params: string): Promise<ApiResponse> {
    const url = params ? `${this.VIDEOS_URL}?${params}` : this.VIDEOS_URL;
    return await this.fetchData(url, 'GET');
  }

  async getVideoById(videoId: string): Promise<ApiResponse> {
    const url = `${this.VIDEOS_URL}${videoId}/`;
    return await this.fetchData(url, 'GET');
  }

  async updateVideoProgress(profileId: string, videoFileId: string, progress: number): Promise<ApiResponse> {
    const url = this.PROGRESS_UPDATE_URL(profileId, videoFileId);
    const body = { current_time: progress };
    return await this.fetchData(url, 'POST', body);
  }



}

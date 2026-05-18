import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface UserProfile {
  username: string;
  email: string;
  displayName: string;
  preferredCurrency: string;
}

export interface UserPreferences {
  preferredCurrency: string;
  theme: string;
  language: string;
  emailNotifications: boolean;
  budgetAlerts: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private apiUrl = '/api/settings';
  private userPreferencesSubject = new BehaviorSubject<UserPreferences | null>(null);
  public userPreferences$ = this.userPreferencesSubject.asObservable();

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  /**
   * 獲取用戶個人資料
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => this.userProfileSubject.next(profile))
    );
  }

  /**
   * 更新用戶個人資料
   */
  updateUserProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, profile).pipe(
      tap(updatedProfile => this.userProfileSubject.next(updatedProfile))
    );
  }

  /**
   * 修改密碼
   */
  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, request);
  }

  /**
   * 獲取用戶偏好設置
   */
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.apiUrl}/preferences`).pipe(
      tap(preferences => this.userPreferencesSubject.next(preferences))
    );
  }

  /**
   * 更新用戶偏好設置
   */
  updateUserPreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(`${this.apiUrl}/preferences`, preferences).pipe(
      tap(updatedPreferences => this.userPreferencesSubject.next(updatedPreferences))
    );
  }

  /**
   * 私有方法：加載偏好設置
   */
  private loadPreferences(): void {
    this.getUserPreferences().subscribe();
  }

  /**
   * 獲取當前偏好設置
   */
  getCurrentPreferences(): UserPreferences | null {
    return this.userPreferencesSubject.value;
  }

  /**
   * 獲取當前用戶資料
   */
  getCurrentProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }
}

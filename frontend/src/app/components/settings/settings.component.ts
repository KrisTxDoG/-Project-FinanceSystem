import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PreferencesService, UserProfile, UserPreferences } from '../../services/preferences.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  passwordForm!: FormGroup;

  userProfile: UserProfile | null = null;
  userPreferences: UserPreferences | null = null;

  activeTab: 'profile' | 'preferences' | 'password' = 'profile';
  
  loading = false;
  message: { type: 'success' | 'error'; text: string } | null = null;

  currencies = ['CNY', 'USD', 'EUR', 'JPY', 'GBP', 'HKD', 'TWD'];
  themes = [
    { value: 'light', label: '亮色模式' },
    { value: 'dark', label: '暗色模式' }
  ];
  languages = [
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'en-US', label: 'English' },
    { value: 'zh-CN', label: '簡體中文' }
  ];

  constructor(
    private fb: FormBuilder,
    private preferencesService: PreferencesService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserData();
  }

  /**
   * 初始化表單
   */
  private initializeForms(): void {
    this.profileForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.preferencesForm = this.fb.group({
      preferredCurrency: ['CNY', Validators.required],
      theme: ['light', Validators.required],
      language: ['zh-TW', Validators.required],
      emailNotifications: [true],
      budgetAlerts: [true]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * 加載用戶數據
   */
  private loadUserData(): void {
    this.loading = true;
    
    this.preferencesService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.profileForm.patchValue({
          displayName: profile.displayName,
          email: profile.email
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.showMessage('error', '無法加載個人資料');
        this.loading = false;
      }
    });

    this.preferencesService.getUserPreferences().subscribe({
      next: (preferences) => {
        this.userPreferences = preferences;
        this.preferencesForm.patchValue(preferences);
      },
      error: (error) => {
        console.error('Error loading preferences:', error);
      }
    });
  }

  /**
   * 更新個人資料
   */
  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.showMessage('error', '請檢查表單信息');
      return;
    }

    this.loading = true;
    this.preferencesService.updateUserProfile(this.profileForm.value).subscribe({
      next: () => {
        this.showMessage('success', '個人資料已更新');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        const errorMessage = error.error?.message || '更新失敗，請稍後重試';
        this.showMessage('error', errorMessage);
        this.loading = false;
      }
    });
  }

  /**
   * 修改密碼
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.showMessage('error', '請檢查密碼信息');
      return;
    }

    this.loading = true;
    this.preferencesService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.showMessage('success', '密碼已成功修改');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        const errorMessage = error.error?.message || '修改密碼失敗，請稍後重試';
        this.showMessage('error', errorMessage);
        this.loading = false;
      }
    });
  }

  /**
   * 更新偏好設置
   */
  updatePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.showMessage('error', '請檢查偏好設置');
      return;
    }

    this.loading = true;
    this.preferencesService.updateUserPreferences(this.preferencesForm.value).subscribe({
      next: (updatedPreferences) => {
        // 應用主題變化
        this.applyTheme(updatedPreferences.theme);
        this.showMessage('success', '偏好設置已更新');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating preferences:', error);
        const errorMessage = error.error?.message || '更新失敗，請稍後重試';
        this.showMessage('error', errorMessage);
        this.loading = false;
      }
    });
  }

  /**
   * 應用主題
   */
  private applyTheme(theme: string): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
    }
  }

  /**
   * 切換標籤
   */
  switchTab(tab: 'profile' | 'preferences' | 'password'): void {
    this.activeTab = tab;
    this.message = null;
  }

  /**
   * 顯示消息
   */
  private showMessage(type: 'success' | 'error', text: string): void {
    this.message = { type, text };
    setTimeout(() => {
      this.message = null;
    }, 3000);
  }

  /**
   * 自訂驗證器：密碼匹配檢查
   */
  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }
}

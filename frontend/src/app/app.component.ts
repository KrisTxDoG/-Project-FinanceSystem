import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CurrencyService, Currency } from './services/currency.service';
import { PreferencesService } from './services/preferences.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  currencies: Currency[] = [];
  selectedCurrency = 'CNY';
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private currencyService: CurrencyService,
    private preferencesService: PreferencesService
  ) {
    this.applyTheme();
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.loadCurrencies();
      this.loadPreferredCurrency();
      this.loadTheme();
    }

    // 監聽偏好設置變化
    this.preferencesService.userPreferences$.subscribe(preferences => {
      if (preferences) {
        this.isDarkMode = preferences.theme === 'dark';
        this.applyTheme();
      }
    });
  }

  loadCurrencies(): void {
    this.currencyService.getAllCurrencies().subscribe({
      next: (currencies) => {
        this.currencies = currencies;
      },
      error: (err) => console.error('Failed to load currencies', err)
    });
  }

  loadPreferredCurrency(): void {
    this.currencyService.getPreferredCurrency().subscribe({
      next: (response) => {
        this.selectedCurrency = response.currency;
      },
      error: (err) => console.error('Failed to load preferred currency', err)
    });
  }

  loadTheme(): void {
    this.preferencesService.getUserPreferences().subscribe({
      next: (preferences) => {
        this.isDarkMode = preferences.theme === 'dark';
        this.applyTheme();
      },
      error: (err) => console.error('Failed to load preferences', err)
    });
  }

  applyTheme(): void {
    const htmlElement = document.documentElement;
    if (this.isDarkMode) {
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.classList.remove('dark-mode');
    }
  }

  onCurrencyChange(): void {
    this.currencyService.setPreferredCurrency(this.selectedCurrency).subscribe({
      next: () => {
        console.log('Currency updated successfully');
      },
      error: (err) => console.error('Failed to update currency', err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

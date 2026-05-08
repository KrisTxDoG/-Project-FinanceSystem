import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CurrencyService, Currency } from './services/currency.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  currencies: Currency[] = [];
  selectedCurrency = 'CNY';

  constructor(
    private authService: AuthService,
    private router: Router,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.loadCurrencies();
      this.loadPreferredCurrency();
    }
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

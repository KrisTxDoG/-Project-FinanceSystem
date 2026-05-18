import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = '/api/currencies';
  private authApiUrl = '/api/auth';

  constructor(private http: HttpClient) { }

  getAllCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(this.apiUrl);
  }

  getCurrency(code: string): Observable<Currency> {
    return this.http.get<Currency>(`${this.apiUrl}/${code}`);
  }

  convertCurrency(amount: number, from: string, to: string): Observable<ConversionResult> {
    return this.http.post<ConversionResult>(`${this.apiUrl}/convert`, null, {
      params: {
        amount: amount.toString(),
        fromCurrency: from,
        toCurrency: to
      }
    });
  }

  setPreferredCurrency(currency: string): Observable<any> {
    return this.http.post(`${this.authApiUrl}/currency`, null, {
      params: { currency }
    });
  }

  getPreferredCurrency(): Observable<any> {
    return this.http.get(`${this.authApiUrl}/currency`);
  }
}

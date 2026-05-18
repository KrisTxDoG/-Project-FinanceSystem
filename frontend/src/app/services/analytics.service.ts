import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatisticsData {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  expenseByCategory: { [key: string]: number };
  monthlyTrend: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = '/api/transactions';

  constructor(private http: HttpClient) { }

  getStatistics(): Observable<StatisticsData> {
    return this.http.get<StatisticsData>(`${this.apiUrl}/statistics/all`);
  }

  getMonthlyStatistics(month: number, year: number): Observable<StatisticsData> {
    return this.http.get<StatisticsData>(`${this.apiUrl}/statistics/month?month=${month}&year=${year}`);
  }
}

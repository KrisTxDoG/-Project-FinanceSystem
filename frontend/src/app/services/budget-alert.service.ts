import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BudgetAlert {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: string; // 'safe', 'warning', 'exceeded'
}

@Injectable({
  providedIn: 'root'
})
export class BudgetAlertService {
  private apiUrl = '/api/budgets';

  constructor(private http: HttpClient) { }

  getBudgetAlerts(): Observable<BudgetAlert[]> {
    return this.http.get<BudgetAlert[]>(`${this.apiUrl}/alerts`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/index';

export interface CategoryDTO {
  value: string;
  label: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = '/api/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTransactionsByDateRange(start: Date, end: Date): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/date-range`, {
      params: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  }

  getTransactionsByCategory(category: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/category/${category}`);
  }

  getExpenseCategories(): Observable<CategoryDTO[]> {
    return this.http.get<CategoryDTO[]>(`${this.apiUrl}/categories`);
  }
}

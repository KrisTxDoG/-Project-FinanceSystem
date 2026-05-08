import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { BudgetService } from '../../services/budget.service';
import { Transaction, Budget } from '../../models/index';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  budgets: Budget[] = [];
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;

  expenseChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#ffffff'
      ]
    }]
  };

  expenseChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Expense by Category'
      }
    }
  };

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.calculateTotals();
        this.updateExpenseChart();
      },
      error: (err) => console.error('Failed to load transactions', err)
    });

    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
      },
      error: (err) => console.error('Failed to load budgets', err)
    });
  }

  calculateTotals(): void {
    this.totalIncome = 0;
    this.totalExpense = 0;

    this.transactions.forEach(t => {
      if (t.type === 'INCOME') {
        this.totalIncome += t.amount;
      } else {
        this.totalExpense += t.amount;
      }
    });

    this.balance = this.totalIncome - this.totalExpense;
  }

  updateExpenseChart(): void {
    const categoryMap = new Map<string, number>();

    this.transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    this.expenseChartData.labels = Array.from(categoryMap.keys());
    this.expenseChartData.datasets[0].data = Array.from(categoryMap.values());
  }
}

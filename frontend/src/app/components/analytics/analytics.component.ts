import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { AnalyticsService, StatisticsData } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  statistics: StatisticsData | null = null;
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();
  isLoading: boolean = false;

  // 圖表配置
  categoryChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {};

  monthlyChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  monthlyChartOptions: ChartConfiguration<'line'>['options'] = {};

  incomeExpenseChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  incomeExpenseChartOptions: ChartConfiguration<'bar'>['options'] = {};

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.analyticsService.getMonthlyStatistics(this.currentMonth, this.currentYear).subscribe({
      next: (data) => {
        this.statistics = data;
        this.initCharts();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load statistics', err);
        this.isLoading = false;
      }
    });
  }

  private initCharts(): void {
    if (!this.statistics) return;

    // 分類支出圖表
    this.initCategoryChart();
    // 月度趨勢圖表
    this.initMonthlyChart();
    // 收入支出對比圖表
    this.initIncomeExpenseChart();
  }

  private initCategoryChart(): void {
    if (!this.statistics) return;

    const categories: string[] = [];
    const amounts: number[] = [];
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#ffffff',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
      '#36A2EB', '#FFCE56'
    ];

    Object.entries(this.statistics.expenseByCategory).forEach(([category, amount]) => {
      if (amount > 0) {
        categories.push(this.getCategoryLabel(category));
        amounts.push(amount);
      }
    });

    this.categoryChartData = {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length),
          borderWidth: 1
        }
      ]
    };

    this.categoryChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        title: {
          display: true,
          text: '支出分類統計'
        }
      }
    };
  }

  private initMonthlyChart(): void {
    if (!this.statistics?.monthlyTrend) return;

    const labels: string[] = [];
    const data: number[] = [];

    Object.entries(this.statistics.monthlyTrend).forEach(([month, amount]) => {
      labels.push(month);
      data.push(amount);
    });

    this.monthlyChartData = {
      labels: labels,
      datasets: [
        {
          label: '月度支出',
          data: data,
          borderColor: '#FF6384',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };

    this.monthlyChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true
        },
        title: {
          display: true,
          text: '月度趨勢'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '¥' + value;
            }
          }
        }
      }
    };
  }

  private initIncomeExpenseChart(): void {
    if (!this.statistics) return;

    this.incomeExpenseChartData = {
      labels: ['收入', '支出'],
      datasets: [
        {
          label: '金額',
          data: [this.statistics.totalIncome, this.statistics.totalExpense],
          backgroundColor: ['#4BC0C0', '#FF6384'],
          borderColor: ['#4BC0C0', '#FF6384'],
          borderWidth: 1
        }
      ]
    };

    this.incomeExpenseChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: '收入支出對比'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '¥' + value;
            }
          }
        }
      }
    };
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 1) {
      this.currentMonth = 12;
      this.currentYear--;
    }
    this.loadStatistics();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 12) {
      this.currentMonth = 1;
      this.currentYear++;
    }
    this.loadStatistics();
  }

  private getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'DINING': '🍔 飲食',
      'TRANSPORTATION': '🚗 交通',
      'ENTERTAINMENT': '🎬 娛樂',
      'SHOPPING': '🛍️ 購物',
      'UTILITIES': '💡 水電費',
      'MEDICAL': '🏥 醫療',
      'EDUCATION': '📚 教育',
      'INSURANCE': '🛡️ 保險',
      'RENT': '🏠 房租',
      'SALARY': '💰 薪資',
      'INVESTMENT': '📈 投資',
      'OTHER': '🏷️ 其他'
    };
    return labels[category] || category;
  }
}

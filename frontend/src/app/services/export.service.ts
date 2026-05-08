import { Injectable } from '@angular/core';
import { Transaction } from '../models/index';

export interface ExportData {
  transactions: any[];
  exportDate: string;
  totalRecords: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() { }

  exportTransactionsToCSV(transactions: Transaction[], filename: string = 'transactions.csv'): void {
    if (transactions.length === 0) {
      alert('No data to export');
      return;
    }

    // 準備 CSV 標頭
    const headers = ['ID', '日期', '類型', '描述', '金額', '類別', '備註'];
    
    // 準備 CSV 行
    const rows = transactions.map(t => [
      t.id || '',
      this.formatDate(t.transactionDate),
      t.type,
      t.description,
      t.amount,
      t.category,
      t.notes || ''
    ]);

    // 轉換為 CSV 文本
    let csvContent = [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsvCell(cell)).join(','))
      .join('\n');

    // 添加 BOM 以支持 UTF-8 with BOM（Excel 中文支持）
    const BOM = '\uFEFF';
    csvContent = BOM + csvContent;

    // 建立 Blob 並下載
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, filename);
  }

  exportTransactionsToJSON(transactions: Transaction[], filename: string = 'transactions.json'): void {
    if (transactions.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData: ExportData = {
      transactions: transactions.map(t => ({
        id: t.id,
        date: new Date(t.transactionDate).toISOString(),
        type: t.type,
        description: t.description,
        amount: t.amount,
        category: t.category,
        notes: t.notes,
        createdAt: t.createdAt
      })),
      exportDate: new Date().toISOString(),
      totalRecords: transactions.length
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    this.downloadFile(blob, filename);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  private formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private escapeCsvCell(value: unknown): string {
    const cell = value == null ? '' : String(value);

    if (/[",\n\r]/.test(cell)) {
      return `"${cell.replace(/"/g, '""')}"`;
    }

    return cell;
  }

  // 生成數據備份報告
  generateBackupReport(transactions: Transaction[], budgets: any[]): string {
    const timestamp = new Date().toLocaleString('zh-CN');
    let report = `===== 個人財務系統 數據備份報告 =====\n`;
    report += `備份時間: ${timestamp}\n`;
    report += `\n【交易統計】\n`;
    report += `總交易數: ${transactions.length}\n`;
    
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    report += `總收入: ¥${income.toFixed(2)}\n`;
    report += `總支出: ¥${expense.toFixed(2)}\n`;
    report += `淨收入: ¥${(income - expense).toFixed(2)}\n`;
    
    report += `\n【預算統計】\n`;
    report += `設定預算數: ${budgets.length}\n`;
    
    if (budgets.length > 0) {
      report += `\n預算詳情:\n`;
      budgets.forEach(b => {
        report += `  - ${b.category}: ¥${b.limit}\n`;
      });
    }
    
    report += `\n===== 備份完成 =====\n`;
    return report;
  }

  downloadBackupReport(report: string, filename: string = 'backup-report.txt'): void {
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    this.downloadFile(blob, filename);
  }
}

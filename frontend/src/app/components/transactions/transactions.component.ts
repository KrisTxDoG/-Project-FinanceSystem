import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { ExportService } from '../../services/export.service';
import { Transaction } from '../../models/index';

interface ExpenseCategory {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  income: number;
  expense: number;
  count: number;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  @ViewChild('transactionFormSection') transactionFormSection?: ElementRef<HTMLElement>;
  @ViewChild('descriptionInput') descriptionInput?: ElementRef<HTMLInputElement>;

  transactions: Transaction[] = [];
  transactionForm: FormGroup;
  quickEntryForm: FormGroup;
  showForm = false;
  submitted = false;
  isSaving = false;
  formError = '';
  formMessage = '';
  editingId: number | null = null;
  showQuickEntry = true;
  currentMonth = new Date();
  selectedDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  expenseCategories: ExpenseCategory[] = [
    { value: 'FOOD', label: '🍔 飲食', icon: '🍔', color: '#ff6b6b' },
    { value: 'TRANSPORT', label: '🚗 交通', icon: '🚗', color: '#4ecdc4' },
    { value: 'ENTERTAINMENT', label: '🎬 娛樂', icon: '🎬', color: '#95e1d3' },
    { value: 'SHOPPING', label: '🛍️ 購物', icon: '🛍️', color: '#ffa07a' },
    { value: 'UTILITIES', label: '💡 水電費', icon: '💡', color: '#ffe66d' },
    { value: 'HEALTHCARE', label: '🏥 醫療', icon: '🏥', color: '#a8e6cf' },
    { value: 'EDUCATION', label: '📚 教育', icon: '📚', color: '#dda15e' },
    { value: 'INSURANCE', label: '🛡️ 保險', icon: '🛡️', color: '#ffffff' },
    { value: 'RENT', label: '🏠 房租', icon: '🏠', color: '#fb8500' },
    { value: 'SALARY', label: '💰 薪資', icon: '💰', color: '#06d6a0' },
    { value: 'INVESTMENT', label: '📈 投資', icon: '📈', color: '#118ab2' },
    { value: 'OTHER', label: '🏷️ 其他', icon: '🏷️', color: '#888' }
  ];

  incomeCategories: ExpenseCategory[] = [
    { value: 'SALARY', label: '💰 薪資', icon: '💰', color: '#06d6a0' },
    { value: 'INVESTMENT', label: '📈 投資', icon: '📈', color: '#118ab2' },
    { value: 'OTHER', label: '🏷️ 其他', icon: '🏷️', color: '#888' }
  ];

  get currentCategories(): ExpenseCategory[] {
    const type = this.transactionForm.get('type')?.value;
    return type === 'INCOME' ? this.incomeCategories : this.expenseCategories;
  }

  get selectedDateLabel(): string {
    return this.formatDisplayDate(this.selectedDate);
  }

  get currentMonthLabel(): string {
    return `${this.currentMonth.getFullYear()} 年 ${this.currentMonth.getMonth() + 1} 月`;
  }

  get selectedDateTransactions(): Transaction[] {
    return this.transactions
      .filter(transaction => this.isSameDate(new Date(transaction.transactionDate), this.selectedDate))
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  get selectedDateIncome(): number {
    return this.selectedDateTransactions
      .filter(transaction => transaction.type === 'INCOME')
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }

  get selectedDateExpense(): number {
    return this.selectedDateTransactions
      .filter(transaction => transaction.type === 'EXPENSE')
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }

  get selectedDateBalance(): number {
    return this.selectedDateIncome - this.selectedDateExpense;
  }

  get monthlyIncome(): number {
    return this.transactions
      .filter(transaction => this.isSameMonth(new Date(transaction.transactionDate), this.currentMonth))
      .filter(transaction => transaction.type === 'INCOME')
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }

  get monthlyExpense(): number {
    return this.transactions
      .filter(transaction => this.isSameMonth(new Date(transaction.transactionDate), this.currentMonth))
      .filter(transaction => transaction.type === 'EXPENSE')
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  }

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private exportService: ExportService
  ) {
    this.transactionForm = this.formBuilder.group({
      description: ['', Validators.required],
      type: ['EXPENSE', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      category: ['FOOD', Validators.required],
      notes: [''],
      transactionDate: [new Date().toISOString().split('T')[0], Validators.required]
    });

    this.quickEntryForm = this.formBuilder.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: [''],
      category: ['FOOD']
    });
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.buildCalendar();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.buildCalendar();
      },
      error: (err) => console.error('Failed to load transactions', err)
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.transactionForm.reset({
        type: 'EXPENSE',
        category: 'FOOD',
        transactionDate: this.toDateInputValue(this.selectedDate)
      });
      this.editingId = null;
      this.submitted = false;
      this.showQuickEntry = true;
      this.clearFormStatus();
    }
  }

  openTransactionForm(type: 'EXPENSE' | 'INCOME' = 'EXPENSE'): void {
    this.editingId = null;
    this.submitted = false;
    this.clearFormStatus();
    this.showForm = true;
    this.showQuickEntry = false;
    this.transactionForm.reset({
      description: '',
      type,
      amount: '',
      category: type === 'INCOME' ? 'SALARY' : 'FOOD',
      notes: '',
      transactionDate: this.toDateInputValue(this.selectedDate)
    });
    this.scrollToTransactionForm();
  }

  onTransactionTypeChange(): void {
    const type = this.transactionForm.get('type')?.value;
    const currentCategory = this.transactionForm.get('category')?.value;
    const availableCategories = this.currentCategories.map(category => category.value);

    if (!availableCategories.includes(currentCategory)) {
      this.transactionForm.patchValue({
        category: type === 'INCOME' ? 'SALARY' : 'FOOD'
      });
    }
  }

  quickAddExpense(category: ExpenseCategory): void {
    this.quickEntryForm.patchValue({
      category: category.value
    });
  }

  onSubmitQuickEntry(): void {
    if (this.quickEntryForm.invalid) {
      this.quickEntryForm.markAllAsTouched();
      return;
    }

    const formValue = this.quickEntryForm.value;
    const transaction: Transaction = {
      description: formValue.description || `${this.getCategoryLabel(formValue.category)}`,
      type: 'EXPENSE',
      amount: formValue.amount,
      category: formValue.category,
      notes: '',
      transactionDate: this.toApiDateTime(this.toDateInputValue(this.selectedDate))
    };

    this.transactionService.createTransaction(transaction).subscribe({
      next: () => {
        this.loadTransactions();
        this.quickEntryForm.reset({
          description: '',
          category: 'FOOD'
        });
      },
      error: (err) => console.error('Failed to create transaction', err)
    });
  }

  getCategoryLabel(value: string): string {
    const category = this.expenseCategories.find(c => c.value === value);
    return category ? category.label.split(' ').slice(1).join(' ') : value;
  }

  onSubmit(): void {
    this.submitted = true;
    this.clearFormStatus();
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      this.formError = '請先完成必填欄位，再送出交易。';
      this.focusFirstInvalidField();
      return;
    }

    const formValue = this.transactionForm.value;
    const transaction: Transaction = {
      ...formValue,
      amount: Number(formValue.amount),
      transactionDate: this.toApiDateTime(formValue.transactionDate)
    };

    this.isSaving = true;
    if (this.editingId) {
      this.transactionService.updateTransaction(this.editingId, transaction).subscribe({
        next: () => {
          this.loadTransactions();
          this.finishSuccessfulSave('交易已更新。');
          this.submitted = false;
        },
        error: (err) => this.handleSaveError(err, '更新交易失敗，請稍後再試。')
      });
    } else {
      this.transactionService.createTransaction(transaction).subscribe({
        next: () => {
          this.loadTransactions();
          this.finishSuccessfulSave('交易已新增。');
          this.submitted = false;
        },
        error: (err) => this.handleSaveError(err, '新增交易失敗，請稍後再試。')
      });
    }
  }

  editTransaction(transaction: Transaction): void {
    this.editingId = transaction.id || null;
    this.transactionForm.patchValue({
      ...transaction,
      transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0]
    });
    this.showForm = true;
    this.submitted = false;
    this.showQuickEntry = false;
    this.clearFormStatus();
    this.scrollToTransactionForm();
  }

  deleteTransaction(id: number | undefined): void {
    if (id && confirm('確定要刪除嗎？')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => this.loadTransactions(),
        error: (err) => console.error('Failed to delete transaction', err)
      });
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentMonth = new Date();
    this.selectedDate = new Date();
    this.buildCalendar();
    this.patchSelectedDateToForm();
  }

  selectDate(day: CalendarDay): void {
    this.selectedDate = new Date(day.date);

    if (!day.isCurrentMonth) {
      this.currentMonth = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
    }

    this.buildCalendar();
    this.patchSelectedDateToForm();
  }

  getCategoryIcon(value: string): string {
    const category = [...this.expenseCategories, ...this.incomeCategories].find(item => item.value === value);
    return category?.icon || '🏷️';
  }

  private buildCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    this.calendarDays = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const dailyTransactions = this.transactions.filter(transaction =>
        this.isSameDate(new Date(transaction.transactionDate), date)
      );

      return {
        date,
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: this.isSameDate(date, new Date()),
        isSelected: this.isSameDate(date, this.selectedDate),
        income: dailyTransactions
          .filter(transaction => transaction.type === 'INCOME')
          .reduce((total, transaction) => total + Number(transaction.amount), 0),
        expense: dailyTransactions
          .filter(transaction => transaction.type === 'EXPENSE')
          .reduce((total, transaction) => total + Number(transaction.amount), 0),
        count: dailyTransactions.length
      };
    });
  }

  private patchSelectedDateToForm(): void {
    if (this.showForm) {
      this.transactionForm.patchValue({
        transactionDate: this.toDateInputValue(this.selectedDate)
      });
    }
  }

  private isSameDate(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate();
  }

  private isSameMonth(first: Date, second: Date): boolean {
    return first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth();
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toApiDateTime(dateInputValue: string): string {
    return `${dateInputValue}T12:00:00`;
  }

  private formatDisplayDate(date: Date): string {
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
  }

  private finishSuccessfulSave(message: string): void {
    this.isSaving = false;
    this.formMessage = message;
    this.showForm = false;
    this.showQuickEntry = true;
    this.editingId = null;
    this.transactionForm.reset({
      type: 'EXPENSE',
      category: 'FOOD',
      transactionDate: this.toDateInputValue(this.selectedDate)
    });
  }

  private handleSaveError(error: unknown, fallbackMessage: string): void {
    console.error(fallbackMessage, error);
    this.isSaving = false;
    const status = typeof error === 'object' && error && 'status' in error ? error.status : undefined;
    this.formError = status === 401 || status === 403
      ? '登入狀態已失效，請重新登入後再新增交易。'
      : fallbackMessage;
  }

  private clearFormStatus(): void {
    this.formError = '';
    this.formMessage = '';
    this.isSaving = false;
  }

  private focusFirstInvalidField(): void {
    setTimeout(() => {
      this.transactionFormSection?.nativeElement
        .querySelector<HTMLElement>('.is-invalid')
        ?.focus();
    });
  }

  private scrollToTransactionForm(): void {
    setTimeout(() => {
      this.transactionFormSection?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      this.descriptionInput?.nativeElement.focus();
    });
  }

  // 導出功能
  exportToCSV(): void {
    const filename = `transactions_${this.toDateInputValue(new Date())}.csv`;
    this.exportService.exportTransactionsToCSV(this.transactions, filename);
  }

  exportToJSON(): void {
    const filename = `transactions_${this.toDateInputValue(new Date())}.json`;
    this.exportService.exportTransactionsToJSON(this.transactions, filename);
  }

  exportSelectedDateToCSV(): void {
    const filename = `transactions_${this.toDateInputValue(this.selectedDate)}.csv`;
    this.exportService.exportTransactionsToCSV(this.selectedDateTransactions, filename);
  }

  exportMonthlyToCSV(): void {
    const monthlyTransactions = this.transactions.filter(t =>
      this.isSameMonth(new Date(t.transactionDate), this.currentMonth)
    );
    const monthYear = `${this.currentMonth.getFullYear()}-${String(this.currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const filename = `transactions_${monthYear}.csv`;
    this.exportService.exportTransactionsToCSV(monthlyTransactions, filename);
  }

  get f() { return this.transactionForm.controls; }
}

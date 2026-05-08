import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { BudgetAlertService, BudgetAlert } from '../../services/budget-alert.service';
import { Budget } from '../../models/index';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
  budgets: Budget[] = [];
  budgetAlerts: BudgetAlert[] = [];
  budgetForm: FormGroup;
  showForm = false;
  submitted = false;
  editingId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private budgetService: BudgetService,
    private budgetAlertService: BudgetAlertService
  ) {
    this.budgetForm = this.formBuilder.group({
      category: ['', Validators.required],
      limit: ['', [Validators.required, Validators.min(0)]],
      period: ['MONTHLY', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadBudgets();
    this.loadBudgetAlerts();
  }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
      },
      error: (err) => console.error('Failed to load budgets', err)
    });
  }

  loadBudgetAlerts(): void {
    this.budgetAlertService.getBudgetAlerts().subscribe({
      next: (alerts) => {
        this.budgetAlerts = alerts;
      },
      error: (err) => console.error('Failed to load budget alerts', err)
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.budgetForm.reset();
      this.editingId = null;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.budgetForm.invalid) {
      return;
    }

    const budget: Budget = this.budgetForm.value;

    if (this.editingId) {
      this.budgetService.updateBudget(this.editingId, budget).subscribe({
        next: () => {
          this.loadBudgets();
          this.loadBudgetAlerts();
          this.toggleForm();
          this.submitted = false;
        },
        error: (err) => console.error('Failed to update budget', err)
      });
    } else {
      this.budgetService.createBudget(budget).subscribe({
        next: () => {
          this.loadBudgets();
          this.loadBudgetAlerts();
          this.toggleForm();
          this.submitted = false;
        },
        error: (err) => console.error('Failed to create budget', err)
      });
    }
  }

  editBudget(budget: Budget): void {
    this.editingId = budget.id || null;
    this.budgetForm.patchValue(budget);
    this.showForm = true;
    this.submitted = false;
  }

  deleteBudget(id: number | undefined): void {
    if (id && confirm('Are you sure?')) {
      this.budgetService.deleteBudget(id).subscribe({
        next: () => {
          this.loadBudgets();
          this.loadBudgetAlerts();
        },
        error: (err) => console.error('Failed to delete budget', err)
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'safe':
        return 'safe';
      case 'warning':
        return 'warning';
      case 'exceeded':
        return 'exceeded';
      default:
        return '';
    }
  }

  get f() { return this.budgetForm.controls; }
}

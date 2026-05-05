import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/index';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {
  budgets: Budget[] = [];
  budgetForm: FormGroup;
  showForm = false;
  submitted = false;
  editingId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private budgetService: BudgetService
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
  }

  loadBudgets(): void {
    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
      },
      error: (err) => console.error('Failed to load budgets', err)
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
          this.toggleForm();
          this.submitted = false;
        },
        error: (err) => console.error('Failed to update budget', err)
      });
    } else {
      this.budgetService.createBudget(budget).subscribe({
        next: () => {
          this.loadBudgets();
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
        next: () => this.loadBudgets(),
        error: (err) => console.error('Failed to delete budget', err)
      });
    }
  }

  get f() { return this.budgetForm.controls; }
}

package com.financesystem.controller;

import com.financesystem.dto.BudgetDTO;
import com.financesystem.dto.BudgetAlertDTO;
import com.financesystem.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class BudgetController {
    @Autowired
    private BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetDTO> createBudget(@RequestBody BudgetDTO dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        BudgetDTO response = budgetService.createBudget(username, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<BudgetDTO> budgets = budgetService.getUserBudgets(username);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<BudgetAlertDTO>> getBudgetAlerts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<BudgetAlertDTO> alerts = budgetService.getBudgetAlerts(username);
        return ResponseEntity.ok(alerts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(
            @PathVariable Long id,
            @RequestBody BudgetDTO dto) {
        BudgetDTO response = budgetService.updateBudget(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok().build();
    }
}

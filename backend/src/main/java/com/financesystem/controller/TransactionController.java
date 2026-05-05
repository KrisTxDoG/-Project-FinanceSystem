package com.financesystem.controller;

import com.financesystem.dto.TransactionDTO;
import com.financesystem.entity.ExpenseCategory;
import com.financesystem.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionDTO dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        TransactionDTO response = transactionService.createTransaction(username, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<TransactionDTO> transactions = transactionService.getUserTransactions(username);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getExpenseCategories() {
        List<CategoryDTO> categories = Arrays.stream(ExpenseCategory.values())
                .map(category -> new CategoryDTO(
                        category.name(),
                        category.getDisplayName(),
                        category.getIcon()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<TransactionDTO> transactions = transactionService.getTransactionsByDateRange(username, start, end);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByCategory(@PathVariable String category) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<TransactionDTO> transactions = transactionService.getTransactionsByCategory(username, category);
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionDTO dto) {
        TransactionDTO response = transactionService.updateTransaction(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }

    public static class CategoryDTO {
        private String value;
        private String label;
        private String icon;

        public CategoryDTO(String value, String label, String icon) {
            this.value = value;
            this.label = label;
            this.icon = icon;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }
    }
}

package com.financesystem.service;

import com.financesystem.dto.BudgetDTO;
import com.financesystem.dto.BudgetAlertDTO;
import com.financesystem.entity.Budget;
import com.financesystem.entity.User;
import com.financesystem.entity.Transaction;
import com.financesystem.entity.TransactionType;
import com.financesystem.repository.BudgetRepository;
import com.financesystem.repository.UserRepository;
import com.financesystem.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public BudgetDTO createBudget(String username, BudgetDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(dto.getCategory());
        budget.setLimit(dto.getLimit());
        budget.setPeriod(dto.getPeriod());
        budget.setDescription(dto.getDescription());

        budgetRepository.save(budget);

        return convertToDTO(budget);
    }

    public List<BudgetDTO> getUserBudgets(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return budgetRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BudgetDTO updateBudget(Long id, BudgetDTO dto) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        budget.setCategory(dto.getCategory());
        budget.setLimit(dto.getLimit());
        budget.setPeriod(dto.getPeriod());
        budget.setDescription(dto.getDescription());

        budgetRepository.save(budget);

        return convertToDTO(budget);
    }

    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    public List<BudgetAlertDTO> getBudgetAlerts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Budget> budgets = budgetRepository.findByUser(user);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime monthEnd = now.plusMonths(1).withDayOfMonth(1).minusSeconds(1);

        return budgets.stream()
                .map(budget -> {
                    BigDecimal spent = calculateSpentAmount(user, budget.getCategory(), monthStart, monthEnd);
                    BigDecimal remaining = budget.getLimit().subtract(spent);
                    double percentage = spent.doubleValue() / budget.getLimit().doubleValue() * 100;
                    String status = "safe";
                    if (percentage >= 100) {
                        status = "exceeded";
                    } else if (percentage >= 80) {
                        status = "warning";
                    }

                    return new BudgetAlertDTO(
                            budget.getCategory(),
                            budget.getLimit(),
                            spent,
                            remaining,
                            percentage,
                            status
                    );
                })
                .collect(Collectors.toList());
    }

    private BigDecimal calculateSpentAmount(User user, String category, LocalDateTime start, LocalDateTime end) {
        List<Transaction> transactions = transactionRepository.findByUserAndTransactionDateBetween(user, start, end);
        return transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE && t.getCategory().name().equals(category))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BudgetDTO convertToDTO(Budget budget) {
        return new BudgetDTO(
                budget.getId(),
                budget.getCategory(),
                budget.getLimit(),
                budget.getPeriod(),
                budget.getDescription()
        );
    }
}

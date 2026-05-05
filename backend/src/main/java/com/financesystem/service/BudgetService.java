package com.financesystem.service;

import com.financesystem.dto.BudgetDTO;
import com.financesystem.entity.Budget;
import com.financesystem.entity.User;
import com.financesystem.repository.BudgetRepository;
import com.financesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {
    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

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

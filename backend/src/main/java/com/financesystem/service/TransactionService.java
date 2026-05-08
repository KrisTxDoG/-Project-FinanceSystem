package com.financesystem.service;

import com.financesystem.dto.TransactionDTO;
import com.financesystem.dto.StatisticsDTO;
import com.financesystem.entity.ExpenseCategory;
import com.financesystem.entity.Transaction;
import com.financesystem.entity.TransactionType;
import com.financesystem.entity.User;
import com.financesystem.repository.TransactionRepository;
import com.financesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public TransactionDTO createTransaction(String username, TransactionDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setDescription(dto.getDescription());
        transaction.setType(TransactionType.valueOf(dto.getType()));
        transaction.setAmount(dto.getAmount());
        
        // 將 category 字符串轉換為 ExpenseCategory 枚舉
        try {
            transaction.setCategory(ExpenseCategory.valueOf(dto.getCategory()));
        } catch (IllegalArgumentException e) {
            // 如果無法識別的類別，設置為 OTHER
            transaction.setCategory(ExpenseCategory.OTHER);
        }
        
        transaction.setNotes(dto.getNotes());
        transaction.setTransactionDate(dto.getTransactionDate());

        transactionRepository.save(transaction);

        return convertToDTO(transaction);
    }

    public List<TransactionDTO> getUserTransactions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> getTransactionsByDateRange(String username, LocalDateTime start, LocalDateTime end) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUserAndTransactionDateBetween(user, start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TransactionDTO> getTransactionsByCategory(String username, String category) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            ExpenseCategory expenseCategory = ExpenseCategory.valueOf(category);
            return transactionRepository.findByUserAndCategory(user, expenseCategory).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    public TransactionDTO updateTransaction(Long id, TransactionDTO dto) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setDescription(dto.getDescription());
        transaction.setAmount(dto.getAmount());
        
        try {
            transaction.setCategory(ExpenseCategory.valueOf(dto.getCategory()));
        } catch (IllegalArgumentException e) {
            transaction.setCategory(ExpenseCategory.OTHER);
        }
        
        transaction.setNotes(dto.getNotes());
        transaction.setTransactionDate(dto.getTransactionDate());

        transactionRepository.save(transaction);

        return convertToDTO(transaction);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getType().toString(),
                transaction.getAmount(),
                transaction.getCategory().name(),
                transaction.getNotes(),
                transaction.getTransactionDate(),
                transaction.getCreatedAt()
        );
    }

    public StatisticsDTO getStatistics(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUser(user);
        
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        Map<String, BigDecimal> monthlyTrend = new LinkedHashMap<>();

        // 初始化所有類別
        for (ExpenseCategory category : ExpenseCategory.values()) {
            expenseByCategory.put(category.name(), BigDecimal.ZERO);
        }

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpense = totalExpense.add(t.getAmount());
                // 按類別統計支出
                expenseByCategory.put(t.getCategory().name(), 
                    expenseByCategory.get(t.getCategory().name()).add(t.getAmount()));
            }

            // 按月份統計
            YearMonth month = YearMonth.from(t.getTransactionDate());
            String monthKey = month.toString();
            monthlyTrend.put(monthKey, monthlyTrend.getOrDefault(monthKey, BigDecimal.ZERO).add(t.getAmount()));
        }

        StatisticsDTO stats = new StatisticsDTO();
        stats.setTotalIncome(totalIncome);
        stats.setTotalExpense(totalExpense);
        stats.setNetIncome(totalIncome.subtract(totalExpense));
        stats.setExpenseByCategory(expenseByCategory);
        stats.setMonthlyTrend(monthlyTrend);

        return stats;
    }

    public StatisticsDTO getStatisticsForMonthYear(String username, int month, int year) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime startDate = LocalDateTime.of(year, month, 1, 0, 0, 0);
        LocalDateTime endDate = startDate.plusMonths(1).minusSeconds(1);

        List<Transaction> transactions = transactionRepository.findByUserAndTransactionDateBetween(user, startDate, endDate);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();

        // 初始化所有類別
        for (ExpenseCategory category : ExpenseCategory.values()) {
            expenseByCategory.put(category.name(), BigDecimal.ZERO);
        }

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpense = totalExpense.add(t.getAmount());
                expenseByCategory.put(t.getCategory().name(),
                    expenseByCategory.get(t.getCategory().name()).add(t.getAmount()));
            }
        }

        StatisticsDTO stats = new StatisticsDTO();
        stats.setTotalIncome(totalIncome);
        stats.setTotalExpense(totalExpense);
        stats.setNetIncome(totalIncome.subtract(totalExpense));
        stats.setExpenseByCategory(expenseByCategory);

        return stats;
    }
}

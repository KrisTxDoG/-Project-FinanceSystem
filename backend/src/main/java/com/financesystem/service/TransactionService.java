package com.financesystem.service;

import com.financesystem.dto.TransactionDTO;
import com.financesystem.entity.ExpenseCategory;
import com.financesystem.entity.Transaction;
import com.financesystem.entity.TransactionType;
import com.financesystem.entity.User;
import com.financesystem.repository.TransactionRepository;
import com.financesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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
}

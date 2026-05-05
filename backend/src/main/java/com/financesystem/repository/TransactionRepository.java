package com.financesystem.repository;

import com.financesystem.entity.ExpenseCategory;
import com.financesystem.entity.Transaction;
import com.financesystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    List<Transaction> findByUserAndTransactionDateBetween(User user, LocalDateTime start, LocalDateTime end);
    List<Transaction> findByUserAndCategory(User user, ExpenseCategory category);
}

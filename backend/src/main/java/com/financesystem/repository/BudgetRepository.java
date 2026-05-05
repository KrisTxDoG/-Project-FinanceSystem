package com.financesystem.repository;

import com.financesystem.entity.Budget;
import com.financesystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    Budget findByUserAndCategory(User user, String category);
}

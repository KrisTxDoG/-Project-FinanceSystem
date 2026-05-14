package com.financesystem.repository;

import com.financesystem.entity.UserPreferences;
import com.financesystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
    Optional<UserPreferences> findByUser(User user);
    Optional<UserPreferences> findByUserId(Long userId);
}

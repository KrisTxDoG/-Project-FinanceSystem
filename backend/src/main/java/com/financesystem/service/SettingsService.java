package com.financesystem.service;

import com.financesystem.dto.ChangePasswordRequest;
import com.financesystem.dto.UserPreferencesDTO;
import com.financesystem.dto.UserProfileDTO;
import com.financesystem.entity.User;
import com.financesystem.entity.UserPreferences;
import com.financesystem.repository.UserRepository;
import com.financesystem.repository.UserPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 獲取用戶個人資料
     */
    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDTO profile = new UserProfileDTO();
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setDisplayName(user.getDisplayName());
        profile.setPreferredCurrency(user.getPreferredCurrency());
        return profile;
    }

    /**
     * 更新用戶個人資料
     */
    @Transactional
    public UserProfileDTO updateUserProfile(String username, String displayName, String email) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 檢查 email 是否已被其他用戶使用
        if (email != null && !email.equals(user.getEmail())) {
            if (userRepository.findByEmail(email).isPresent()) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(email);
        }

        if (displayName != null && !displayName.isEmpty()) {
            user.setDisplayName(displayName);
        }

        userRepository.save(user);

        UserProfileDTO profile = new UserProfileDTO();
        profile.setUsername(user.getUsername());
        profile.setEmail(user.getEmail());
        profile.setDisplayName(user.getDisplayName());
        profile.setPreferredCurrency(user.getPreferredCurrency());
        return profile;
    }

    /**
     * 修改密碼
     */
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * 獲取用戶偏好設置
     */
    public UserPreferencesDTO getUserPreferences(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreferences preferences = userPreferencesRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));

        return convertToDTO(preferences);
    }

    /**
     * 更新用戶偏好設置
     */
    @Transactional
    public UserPreferencesDTO updateUserPreferences(String username, UserPreferencesDTO dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreferences preferences = userPreferencesRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));

        if (dto.getPreferredCurrency() != null) {
            preferences.setPreferredCurrency(dto.getPreferredCurrency());
            user.setPreferredCurrency(dto.getPreferredCurrency());
        }

        if (dto.getTheme() != null) {
            preferences.setTheme(dto.getTheme());
        }

        if (dto.getLanguage() != null) {
            preferences.setLanguage(dto.getLanguage());
        }

        if (dto.getEmailNotifications() != null) {
            preferences.setEmailNotifications(dto.getEmailNotifications());
        }

        if (dto.getBudgetAlerts() != null) {
            preferences.setBudgetAlerts(dto.getBudgetAlerts());
        }

        userRepository.save(user);
        userPreferencesRepository.save(preferences);

        return convertToDTO(preferences);
    }

    /**
     * 創建默認偏好設置
     */
    private UserPreferences createDefaultPreferences(User user) {
        UserPreferences preferences = new UserPreferences();
        preferences.setUser(user);
        preferences.setPreferredCurrency(user.getPreferredCurrency() != null ? user.getPreferredCurrency() : "CNY");
        preferences.setTheme("light");
        preferences.setLanguage("zh-TW");
        preferences.setEmailNotifications(true);
        preferences.setBudgetAlerts(true);
        return userPreferencesRepository.save(preferences);
    }

    /**
     * 轉換為 DTO
     */
    private UserPreferencesDTO convertToDTO(UserPreferences preferences) {
        return new UserPreferencesDTO(
                preferences.getPreferredCurrency(),
                preferences.getTheme(),
                preferences.getLanguage(),
                preferences.getEmailNotifications(),
                preferences.getBudgetAlerts()
        );
    }
}

package com.financesystem.controller;

import com.financesystem.dto.ChangePasswordRequest;
import com.financesystem.dto.UserPreferencesDTO;
import com.financesystem.dto.UserProfileDTO;
import com.financesystem.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class SettingsController {
    @Autowired
    private SettingsService settingsService;

    /**
     * 獲取用戶個人資料
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfileDTO profile = settingsService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }

    /**
     * 更新用戶個人資料
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(@RequestBody UserProfileDTO dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserProfileDTO updatedProfile = settingsService.updateUserProfile(
                username,
                dto.getDisplayName(),
                dto.getEmail()
        );
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * 修改密碼
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        settingsService.changePassword(username, request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * 獲取用戶偏好設置
     */
    @GetMapping("/preferences")
    public ResponseEntity<UserPreferencesDTO> getUserPreferences() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserPreferencesDTO preferences = settingsService.getUserPreferences(username);
        return ResponseEntity.ok(preferences);
    }

    /**
     * 更新用戶偏好設置
     */
    @PutMapping("/preferences")
    public ResponseEntity<UserPreferencesDTO> updateUserPreferences(@RequestBody UserPreferencesDTO dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserPreferencesDTO updatedPreferences = settingsService.updateUserPreferences(username, dto);
        return ResponseEntity.ok(updatedPreferences);
    }
}

package com.financesystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDTO {
    private String preferredCurrency;
    private String theme;
    private String language;
    private Boolean emailNotifications;
    private Boolean budgetAlerts;
}

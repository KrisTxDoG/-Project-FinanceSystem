package com.financesystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetAlertDTO {
    private String category;
    private BigDecimal limit;
    private BigDecimal spent;
    private BigDecimal remaining;
    private Double percentage;
    private String status; // "safe", "warning", "exceeded"
}

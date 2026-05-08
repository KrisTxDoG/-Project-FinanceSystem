package com.financesystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netIncome;
    private Map<String, BigDecimal> expenseByCategory;
    private Map<String, BigDecimal> monthlyTrend;
}

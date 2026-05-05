package com.financesystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private String description;
    private String type;
    private BigDecimal amount;
    private String category;
    private String notes;
    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
}

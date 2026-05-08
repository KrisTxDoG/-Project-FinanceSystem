package com.financesystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyDTO {
    private String code;
    private String name;
    private String symbol;
    private Double exchangeRate;
}

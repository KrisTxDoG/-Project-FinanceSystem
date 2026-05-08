package com.financesystem.controller;

import com.financesystem.dto.CurrencyDTO;
import com.financesystem.service.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/currencies")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class CurrencyController {
    @Autowired
    private CurrencyService currencyService;

    @GetMapping
    public ResponseEntity<List<CurrencyDTO>> getAllCurrencies() {
        return ResponseEntity.ok(currencyService.getAllCurrencies());
    }

    @GetMapping("/{code}")
    public ResponseEntity<CurrencyDTO> getCurrency(@PathVariable String code) {
        return ResponseEntity.ok(currencyService.getCurrencyByCode(code));
    }

    @PostMapping("/convert")
    public ResponseEntity<Map<String, Object>> convertCurrency(
            @RequestParam Double amount,
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        Double convertedAmount = currencyService.convertCurrency(amount, fromCurrency, toCurrency);
        Map<String, Object> response = new HashMap<>();
        response.put("originalAmount", amount);
        response.put("originalCurrency", fromCurrency);
        response.put("convertedAmount", convertedAmount);
        response.put("convertedCurrency", toCurrency);
        return ResponseEntity.ok(response);
    }
}

package com.financesystem.service;

import com.financesystem.dto.CurrencyDTO;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CurrencyService {
    // 模擬匯率數據（以 USD 為基準）
    private static final Map<String, Double> exchangeRates = new HashMap<>();
    
    private static final Map<String, String> currencySymbols = new HashMap<>();
    
    static {
        // 初始化匯率
        exchangeRates.put("USD", 1.0);
        exchangeRates.put("CNY", 6.45);
        exchangeRates.put("EUR", 0.92);
        exchangeRates.put("GBP", 0.79);
        exchangeRates.put("JPY", 149.50);
        exchangeRates.put("AUD", 1.53);
        exchangeRates.put("CAD", 1.36);
        exchangeRates.put("CHF", 0.88);
        exchangeRates.put("SEK", 10.45);
        exchangeRates.put("NZD", 1.69);
        
        // 初始化貨幣符號
        currencySymbols.put("USD", "$");
        currencySymbols.put("CNY", "¥");
        currencySymbols.put("EUR", "€");
        currencySymbols.put("GBP", "£");
        currencySymbols.put("JPY", "¥");
        currencySymbols.put("AUD", "A$");
        currencySymbols.put("CAD", "C$");
        currencySymbols.put("CHF", "CHF");
        currencySymbols.put("SEK", "kr");
        currencySymbols.put("NZD", "NZ$");
    }

    public List<CurrencyDTO> getAllCurrencies() {
        List<CurrencyDTO> currencies = new ArrayList<>();
        Map<String, String> names = new HashMap<>();
        names.put("USD", "US Dollar");
        names.put("CNY", "Chinese Yuan");
        names.put("EUR", "Euro");
        names.put("GBP", "British Pound");
        names.put("JPY", "Japanese Yen");
        names.put("AUD", "Australian Dollar");
        names.put("CAD", "Canadian Dollar");
        names.put("CHF", "Swiss Franc");
        names.put("SEK", "Swedish Krona");
        names.put("NZD", "New Zealand Dollar");

        for (String code : exchangeRates.keySet()) {
            currencies.add(new CurrencyDTO(
                    code,
                    names.getOrDefault(code, code),
                    currencySymbols.getOrDefault(code, code),
                    exchangeRates.get(code)
            ));
        }
        return currencies;
    }

    public Double convertCurrency(Double amount, String fromCurrency, String toCurrency) {
        if (!exchangeRates.containsKey(fromCurrency) || !exchangeRates.containsKey(toCurrency)) {
            throw new IllegalArgumentException("Unsupported currency: " + fromCurrency + " or " + toCurrency);
        }

        Double fromRate = exchangeRates.get(fromCurrency);
        Double toRate = exchangeRates.get(toCurrency);
        
        // 先轉換為 USD，再轉換為目標貨幣
        Double usdAmount = amount / fromRate;
        return usdAmount * toRate;
    }

    public String getCurrencySymbol(String currencyCode) {
        return currencySymbols.getOrDefault(currencyCode, currencyCode);
    }

    public CurrencyDTO getCurrencyByCode(String code) {
        if (!exchangeRates.containsKey(code)) {
            throw new IllegalArgumentException("Unsupported currency: " + code);
        }

        Map<String, String> names = new HashMap<>();
        names.put("USD", "US Dollar");
        names.put("CNY", "Chinese Yuan");
        names.put("EUR", "Euro");
        names.put("GBP", "British Pound");
        names.put("JPY", "Japanese Yen");
        names.put("AUD", "Australian Dollar");
        names.put("CAD", "Canadian Dollar");
        names.put("CHF", "Swiss Franc");
        names.put("SEK", "Swedish Krona");
        names.put("NZD", "New Zealand Dollar");

        return new CurrencyDTO(
                code,
                names.getOrDefault(code, code),
                currencySymbols.getOrDefault(code, code),
                exchangeRates.get(code)
        );
    }
}

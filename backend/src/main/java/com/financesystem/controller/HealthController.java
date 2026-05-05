package com.financesystem.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok().body("{\"status\": \"OK\"}");
    }
}

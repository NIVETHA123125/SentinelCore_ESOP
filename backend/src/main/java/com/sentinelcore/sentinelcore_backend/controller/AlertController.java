package com.sentinelcore.sentinelcore_backend.controller;

import com.sentinelcore.sentinelcore_backend.dto.AlertDTO;
import com.sentinelcore.sentinelcore_backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public List<AlertDTO> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @PostMapping
    public AlertDTO createAlert(
            @RequestParam Long assetId,
            @RequestParam String severity,
            @RequestParam String message) {

        return alertService.createAlert(assetId, severity, message);
    }

    @GetMapping("/open")
    public List<AlertDTO> getOpenAlerts() {
        return alertService.getOpenAlerts();
    }

    @PutMapping ("/{alertId}/resolve")
    public AlertDTO resolveAlert(@PathVariable Long alertId) {
        return alertService.resolveAlert(alertId);
    }
}
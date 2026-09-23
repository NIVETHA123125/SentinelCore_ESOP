package com.sentinelcore.sentinelcore_backend.controller;

import com.sentinelcore.sentinelcore_backend.dto.AlertDTO;
import com.sentinelcore.sentinelcore_backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    /**
     * Paginated endpoint for the AlertHistory page.
     * Example: GET /api/alerts/paged?page=0&size=50&status=ALL
     */
    @GetMapping("/paged")
    public Page<AlertDTO> getAlertsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "ALL") String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return alertService.getAlertsPaged(status, pageable);
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

    @PutMapping("/{alertId}/resolve")
    public AlertDTO resolveAlert(@PathVariable Long alertId) {
        return alertService.resolveAlert(alertId);
    }
}
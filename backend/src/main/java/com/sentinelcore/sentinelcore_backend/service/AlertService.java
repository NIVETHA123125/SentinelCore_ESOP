package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.dto.AlertDTO;
import com.sentinelcore.sentinelcore_backend.entity.Alert;
import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
import com.sentinelcore.sentinelcore_backend.repository.AlertRepository;
import com.sentinelcore.sentinelcore_backend.repository.InfrastructureAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final InfrastructureAssetRepository assetRepository;
    private final NotificationService notificationService;

    @Value("${twilio.to.phone.number}")
    private String toPhoneNumber;

    public AlertDTO createAlert(Long assetId, String severity, String message) {
        InfrastructureAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));

        String upperSeverity = severity.toUpperCase();
        if ("WARNING".equals(upperSeverity)) {
            upperSeverity = "MEDIUM";
        }
        Alert.AlertSeverity alertSeverity = Alert.AlertSeverity.valueOf(upperSeverity);

        Alert alert = Alert.builder()
                .asset(asset)
                .severity(alertSeverity)
                .message(message)
                .status(Alert.AlertStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        alert = alertRepository.save(alert);
        
        LocalDateTime now = LocalDateTime.now();
        // Always send Email for all alert types (CRITICAL, WARNING, MEDIUM, HIGH, etc.)
        notificationService.sendAlertEmail(
                "mynew222028@gmail.com",
                asset.getAssetName(), 
                alert.getSeverity().name(), 
                alert.getMessage()
        );

        // In addition, send SMS for CRITICAL alerts
        if ("CRITICAL".equalsIgnoreCase(severity)) {
            notificationService.sendAlertSms(
                    toPhoneNumber,
                    asset.getAssetName(),
                    alert.getSeverity().name(),
                    alert.getMessage()
            );
        }
        asset.setLastNotificationAt(now);
        assetRepository.save(asset);

        return toDTO(alert);
    }

    public AlertDTO resolveAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Asset alert not found: " + alertId));

        alert.setStatus(Alert.AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        Alert savedAlert = alertRepository.save(alert);

        // Send email when an alert is resolved
        notificationService.sendAlertClearedEmail(
                "mynew222028@gmail.com",
                alert.getAsset().getAssetName(),
                alert.getSeverity().name(),
                alert.getMessage()
        );

        return toDTO(savedAlert);
    }

    public List<AlertDTO> getOpenAlerts() {
        return alertRepository.findByStatus(Alert.AlertStatus.OPEN)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AlertDTO> getAllAlerts() {
        return alertRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns a paginated slice of alerts sorted by createdAt descending.
     * Optionally filters by status when the status parameter is provided.
     * This is used by the AlertHistory page to avoid loading all 20k+ records at once.
     */
    public Page<AlertDTO> getAlertsPaged(String status, Pageable pageable) {
        if (status != null && !status.equalsIgnoreCase("ALL") && !status.isBlank()) {
            Alert.AlertStatus alertStatus = Alert.AlertStatus.valueOf(status.toUpperCase());
            return alertRepository.findByStatusOrderByCreatedAtDesc(alertStatus, pageable)
                    .map(this::toDTO);
        }
        return alertRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDTO);
    }

    private AlertDTO toDTO(Alert alert) {
        return AlertDTO.builder()
                .id(alert.getId())
                .assetId(alert.getAsset().getId())
                .assetName(alert.getAsset().getAssetName())
                .severity(alert.getSeverity().name())
                .message(alert.getMessage())
                .status(alert.getStatus().name())
                .createdAt(alert.getCreatedAt())
                .resolvedAt(alert.getResolvedAt())
                .build();
    }
}
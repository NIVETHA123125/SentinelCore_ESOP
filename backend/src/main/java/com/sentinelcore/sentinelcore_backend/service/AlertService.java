package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.dto.AlertDTO;
import com.sentinelcore.sentinelcore_backend.entity.Alert;
import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
import com.sentinelcore.sentinelcore_backend.repository.AlertRepository;
import com.sentinelcore.sentinelcore_backend.repository.InfrastructureAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

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

        Alert alert = Alert.builder()
                .asset(asset)
                .severity(Alert.AlertSeverity.valueOf(severity))
                .message(message)
                .status(Alert.AlertStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        alert = alertRepository.save(alert);
        
        LocalDateTime now = LocalDateTime.now();
        if (asset.getLastNotificationAt() == null || asset.getLastNotificationAt().isBefore(now.minusMinutes(3))) {
            if ("CRITICAL".equalsIgnoreCase(severity)) {
                notificationService.sendAlertSms(
                        toPhoneNumber,
                        asset.getAssetName(),
                        alert.getSeverity().name(),
                        alert.getMessage()
                );
            } else {
                notificationService.sendAlertEmail(
                        "mynew222028@gmail.com",
                        asset.getAssetName(), 
                        alert.getSeverity().name(), 
                        alert.getMessage()
                );
            }
            asset.setLastNotificationAt(now);
            assetRepository.save(asset);
        }

        return toDTO(alert);
    }

    public AlertDTO resolveAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));

        alert.setStatus(Alert.AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());

        return toDTO(alertRepository.save(alert));
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
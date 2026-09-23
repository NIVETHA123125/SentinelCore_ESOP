package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.dto.InfrastructureAssetDTO;
import com.sentinelcore.sentinelcore_backend.entity.Alert;
import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
import com.sentinelcore.sentinelcore_backend.repository.AlertRepository;
import com.sentinelcore.sentinelcore_backend.repository.InfrastructureAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.sentinelcore.sentinelcore_backend.dto.DashboardSummaryDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class InfrastructureAssetService {


    @Autowired
    private InfrastructureAssetRepository assetRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private NotificationService notificationService;


    public List<InfrastructureAssetDTO> getAllAssets() {
        return assetRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    public InfrastructureAssetDTO getAssetById(Long id) {

        InfrastructureAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + id));
        return toDTO(asset);
    }



    public InfrastructureAssetDTO createAsset(InfrastructureAssetDTO dto) {
        String calculatedStatus = com.sentinelcore.sentinelcore_backend.util.AssetStatusEvaluator.evaluateStatus(dto.getCpuUsage(), dto.getMemoryUsage(), dto.getDiskUsage());
        InfrastructureAsset asset = InfrastructureAsset.builder()
                .assetName(dto.getAssetName())
                .assetType(dto.getAssetType())
                .ipAddress(dto.getIpAddress())
                .cpuUsage(dto.getCpuUsage())
                .memoryUsage(dto.getMemoryUsage())
                .diskUsage(dto.getDiskUsage())
                .networkUsage(dto.getNetworkUsage())
                .assetStatus(calculatedStatus)
                .createdAt(LocalDateTime.now())
                .build();
        InfrastructureAsset saved = assetRepository.save(asset);
        return toDTO(saved);
    }











    private InfrastructureAssetDTO toDTO(InfrastructureAsset a) {
        return new InfrastructureAssetDTO(
                a.getId(), a.getAssetName(), a.getAssetType(), a.getIpAddress(),
                a.getCpuUsage(), a.getMemoryUsage(), a.getDiskUsage(), a.getNetworkUsage(),
                a.getAssetStatus()
        );
    }
    public InfrastructureAssetDTO updateAsset(Long id, InfrastructureAssetDTO dto) {
        InfrastructureAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asset not found"));
        asset.setAssetName(dto.getAssetName());
        asset.setAssetType(dto.getAssetType());
        asset.setIpAddress(dto.getIpAddress());
        asset.setCpuUsage(dto.getCpuUsage());
        asset.setMemoryUsage(dto.getMemoryUsage());
        asset.setDiskUsage(dto.getDiskUsage());
        asset.setNetworkUsage(dto.getNetworkUsage());
        
        String calculatedStatus = com.sentinelcore.sentinelcore_backend.util.AssetStatusEvaluator.evaluateStatus(dto.getCpuUsage(), dto.getMemoryUsage(), dto.getDiskUsage());
        asset.setAssetStatus(calculatedStatus);
        
        InfrastructureAsset updated = assetRepository.save(asset);
        return toDTO(updated);
    }

    public void deleteAsset(Long id) {
        alertRepository.deleteAll(alertRepository.findByAssetId(id));
        assetRepository.deleteById(id);
    }
    public List<InfrastructureAssetDTO> getAssetsByType(String assetType) {
        return assetRepository.findByAssetType(assetType).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<InfrastructureAssetDTO> getAssetsByStatus(String assetStatus) {
        return assetRepository.findByAssetStatus(assetStatus).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public InfrastructureAssetDTO resolveCriticalAlerts(Long assetId) {
        InfrastructureAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found with id: " + assetId));

        // Find all OPEN CRITICAL alerts for this asset and resolve them
        List<Alert> openCriticalAlerts = alertRepository.findByAssetIdAndSeverityAndStatus(
                assetId, Alert.AlertSeverity.CRITICAL, Alert.AlertStatus.OPEN);

        for (Alert alert : openCriticalAlerts) {
            alert.setStatus(Alert.AlertStatus.RESOLVED);
            alert.setResolvedAt(LocalDateTime.now());
            alertRepository.save(alert);
        }

        // Reset CPU, memory, and disk so HealthMonitorService won't override status back to CRITICAL
        asset.setCpuUsage(0.0);
        asset.setMemoryUsage(0.0);
        asset.setDiskUsage(0.0);

        // Change asset status from CRITICAL to ONLINE
        asset.setAssetStatus("ONLINE");
        assetRepository.save(asset);

        // Always send cleared email when admin resolves a critical asset
        notificationService.sendAlertClearedEmail(
                "mynew222028@gmail.com",
                asset.getAssetName(),
                "CRITICAL",
                "Critical alert has been resolved. Asset is now back to ONLINE status."
        );

        return toDTO(asset);
    }

    public DashboardSummaryDTO getDashboardSummary() {
        List<InfrastructureAssetDTO> all = getAllAssets();
        long total = all.size();
        long up = all.stream().filter(a -> "UP".equalsIgnoreCase(a.getAssetStatus()) || "ONLINE".equalsIgnoreCase(a.getAssetStatus())).count();
        long openCriticalAlerts = alertRepository.countBySeverityAndStatus(Alert.AlertSeverity.CRITICAL, Alert.AlertStatus.OPEN);
        double uptimePercent = total == 0 ? 0 : (up * 100.0 / total);
        return new DashboardSummaryDTO(total, Math.round(uptimePercent * 100.0) / 100.0, openCriticalAlerts);
    }
}
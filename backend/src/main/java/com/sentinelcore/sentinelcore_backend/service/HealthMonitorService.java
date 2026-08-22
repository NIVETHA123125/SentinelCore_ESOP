package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
import com.sentinelcore.sentinelcore_backend.repository.InfrastructureAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthMonitorService {

    private final InfrastructureAssetRepository assetRepository;
    private final AlertService alertService;

    private static final double CPU_CRITICAL_THRESHOLD = 90.0;
    private static final double MEMORY_WARNING_THRESHOLD = 80.0;

    @Scheduled(fixedRate = 60000) // runs every 1minutes
    public void checkAssetHealth() {
        List<InfrastructureAsset> assets = assetRepository.findAll();

        for (InfrastructureAsset asset : assets) {
            if (asset.getCpuUsage() != null &&
                    asset.getCpuUsage() >= CPU_CRITICAL_THRESHOLD) {

                asset.setAssetStatus("CRITICAL");
                alertService.createAlert(
                        asset.getId(),
                        "CRITICAL",
                        "CPU usage critical: " + asset.getCpuUsage() + "%");

            } else if (asset.getMemoryUsage() != null &&
                    asset.getMemoryUsage() >= MEMORY_WARNING_THRESHOLD) {

                asset.setAssetStatus("WARNING");
                alertService.createAlert(
                        asset.getId(),
                        "MEDIUM",
                        "Memory usage high: " + asset.getMemoryUsage() + "%");

            } else {
                asset.setAssetStatus("ONLINE");
            }

            assetRepository.save(asset);
        }
    }
}
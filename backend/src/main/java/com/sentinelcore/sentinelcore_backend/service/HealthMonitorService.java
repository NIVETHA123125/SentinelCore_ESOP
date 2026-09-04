package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
import com.sentinelcore.sentinelcore_backend.repository.InfrastructureAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthMonitorService {

    private final InfrastructureAssetRepository assetRepository;
    private final AlertService alertService;


    @Scheduled(fixedRate = 60000) // runs every 1minutes
    @Transactional
    public void checkAssetHealth() {
        List<InfrastructureAsset> assets = assetRepository.findAll();

        for (InfrastructureAsset asset : assets) {
            String status = com.sentinelcore.sentinelcore_backend.util.AssetStatusEvaluator.evaluateStatus(asset.getCpuUsage(), asset.getMemoryUsage(), asset.getDiskUsage());
            asset.setAssetStatus(status);

            if ("CRITICAL".equals(status)) {
                alertService.createAlert(
                        asset.getId(),
                        "CRITICAL",
                        "Asset metrics reached critical thresholds. CPU: " + asset.getCpuUsage() + "%, Mem: " + asset.getMemoryUsage() + "%, Disk: " + asset.getDiskUsage() + "%");
            } else if ("WARNING".equals(status)) {
                alertService.createAlert(
                        asset.getId(),
                        "MEDIUM",
                        "Asset metrics reached warning thresholds. CPU: " + asset.getCpuUsage() + "%, Mem: " + asset.getMemoryUsage() + "%, Disk: " + asset.getDiskUsage() + "%");
            }

            assetRepository.save(asset);
        }
    }
}
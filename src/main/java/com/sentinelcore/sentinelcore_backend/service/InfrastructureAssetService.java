package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.dto.InfrastructureAssetDTO;
import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
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
        InfrastructureAsset asset = InfrastructureAsset.builder()
                .assetName(dto.getAssetName())
                .assetType(dto.getAssetType())
                .ipAddress(dto.getIpAddress())
                .cpuUsage(dto.getCpuUsage())
                .memoryUsage(dto.getMemoryUsage())
                .diskUsage(dto.getDiskUsage())
                .networkUsage(dto.getNetworkUsage())
                .assetStatus(dto.getAssetStatus())
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
        asset.setAssetStatus(dto.getAssetStatus());
        InfrastructureAsset updated = assetRepository.save(asset);
        return toDTO(updated);
    }

    public void deleteAsset(Long id) {
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

    public DashboardSummaryDTO getDashboardSummary() {
        List<InfrastructureAssetDTO> all = getAllAssets();
        long total = all.size();
        long up = all.stream().filter(a -> "UP".equalsIgnoreCase(a.getAssetStatus())).count();
        long alerts = all.stream().filter(a -> !"UP".equalsIgnoreCase(a.getAssetStatus())).count();
        double uptimePercent = total == 0 ? 0 : (up * 100.0 / total);
        return new DashboardSummaryDTO(total, Math.round(uptimePercent * 100.0) / 100.0, alerts);
    }
}
package com.sentinelcore.sentinelcore_backend.controller;

import com.sentinelcore.sentinelcore_backend.dto.DashboardSummaryDTO;
import com.sentinelcore.sentinelcore_backend.dto.InfrastructureAssetDTO;
import com.sentinelcore.sentinelcore_backend.service.InfrastructureAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class InfrastructureAssetController {

    private final InfrastructureAssetService assetService;

    @GetMapping
    public List<InfrastructureAssetDTO> getAllAssets() {
        return assetService.getAllAssets();
    }


    @PostMapping
    public InfrastructureAssetDTO createAsset(@RequestBody InfrastructureAssetDTO dto) {
        return assetService.createAsset(dto);
    }


    @GetMapping("/dashboard/summary")
    public DashboardSummaryDTO getDashboardSummary() {
        return assetService.getDashboardSummary();
    }

    @PutMapping("/{id}")
    public InfrastructureAssetDTO updateAsset(@PathVariable Long id, @RequestBody InfrastructureAssetDTO dto) {
        return assetService.updateAsset(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
    }

    @GetMapping("/type/{assetType}")
    public List<InfrastructureAssetDTO> getByType(@PathVariable String assetType) {
        return assetService.getAssetsByType(assetType);
    }

    @GetMapping("/status/{assetStatus}")
    public List<InfrastructureAssetDTO> getByStatus(@PathVariable String assetStatus) {
        return assetService.getAssetsByStatus(assetStatus);
    }

    @GetMapping("/{id}")
    public InfrastructureAssetDTO getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id);
    }
}
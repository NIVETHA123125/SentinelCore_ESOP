package com.sentinelcore.sentinelcore_backend.repository;

import com.sentinelcore.sentinelcore_backend.entity.InfrastructureAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InfrastructureAssetRepository extends JpaRepository<InfrastructureAsset, Long> {
    InfrastructureAsset findByAssetName(String assetName);
    List<InfrastructureAsset> findByAssetType(String assetType);
    List<InfrastructureAsset> findByAssetStatus(String assetStatus);
}
package com.sentinelcore.sentinelcore_backend.repository;

import com.sentinelcore.sentinelcore_backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatus(Alert.AlertStatus status);
    List<Alert> findByAssetId(Long assetId);
    List<Alert> findByAssetIdAndSeverityAndStatus(Long assetId, Alert.AlertSeverity severity, Alert.AlertStatus status);
}
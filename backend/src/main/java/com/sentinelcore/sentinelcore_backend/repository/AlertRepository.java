package com.sentinelcore.sentinelcore_backend.repository;

import com.sentinelcore.sentinelcore_backend.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatus(Alert.AlertStatus status);
    List<Alert> findByAssetId(Long assetId);
    List<Alert> findByAssetIdAndSeverityAndStatus(Long assetId, Alert.AlertSeverity severity, Alert.AlertStatus status);

    // Deduplication guard: check if an open alert already exists for this asset+severity
    boolean existsByAssetIdAndSeverityAndStatus(Long assetId, Alert.AlertSeverity severity, Alert.AlertStatus status);

    // Paginated queries for the AlertHistory page
    Page<Alert> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Alert> findByStatusOrderByCreatedAtDesc(Alert.AlertStatus status, Pageable pageable);

    long countBySeverityAndStatus(Alert.AlertSeverity severity, Alert.AlertStatus status);
}
package com.sentinelcore.sentinelcore_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private long totalAssets;
    private double uptimePercent;
    private long activeAlerts;
}

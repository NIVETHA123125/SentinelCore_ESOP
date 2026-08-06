package com.sentinelcore.sentinelcore_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InfrastructureAssetDTO {
    private Long id;
    private String assetName;
    private String assetType;
    private String ipAddress;
    private Double cpuUsage;
    private Double memoryUsage;
    private Double diskUsage;
    private Double networkUsage;
    private String assetStatus;
}
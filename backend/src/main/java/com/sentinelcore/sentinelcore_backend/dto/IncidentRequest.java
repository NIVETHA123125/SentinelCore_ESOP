package com.sentinelcore.sentinelcore_backend.dto;

import com.sentinelcore.sentinelcore_backend.entity.Incident;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IncidentRequest {
    private String title;
    private String description;
    private Incident.Severity severity;
    private String assignedTo;
    private LocalDateTime slaDueAt;
}
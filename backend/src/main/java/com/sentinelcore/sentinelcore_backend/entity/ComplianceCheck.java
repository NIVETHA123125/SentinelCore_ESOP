package com.sentinelcore.sentinelcore_backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "compliance_checks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceCheck {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String framework;
    private String controlId;
    private String controlName;
    @Enumerated(EnumType.STRING)
    private ComplianceStatus status;
    private String remarks;
    private LocalDateTime checkedAt;
    @PrePersist
    public void onCreate() {
        checkedAt = LocalDateTime.now();
    }
    public enum ComplianceStatus {
        COMPLIANT, NON_COMPLIANT, REVIEW_REQUIRED
    }
}

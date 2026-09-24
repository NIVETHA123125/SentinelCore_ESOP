package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.dto.AuditLogRequest;
import com.sentinelcore.sentinelcore_backend.entity.AuditLog;
import com.sentinelcore.sentinelcore_backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class AuditLogService {
    private final AuditLogRepository repository;
    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }
    public AuditLog create(AuditLogRequest request) {
        AuditLog log = AuditLog.builder()
                .username(request.getUsername())
                .action(request.getAction())
                .resource(request.getResource())
                .ipAddress(request.getIpAddress())
                .details(request.getDetails())
                .build();
        return repository.save(log);
    }
    public List<AuditLog> getAll() {
        return repository.findAll();
    }
    public List<AuditLog> getByUsername(String username) {
        return repository.findByUsername(username);
    }
}

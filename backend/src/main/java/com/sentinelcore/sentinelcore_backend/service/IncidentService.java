package com.sentinelcore.sentinelcore_backend.service;

import com.sentinelcore.sentinelcore_backend.dto.IncidentRequest;
import com.sentinelcore.sentinelcore_backend.entity.Incident;
import com.sentinelcore.sentinelcore_backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
@Service
public class IncidentService {
    private final IncidentRepository repository;
    public IncidentService(IncidentRepository repository) {
        this.repository = repository;
    }
    public Incident create(IncidentRequest request) {
        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .assignedTo(request.getAssignedTo())
                .slaDueAt(request.getSlaDueAt())
                .status(Incident.IncidentStatus.OPEN)
                .build();
        return repository.save(incident);
    }
    public List<Incident> getAll() {
        return repository.findAll();
    }
    public Incident getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
    }
    public Incident assign(Long id, String user) {
        Incident incident = getById(id);
        incident.setAssignedTo(user);
        incident.setStatus(Incident.IncidentStatus.IN_PROGRESS);
        return repository.save(incident);
    }
    public Incident updateStatus(Long id, Incident.IncidentStatus status) {
        Incident incident = getById(id);
        incident.setStatus(status);
        if (status == Incident.IncidentStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
        }
        return repository.save(incident);
    }
    public void delete(Long id) {
        repository.deleteById(id);
    }
}

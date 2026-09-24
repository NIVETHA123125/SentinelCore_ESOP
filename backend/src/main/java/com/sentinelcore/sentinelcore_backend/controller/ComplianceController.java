package com.sentinelcore.sentinelcore_backend.controller;

import com.sentinelcore.sentinelcore_backend.entity.ComplianceCheck;
import com.sentinelcore.sentinelcore_backend.repository.ComplianceRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/compliance")
@CrossOrigin
public class ComplianceController {
    private final ComplianceRepository repository;
    public ComplianceController(ComplianceRepository repository) {
        this.repository = repository;
    }
    @PostMapping
    public ComplianceCheck create(
            @RequestBody ComplianceCheck check) {
        return repository.save(check);
    }
    @GetMapping
    public List<ComplianceCheck> getAll() {
        return repository.findAll();
    }
    @GetMapping("/framework/{framework}")
    public List<ComplianceCheck> byFramework(
            @PathVariable String framework) {
        return repository.findByFramework(framework);
    }
}

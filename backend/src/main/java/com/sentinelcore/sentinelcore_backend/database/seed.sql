INSERT INTO infrastructure_assets
(asset_name, asset_type, ip_address, cpu_usage, memory_usage, disk_usage, network_usage, asset_status, created_at)
VALUES
    ('WebServer-01', 'Server', '192.168.1.10', 45.2, 60.1, 70.5, 30.2, 'ONLINE', NOW()),
    ('DBServer-01', 'Database', '192.168.1.11', 78.5, 82.3, 55.0, 20.1, 'WARNING', NOW()),
    ('Router-01', 'Network', '192.168.1.1', 12.0, 25.0, 10.0, 55.0, 'ONLINE', NOW()),
    ('Firewall-01', 'Security', '192.168.1.2', 5.0, 15.0, 8.0, 12.0, 'ONLINE', NOW()),
    ('AppServer-02', 'Server', '192.168.1.12', 92.0, 88.0, 90.0, 40.0, 'CRITICAL', NOW()),
    ('CacheServer-01', 'Server', '192.168.1.13', 33.5, 40.2, 25.0, 18.5, 'ONLINE', NOW()),
    ('LoadBalancer-01', 'Network', '192.168.1.3', 20.0, 30.0, 15.0, 60.0, 'ONLINE', NOW()),
    ('BackupServer-01', 'Storage', '192.168.1.14', 15.0, 45.0, 85.0, 10.0, 'WARNING', NOW()),
    ('AuthServer-01', 'Security', '192.168.1.4', 25.0, 35.0, 20.0, 22.0, 'ONLINE', NOW()),
    ('MonitoringNode-01', 'Server', '192.168.1.15', 60.0, 70.0, 50.0, 35.0, 'OFFLINE', NOW());

INSERT INTO incidents
(title, description, severity, status, assigned_to, created_at, updated_at)
VALUES
('Suspicious Login', 'Multiple failed login attempts detected',
 'HIGH', 'OPEN', 'admin', NOW(), NOW());

INSERT INTO vulnerabilities
(cve_id, title, affected_system, severity, risk_score,
 description, patch_version, patch_status, discovered_at)
VALUES
('CVE-2026-0001', 'Sample Vulnerability', 'API Server',
 'HIGH', 8.2, 'Sample security vulnerability',
 '2.1.0', 'OPEN', NOW());

INSERT INTO audit_logs
(username, action, resource, ip_address, details, created_at)
VALUES
('admin', 'LOGIN', 'AUTHENTICATION',
 '127.0.0.1', 'Successful login', NOW());

INSERT INTO compliance_checks
(framework, control_id, control_name, status, remarks, checked_at)
VALUES
('PCI DSS', 'A-01', 'Access Control',
 'COMPLIANT', 'Sample verification', NOW());
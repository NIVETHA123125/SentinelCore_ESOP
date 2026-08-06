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
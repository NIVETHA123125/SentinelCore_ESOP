package com.sentinelcore.sentinelcore_backend.util;

public class AssetStatusEvaluator {

    public static String evaluateStatus(Double cpuUsage, Double memoryUsage) {
        if (cpuUsage == null && memoryUsage == null) {
            return "OFFLINE";
        }

        double cpu = cpuUsage != null ? cpuUsage : 0.0;
        double mem = memoryUsage != null ? memoryUsage : 0.0;

        if (cpu >= 90.0 || mem >= 90.0) {
            return "CRITICAL";
        } else if (cpu >= 70.0 || mem >= 70.0) {
            return "WARNING";
        } else {
            return "ONLINE";
        }
    }
}

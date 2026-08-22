package com.sentinelcore.sentinelcore_backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGen {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("admin123  -> " + encoder.encode("admin123"));
        System.out.println("viewer123 -> " + encoder.encode("viewer123"));
        System.out.println("operator123 -> " + encoder.encode("operator123"));
    }
}

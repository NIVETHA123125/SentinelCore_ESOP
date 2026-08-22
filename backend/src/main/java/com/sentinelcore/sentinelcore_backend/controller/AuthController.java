package com.sentinelcore.sentinelcore_backend.controller;

import com.sentinelcore.sentinelcore_backend.dto.AuthResponse;
import com.sentinelcore.sentinelcore_backend.dto.LoginRequest;
import com.sentinelcore.sentinelcore_backend.dto.RegisterRequest;
import com.sentinelcore.sentinelcore_backend.entity.Role;
import com.sentinelcore.sentinelcore_backend.entity.User;
import com.sentinelcore.sentinelcore_backend.repository.RoleRepository;
import com.sentinelcore.sentinelcore_backend.repository.UserRepository;
import com.sentinelcore.sentinelcore_backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken: " + request.getUsername());
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(role))
                .enabled(true)
                .build();

        userRepository.save(user);

        String roleStr = user.getRoles().stream().map(Role::getName).collect(Collectors.joining(","));
        String accessToken = jwtUtil.generateToken(user.getUsername(), roleStr);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(roleStr)
                .build();
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String roleStr = user.getRoles().stream().map(Role::getName).collect(Collectors.joining(","));
        String accessToken = jwtUtil.generateToken(user.getUsername(), roleStr);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(roleStr)
                .build();
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        
        String username = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        String roleStr = user.getRoles().stream().map(Role::getName).collect(Collectors.joining(","));
        String newAccessToken = jwtUtil.generateToken(username, roleStr);
        
        return Map.of("accessToken", newAccessToken);
    }
}
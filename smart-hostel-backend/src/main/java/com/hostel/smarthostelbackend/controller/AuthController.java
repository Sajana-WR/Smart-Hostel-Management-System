package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.dto.AuthResponse;
import com.hostel.smarthostelbackend.dto.LoginRequest;
import com.hostel.smarthostelbackend.dto.RegisterRequest;
import com.hostel.smarthostelbackend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/ping")
    public ResponseEntity<ApiMessage> ping() {
        return ResponseEntity.ok(new ApiMessage("auth-ok"));
    }

    // ⚠️ TEMPORARY - remove after use!
    @GetMapping("/gen-hash")
    public String genHash() {
        return passwordEncoder.encode("canteen123");
    }
}
package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.dto.AuthResponse;
import com.hostel.smarthostelbackend.dto.LoginRequest;
import com.hostel.smarthostelbackend.dto.RegisterRequest;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.hostel.smarthostelbackend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        String fullName = trim(request.getFullName());
        String email    = normalizeEmail(request.getEmail());
        String username = normalizeUsername(request.getUsername());

        if (fullName == null || fullName.isBlank())
            throw new AppException(HttpStatus.BAD_REQUEST, "Full name is required");
        if (email == null || email.isBlank())
            throw new AppException(HttpStatus.BAD_REQUEST, "Email is required");
        if (username == null || username.isBlank())
            throw new AppException(HttpStatus.BAD_REQUEST, "Username is required");

        if (userRepository.existsByEmailIgnoreCase(email))
            throw new AppException(HttpStatus.BAD_REQUEST, "Email already exists");
        if (userRepository.existsByUsernameIgnoreCase(username))
            throw new AppException(HttpStatus.BAD_REQUEST, "Username already exists");

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");
        user.setStatus("PENDING");       // ✅ All new students start as PENDING
        user.setRoomTypePreference(request.getRoomTypePreference()); // ✅ Save room preference
        user.setSurveyCompleted(false);

        User saved = userRepository.save(user);

        String token = jwtService.generateToken(saved);
        return toAuthResponse(saved, token);
    }

    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new AppException(HttpStatus.UNAUTHORIZED, "Invalid email or password");

        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    public User getByEmail(String email) {
        String normalized = normalizeEmail(email);
        return userRepository.findByEmailIgnoreCase(normalized)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // -----------------------
    // Helpers
    // -----------------------

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeEmail(String value) {
        String t = trim(value);
        return t == null ? null : t.toLowerCase();
    }

    private String normalizeUsername(String value) {
        String t = trim(value);
        return t == null ? null : t.toLowerCase();
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getStatus(),            // ✅ status included
                user.isSurveyCompleted()
        );
    }
}
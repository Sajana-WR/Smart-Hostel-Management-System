package com.hostel.smarthostelbackend.security;

import com.hostel.smarthostelbackend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 characters");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationMs);

        String role = (user.getRole() == null || user.getRole().isBlank())
                ? "STUDENT"
                : user.getRole().toUpperCase();

        return Jwts.builder()
                .subject(user.getEmail())             // ✅ email is subject
                .claim("userId", user.getId())        // ✅ add userId claim (recommended)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        String subject = extractClaims(token).getSubject();
        return (subject == null) ? null : subject.trim();
    }

    public String extractRole(String token) {
        Object role = extractClaims(token).get("role");
        return role == null ? null : role.toString();
    }

    public Long extractUserId(String token) {
        Object id = extractClaims(token).get("userId");
        if (id == null) return null;
        if (id instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(id.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);

            // ✅ must have subject
            String email = claims.getSubject();
            if (email == null || email.isBlank()) return false;

            // ✅ must not be expired (parser usually checks, but keep safe)
            Date exp = claims.getExpiration();
            return exp != null && exp.after(new Date());

        } catch (Exception ex) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
package com.hostel.smarthostelbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_username", columnNames = "username")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(nullable = false, length = 50)
    private String username;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role;

    // PENDING | APPROVED | REJECTED
    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    // SINGLE | DOUBLE
    @Column(name = "room_type_preference", length = 20)
    private String roomTypePreference;

    @Column(name = "survey_completed", nullable = false)
    private boolean surveyCompleted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public User() {
        this.role = "STUDENT";
        this.status = "PENDING";
        this.surveyCompleted = false;
    }

    public User(String fullName, String email, String username, String passwordHash) {
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = "STUDENT";
        this.status = "PENDING";
        this.surveyCompleted = false;
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (role == null || role.isBlank()) role = "STUDENT";
        if (status == null || status.isBlank()) status = "PENDING";
    }

    // --------------------
    // Getters / Setters
    // --------------------

    public Long getId() { return id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRoomTypePreference() { return roomTypePreference; }
    public void setRoomTypePreference(String roomTypePreference) { this.roomTypePreference = roomTypePreference; }

    public boolean isSurveyCompleted() { return surveyCompleted; }
    public void setSurveyCompleted(boolean surveyCompleted) { this.surveyCompleted = surveyCompleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
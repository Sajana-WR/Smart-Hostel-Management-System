package com.hostel.smarthostelbackend.dto;

public class AuthResponse {

    private String token;
    private Long id;
    private String fullName;
    private String email;
    private String username;
    private String role;
    private String status;          // ✅ NEW — PENDING | APPROVED | REJECTED
    private boolean surveyCompleted;

    public AuthResponse() {}

    public AuthResponse(String token,
                        Long id,
                        String fullName,
                        String email,
                        String username,
                        String role,
                        String status,
                        boolean surveyCompleted) {
        this.token = token;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.role = role;
        this.status = status;
        this.surveyCompleted = surveyCompleted;
    }

    // Getters
    public String getToken()          { return token; }
    public Long getId()               { return id; }
    public String getFullName()       { return fullName; }
    public String getEmail()          { return email; }
    public String getUsername()       { return username; }
    public String getRole()           { return role; }
    public String getStatus()         { return status; }
    public boolean isSurveyCompleted(){ return surveyCompleted; }

    // Setters
    public void setToken(String token)                    { this.token = token; }
    public void setId(Long id)                            { this.id = id; }
    public void setFullName(String fullName)              { this.fullName = fullName; }
    public void setEmail(String email)                    { this.email = email; }
    public void setUsername(String username)              { this.username = username; }
    public void setRole(String role)                      { this.role = role; }
    public void setStatus(String status)                  { this.status = status; }
    public void setSurveyCompleted(boolean surveyCompleted){ this.surveyCompleted = surveyCompleted; }
}
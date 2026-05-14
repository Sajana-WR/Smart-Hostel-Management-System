package com.hostel.smarthostelbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name is too long")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email is invalid")
    @Size(max = 180, message = "Email is too long")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3 to 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 120, message = "Password must be 6 to 120 characters")
    private String password;

    // ✅ Room type preference — SINGLE or DOUBLE
    @Size(max = 20, message = "Room type is too long")
    private String roomTypePreference;

    // Optional profile fields
    @Size(max = 50)  private String studentId;
    @Size(max = 100) private String course;
    @Size(max = 100) private String degree;
    @Size(max = 100) private String hometown;
    @Size(max = 120) private String school;

    public RegisterRequest() {}

    // Getters & Setters
    public String getFullName()             { return fullName; }
    public void setFullName(String v)       { this.fullName = v; }

    public String getEmail()                { return email; }
    public void setEmail(String v)          { this.email = v; }

    public String getUsername()             { return username; }
    public void setUsername(String v)       { this.username = v; }

    public String getPassword()             { return password; }
    public void setPassword(String v)       { this.password = v; }

    public String getRoomTypePreference()   { return roomTypePreference; }
    public void setRoomTypePreference(String v) { this.roomTypePreference = v; }

    public String getStudentId()            { return studentId; }
    public void setStudentId(String v)      { this.studentId = v; }

    public String getCourse()               { return course; }
    public void setCourse(String v)         { this.course = v; }

    public String getDegree()               { return degree; }
    public void setDegree(String v)         { this.degree = v; }

    public String getHometown()             { return hometown; }
    public void setHometown(String v)       { this.hometown = v; }

    public String getSchool()               { return school; }
    public void setSchool(String v)         { this.school = v; }
}
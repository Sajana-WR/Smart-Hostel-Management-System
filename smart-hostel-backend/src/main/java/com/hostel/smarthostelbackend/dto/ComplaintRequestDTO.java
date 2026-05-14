package com.hostel.smarthostelbackend.dto;

public class ComplaintRequestDTO {
    private String category;
    private String subject;
    private String description;

    // Getters and Setters
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
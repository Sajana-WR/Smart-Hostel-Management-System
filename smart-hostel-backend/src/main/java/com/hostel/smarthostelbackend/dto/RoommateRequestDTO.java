package com.hostel.smarthostelbackend.dto;

import java.time.LocalDateTime;

public class RoommateRequestDTO {

    private Long id;
    private Long requesterId;
    private String requesterName;
    private Long requestedId;
    private String requestedName;
    private String status;
    private LocalDateTime createdAt;

    // Profile fields (from RoommateSurvey)
    private String requesterEmail;
    private String requesterUsername;
    private String requesterDegree;
    private String requesterHometown;
    private String requesterSchool;

    // Survey fields (from RoommateSurvey)
    private String requesterStudyTime;
    private String requesterSleepTime;
    private String requesterWakeUpTime;
    private String requesterCleanliness;
    private String requesterNoiseTolerance;
    private String requesterGuestFrequency;
    private String requesterSmoking;
    private String requesterPersonality;
    private String requesterRoomTemp;
    private String requesterSharing;

    public RoommateRequestDTO() {}

    // ─── Getters & Setters ───────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequesterId() { return requesterId; }
    public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public Long getRequestedId() { return requestedId; }
    public void setRequestedId(Long requestedId) { this.requestedId = requestedId; }

    public String getRequestedName() { return requestedName; }
    public void setRequestedName(String requestedName) { this.requestedName = requestedName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRequesterEmail() { return requesterEmail; }
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }

    public String getRequesterUsername() { return requesterUsername; }
    public void setRequesterUsername(String requesterUsername) { this.requesterUsername = requesterUsername; }

    public String getRequesterDegree() { return requesterDegree; }
    public void setRequesterDegree(String requesterDegree) { this.requesterDegree = requesterDegree; }

    public String getRequesterHometown() { return requesterHometown; }
    public void setRequesterHometown(String requesterHometown) { this.requesterHometown = requesterHometown; }

    public String getRequesterSchool() { return requesterSchool; }
    public void setRequesterSchool(String requesterSchool) { this.requesterSchool = requesterSchool; }

    public String getRequesterStudyTime() { return requesterStudyTime; }
    public void setRequesterStudyTime(String requesterStudyTime) { this.requesterStudyTime = requesterStudyTime; }

    public String getRequesterSleepTime() { return requesterSleepTime; }
    public void setRequesterSleepTime(String requesterSleepTime) { this.requesterSleepTime = requesterSleepTime; }

    public String getRequesterWakeUpTime() { return requesterWakeUpTime; }
    public void setRequesterWakeUpTime(String requesterWakeUpTime) { this.requesterWakeUpTime = requesterWakeUpTime; }

    public String getRequesterCleanliness() { return requesterCleanliness; }
    public void setRequesterCleanliness(String requesterCleanliness) { this.requesterCleanliness = requesterCleanliness; }

    public String getRequesterNoiseTolerance() { return requesterNoiseTolerance; }
    public void setRequesterNoiseTolerance(String requesterNoiseTolerance) { this.requesterNoiseTolerance = requesterNoiseTolerance; }

    public String getRequesterGuestFrequency() { return requesterGuestFrequency; }
    public void setRequesterGuestFrequency(String requesterGuestFrequency) { this.requesterGuestFrequency = requesterGuestFrequency; }

    public String getRequesterSmoking() { return requesterSmoking; }
    public void setRequesterSmoking(String requesterSmoking) { this.requesterSmoking = requesterSmoking; }

    public String getRequesterPersonality() { return requesterPersonality; }
    public void setRequesterPersonality(String requesterPersonality) { this.requesterPersonality = requesterPersonality; }

    public String getRequesterRoomTemp() { return requesterRoomTemp; }
    public void setRequesterRoomTemp(String requesterRoomTemp) { this.requesterRoomTemp = requesterRoomTemp; }

    public String getRequesterSharing() { return requesterSharing; }
    public void setRequesterSharing(String requesterSharing) { this.requesterSharing = requesterSharing; }
}
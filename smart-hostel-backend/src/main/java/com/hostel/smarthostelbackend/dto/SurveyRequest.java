package com.hostel.smarthostelbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SurveyRequest {

    @NotBlank(message = "Degree is required")
    @Size(max = 100, message = "Degree is too long")
    private String degree;

    @NotBlank(message = "Hometown is required")
    @Size(max = 100, message = "Hometown is too long")
    private String hometown;

    @NotBlank(message = "School is required")
    @Size(max = 120, message = "School is too long")
    private String school;

    @NotBlank(message = "Preferred study time is required")
    @Size(max = 50, message = "Preferred study time is too long")
    private String preferredStudyTime;

    @NotBlank(message = "Typical sleep time is required")
    @Size(max = 50, message = "Typical sleep time is too long")
    private String typicalSleepTime;

    @NotBlank(message = "Wake up time is required")
    @Size(max = 50, message = "Wake up time is too long")
    private String wakeUpTime;

    @NotBlank(message = "Cleanliness preference is required")
    @Size(max = 50, message = "Cleanliness preference is too long")
    private String cleanlinessPreference;

    @NotBlank(message = "Noise tolerance is required")
    @Size(max = 50, message = "Noise tolerance is too long")
    private String noiseTolerance;

    @NotBlank(message = "Guest frequency is required")
    @Size(max = 50, message = "Guest frequency is too long")
    private String guestFrequency;

    @NotBlank(message = "Smoking preference is required")
    @Size(max = 50, message = "Smoking preference is too long")
    private String smokingPreference;

    @NotBlank(message = "Personality type is required")
    @Size(max = 50, message = "Personality type is too long")
    private String personalityType;

    @Size(max = 50, message = "Room temperature preference is too long")
    private String roomTempPreference;

    @Size(max = 50, message = "Sharing preference is too long")
    private String sharingPreference;

    public SurveyRequest() {
    }

    public SurveyRequest(String degree,
                         String hometown,
                         String school,
                         String preferredStudyTime,
                         String typicalSleepTime,
                         String wakeUpTime,
                         String cleanlinessPreference,
                         String noiseTolerance,
                         String guestFrequency,
                         String smokingPreference,
                         String personalityType,
                         String roomTempPreference,
                         String sharingPreference) {
        this.degree = degree;
        this.hometown = hometown;
        this.school = school;
        this.preferredStudyTime = preferredStudyTime;
        this.typicalSleepTime = typicalSleepTime;
        this.wakeUpTime = wakeUpTime;
        this.cleanlinessPreference = cleanlinessPreference;
        this.noiseTolerance = noiseTolerance;
        this.guestFrequency = guestFrequency;
        this.smokingPreference = smokingPreference;
        this.personalityType = personalityType;
        this.roomTempPreference = roomTempPreference;
        this.sharingPreference = sharingPreference;
    }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getHometown() { return hometown; }
    public void setHometown(String hometown) { this.hometown = hometown; }

    public String getSchool() { return school; }
    public void setSchool(String school) { this.school = school; }

    public String getPreferredStudyTime() { return preferredStudyTime; }
    public void setPreferredStudyTime(String preferredStudyTime) { this.preferredStudyTime = preferredStudyTime; }

    public String getTypicalSleepTime() { return typicalSleepTime; }
    public void setTypicalSleepTime(String typicalSleepTime) { this.typicalSleepTime = typicalSleepTime; }

    public String getWakeUpTime() { return wakeUpTime; }
    public void setWakeUpTime(String wakeUpTime) { this.wakeUpTime = wakeUpTime; }

    public String getCleanlinessPreference() { return cleanlinessPreference; }
    public void setCleanlinessPreference(String cleanlinessPreference) { this.cleanlinessPreference = cleanlinessPreference; }

    public String getNoiseTolerance() { return noiseTolerance; }
    public void setNoiseTolerance(String noiseTolerance) { this.noiseTolerance = noiseTolerance; }

    public String getGuestFrequency() { return guestFrequency; }
    public void setGuestFrequency(String guestFrequency) { this.guestFrequency = guestFrequency; }

    public String getSmokingPreference() { return smokingPreference; }
    public void setSmokingPreference(String smokingPreference) { this.smokingPreference = smokingPreference; }

    public String getPersonalityType() { return personalityType; }
    public void setPersonalityType(String personalityType) { this.personalityType = personalityType; }

    public String getRoomTempPreference() { return roomTempPreference; }
    public void setRoomTempPreference(String roomTempPreference) { this.roomTempPreference = roomTempPreference; }

    public String getSharingPreference() { return sharingPreference; }
    public void setSharingPreference(String sharingPreference) { this.sharingPreference = sharingPreference; }
}
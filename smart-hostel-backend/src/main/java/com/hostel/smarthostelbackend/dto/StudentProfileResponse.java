package com.hostel.smarthostelbackend.dto;

public class StudentProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String username;
    private String role;
    private String status;                // PENDING | APPROVED | REJECTED
    private String roomTypePreference;    // ✅ SINGLE | DOUBLE
    private String degree;
    private String hometown;
    private String school;
    private boolean surveyCompleted;

    // Survey preference fields
    private String preferredStudyTime;
    private String typicalSleepTime;
    private String wakeUpTime;
    private String cleanlinessPreference;
    private String noiseTolerance;
    private String guestFrequency;
    private String smokingPreference;
    private String personalityType;
    private String roomTempPreference;
    private String sharingPreference;

    public StudentProfileResponse() {}

    // ✅ Constructor used in StudentService.toProfileResponse()
    public StudentProfileResponse(Long id,
                                  String fullName,
                                  String email,
                                  String username,
                                  String role,
                                  String status,
                                  String roomTypePreference,   // ✅ added
                                  String degree,
                                  String hometown,
                                  String school,
                                  boolean surveyCompleted) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.role = role;
        this.status = status;
        this.roomTypePreference = roomTypePreference;
        this.degree = degree;
        this.hometown = hometown;
        this.school = school;
        this.surveyCompleted = surveyCompleted;
    }

    // ── Getters ──────────────────────────────────────
    public Long getId()                     { return id; }
    public String getFullName()             { return fullName; }
    public String getEmail()                { return email; }
    public String getUsername()             { return username; }
    public String getRole()                 { return role; }
    public String getStatus()               { return status; }
    public String getRoomTypePreference()   { return roomTypePreference; }
    public String getDegree()               { return degree; }
    public String getHometown()             { return hometown; }
    public String getSchool()               { return school; }
    public boolean isSurveyCompleted()      { return surveyCompleted; }
    public String getPreferredStudyTime()   { return preferredStudyTime; }
    public String getTypicalSleepTime()     { return typicalSleepTime; }
    public String getWakeUpTime()           { return wakeUpTime; }
    public String getCleanlinessPreference(){ return cleanlinessPreference; }
    public String getNoiseTolerance()       { return noiseTolerance; }
    public String getGuestFrequency()       { return guestFrequency; }
    public String getSmokingPreference()    { return smokingPreference; }
    public String getPersonalityType()      { return personalityType; }
    public String getRoomTempPreference()   { return roomTempPreference; }
    public String getSharingPreference()    { return sharingPreference; }

    // ── Setters ──────────────────────────────────────
    public void setId(Long id)                              { this.id = id; }
    public void setFullName(String v)                       { this.fullName = v; }
    public void setEmail(String v)                          { this.email = v; }
    public void setUsername(String v)                       { this.username = v; }
    public void setRole(String v)                           { this.role = v; }
    public void setStatus(String v)                         { this.status = v; }
    public void setRoomTypePreference(String v)             { this.roomTypePreference = v; }
    public void setDegree(String v)                         { this.degree = v; }
    public void setHometown(String v)                       { this.hometown = v; }
    public void setSchool(String v)                         { this.school = v; }
    public void setSurveyCompleted(boolean surveyCompleted) { this.surveyCompleted = surveyCompleted; }
    public void setPreferredStudyTime(String v)             { this.preferredStudyTime = v; }
    public void setTypicalSleepTime(String v)               { this.typicalSleepTime = v; }
    public void setWakeUpTime(String v)                     { this.wakeUpTime = v; }
    public void setCleanlinessPreference(String v)          { this.cleanlinessPreference = v; }
    public void setNoiseTolerance(String v)                 { this.noiseTolerance = v; }
    public void setGuestFrequency(String v)                 { this.guestFrequency = v; }
    public void setSmokingPreference(String v)              { this.smokingPreference = v; }
    public void setPersonalityType(String v)                { this.personalityType = v; }
    public void setRoomTempPreference(String v)             { this.roomTempPreference = v; }
    public void setSharingPreference(String v)              { this.sharingPreference = v; }
}
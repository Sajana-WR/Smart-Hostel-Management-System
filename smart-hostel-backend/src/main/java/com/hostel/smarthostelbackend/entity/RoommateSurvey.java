package com.hostel.smarthostelbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(
        name = "roommate_survey",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_roommate_survey_user", columnNames = "user_id")
        }
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RoommateSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ each user has only one survey
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // -------------------
    // Profile fields
    // -------------------
    @Column(name = "degree", length = 100)
    private String degree;

    @Column(name = "hometown", length = 100)
    private String hometown;

    @Column(name = "school", length = 120)
    private String school;

    // -------------------
    // Questionnaire fields
    // -------------------
    @Column(name = "preferred_study_time", length = 50, nullable = false)
    private String preferredStudyTime;

    @Column(name = "typical_sleep_time", length = 50, nullable = false)
    private String typicalSleepTime;

    @Column(name = "wake_up_time", length = 50, nullable = false)
    private String wakeUpTime;

    @Column(name = "cleanliness_preference", length = 50, nullable = false)
    private String cleanlinessPreference;

    @Column(name = "noise_tolerance", length = 50, nullable = false)
    private String noiseTolerance;

    @Column(name = "guest_frequency", length = 50, nullable = false)
    private String guestFrequency;

    @Column(name = "smoking_preference", length = 50, nullable = false)
    private String smokingPreference;

    @Column(name = "personality_type", length = 50, nullable = false)
    private String personalityType;

    @Column(name = "room_temp_preference", length = 50)
    private String roomTempPreference;

    @Column(name = "sharing_preference", length = 50)
    private String sharingPreference;

    public RoommateSurvey() {
    }

    public RoommateSurvey(User user) {
        this.user = user;
    }

    // -------------------
    // Getters / Setters
    // -------------------

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getHometown() {
        return hometown;
    }

    public void setHometown(String hometown) {
        this.hometown = hometown;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public String getPreferredStudyTime() {
        return preferredStudyTime;
    }

    public void setPreferredStudyTime(String preferredStudyTime) {
        this.preferredStudyTime = preferredStudyTime;
    }

    public String getTypicalSleepTime() {
        return typicalSleepTime;
    }

    public void setTypicalSleepTime(String typicalSleepTime) {
        this.typicalSleepTime = typicalSleepTime;
    }

    public String getWakeUpTime() {
        return wakeUpTime;
    }

    public void setWakeUpTime(String wakeUpTime) {
        this.wakeUpTime = wakeUpTime;
    }

    public String getCleanlinessPreference() {
        return cleanlinessPreference;
    }

    public void setCleanlinessPreference(String cleanlinessPreference) {
        this.cleanlinessPreference = cleanlinessPreference;
    }

    public String getNoiseTolerance() {
        return noiseTolerance;
    }

    public void setNoiseTolerance(String noiseTolerance) {
        this.noiseTolerance = noiseTolerance;
    }

    public String getGuestFrequency() {
        return guestFrequency;
    }

    public void setGuestFrequency(String guestFrequency) {
        this.guestFrequency = guestFrequency;
    }

    public String getSmokingPreference() {
        return smokingPreference;
    }

    public void setSmokingPreference(String smokingPreference) {
        this.smokingPreference = smokingPreference;
    }

    public String getPersonalityType() {
        return personalityType;
    }

    public void setPersonalityType(String personalityType) {
        this.personalityType = personalityType;
    }

    public String getRoomTempPreference() {
        return roomTempPreference;
    }

    public void setRoomTempPreference(String roomTempPreference) {
        this.roomTempPreference = roomTempPreference;
    }

    public String getSharingPreference() {
        return sharingPreference;
    }

    public void setSharingPreference(String sharingPreference) {
        this.sharingPreference = sharingPreference;
    }
}
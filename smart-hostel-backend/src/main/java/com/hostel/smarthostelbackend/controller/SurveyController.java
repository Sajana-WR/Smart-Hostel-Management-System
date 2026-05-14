package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.SurveyRequest;
import com.hostel.smarthostelbackend.entity.RoommateSurvey;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.RoommateSurveyRepository;
import com.hostel.smarthostelbackend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/survey")
@CrossOrigin(origins = "http://localhost:5173")
public class SurveyController {

    private final RoommateSurveyRepository surveyRepository;
    private final UserRepository userRepository;

    public SurveyController(RoommateSurveyRepository surveyRepository, UserRepository userRepository) {
        this.surveyRepository = surveyRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/submit")
    @Transactional
    public ResponseEntity<Map<String, Object>> submit(
            @Valid @RequestBody SurveyRequest request,
            Authentication authentication
    ) {
        // ✅ Require JWT for submit
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Token required");
        }

        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        // ✅ Upsert survey
        RoommateSurvey survey = surveyRepository.findByUser_Id(user.getId())
                .orElseGet(RoommateSurvey::new);

        survey.setUser(user);

        // Profile fields
        survey.setDegree(trim(request.getDegree()));
        survey.setHometown(trim(request.getHometown()));
        survey.setSchool(trim(request.getSchool()));

        // Questionnaire answers
        survey.setPreferredStudyTime(trim(request.getPreferredStudyTime()));
        survey.setTypicalSleepTime(trim(request.getTypicalSleepTime()));
        survey.setWakeUpTime(trim(request.getWakeUpTime()));
        survey.setCleanlinessPreference(trim(request.getCleanlinessPreference()));
        survey.setNoiseTolerance(trim(request.getNoiseTolerance()));
        survey.setGuestFrequency(trim(request.getGuestFrequency()));
        survey.setSmokingPreference(trim(request.getSmokingPreference()));
        survey.setPersonalityType(trim(request.getPersonalityType()));
        survey.setRoomTempPreference(trimOrNull(request.getRoomTempPreference()));
        survey.setSharingPreference(trimOrNull(request.getSharingPreference()));

        surveyRepository.save(survey);

        // ✅ Mark completed AFTER saving survey
        if (!user.isSurveyCompleted()) {
            user.setSurveyCompleted(true);
            userRepository.save(user);
        }

        return ResponseEntity.ok(Map.of(
                "message", "Survey saved successfully",
                "userId", user.getId(),
                "surveyCompleted", user.isSurveyCompleted()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMySurvey(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Token required");
        }

        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        RoommateSurvey survey = surveyRepository.findByUser_Id(user.getId()).orElse(null);

        Map<String, Object> data = new HashMap<>();
        if (survey != null) {
            data.put("degree", survey.getDegree());
            data.put("hometown", survey.getHometown());
            data.put("school", survey.getSchool());

            data.put("preferredStudyTime", survey.getPreferredStudyTime());
            data.put("typicalSleepTime", survey.getTypicalSleepTime());
            data.put("wakeUpTime", survey.getWakeUpTime());
            data.put("cleanlinessPreference", survey.getCleanlinessPreference());
            data.put("noiseTolerance", survey.getNoiseTolerance());
            data.put("guestFrequency", survey.getGuestFrequency());
            data.put("smokingPreference", survey.getSmokingPreference());
            data.put("personalityType", survey.getPersonalityType());
            data.put("roomTempPreference", survey.getRoomTempPreference());
            data.put("sharingPreference", survey.getSharingPreference());
        }

        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "surveyCompleted", user.isSurveyCompleted(),
                "data", data
        ));
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private String trimOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
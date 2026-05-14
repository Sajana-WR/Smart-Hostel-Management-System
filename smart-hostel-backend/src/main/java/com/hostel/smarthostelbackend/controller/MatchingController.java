package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.entity.RoomAllocation;
import com.hostel.smarthostelbackend.entity.RoommateSurvey;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.RoomAllocationRepository;
import com.hostel.smarthostelbackend.repository.RoommateSurveyRepository;
import com.hostel.smarthostelbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/matching")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchingController {

    private final RoommateSurveyRepository surveyRepository;
    private final UserRepository userRepository;
    private final RoomAllocationRepository allocationRepository;
    private final RestTemplate restTemplate;
    private final String aiBaseUrl;

    public MatchingController(RoommateSurveyRepository surveyRepository,
                              UserRepository userRepository,
                              RoomAllocationRepository allocationRepository,
                              RestTemplate restTemplate,
                              @Value("${ai.base-url:http://localhost:8000}") String aiBaseUrl) {
        this.surveyRepository = surveyRepository;
        this.userRepository = userRepository;
        this.allocationRepository = allocationRepository;
        this.restTemplate = restTemplate;
        this.aiBaseUrl = aiBaseUrl;
    }

    @GetMapping("/roommates/{userId}")
    public ResponseEntity<Map<String, Object>> findMatches(@PathVariable Long userId,
                                                           Authentication authentication) {

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        // Security check: user can only request their own matches (admin can request for anyone)
        if (authentication != null && authentication.getName() != null) {
            String principal = authentication.getName();

            // Allow admin to view any student's matches
            User requestingUser = userRepository.findByEmailIgnoreCase(principal).orElse(null);
            boolean isAdmin = requestingUser != null && "ADMIN".equalsIgnoreCase(requestingUser.getRole());

            boolean isOwnRequest = principal.equalsIgnoreCase(currentUser.getEmail())
                    || principal.equalsIgnoreCase(currentUser.getUsername());

            if (!isAdmin && !isOwnRequest) {
                throw new AppException(HttpStatus.FORBIDDEN, "Cannot request matches for another user");
            }
        }

        RoommateSurvey currentSurvey = surveyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Survey not found for user"));

        // ---- Candidate filtering rules ----
        final boolean BLOCK_IF_CURRENT_ALLOCATED = false;

        if (BLOCK_IF_CURRENT_ALLOCATED) {
            boolean currentAllocated = allocationRepository.existsActiveByUserId(userId, RoomAllocation.Status.ACTIVE);
            if (currentAllocated) {
                return ResponseEntity.ok(Map.of(
                        "preferences", buildPreferences(currentSurvey),
                        "matches", Collections.emptyList(),
                        "message", "You are already allocated to a room"
                ));
            }
        }

        // Build candidate list
        List<Map<String, Object>> others = new ArrayList<>();
        int totalSurveys = 0;
        int skippedAllocated = 0;
        final boolean SKIP_ALLOCATED_CANDIDATES = false;

        for (RoommateSurvey s : surveyRepository.findAll()) {
            if (s.getUser() == null) continue;

            totalSurveys++;

            Long candidateId = s.getUser().getId();
            if (candidateId == null) continue;
            if (candidateId.equals(userId)) continue;

            boolean allocated = allocationRepository.existsActiveByUserId(candidateId, RoomAllocation.Status.ACTIVE);
            if (allocated) skippedAllocated++;
            if (allocated && SKIP_ALLOCATED_CANDIDATES) continue;

            others.add(toSurveyPayload(s));
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("preferences", buildPreferences(currentSurvey));
        response.put("candidateCount", others.size());
        response.put("skippedAllocated", skippedAllocated);
        response.put("totalSurveys", totalSurveys);

        if (others.isEmpty()) {
            response.put("matches", Collections.emptyList());
            response.put("message", "No available candidates right now");
            return ResponseEntity.ok(response);
        }

        // Call AI
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("currentUser", toSurveyPayload(currentSurvey));
        request.put("others", others);

        Map<String, Object> aiResponse;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = restTemplate.postForObject(
                    aiBaseUrl + "/ai/roommate-match",
                    request,
                    Map.class
            );
            aiResponse = parsed;
        } catch (RestClientException ex) {
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Matching service unavailable: " + ex.getMessage());
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawMatches =
                (List<Map<String, Object>>) (aiResponse == null ? null : aiResponse.get("matches"));

        if (rawMatches == null) rawMatches = Collections.emptyList();

        // ---- Score filtering with fallback ----
        final int MIN_SCORE = 0;

        List<Map<String, Object>> enriched = enrich(rawMatches, MIN_SCORE);

        if (enriched.isEmpty() && MIN_SCORE > 0) {
            enriched = enrich(rawMatches, 0);
        }

        response.put("matches", enriched);
        return ResponseEntity.ok(response);
    }

    // ✅ AI Health Check
    @GetMapping("/ai-health")
    public ResponseEntity<Map<String, Object>> aiHealth() {
        try {
            String result = restTemplate.getForObject(aiBaseUrl + "/health", String.class);
            return ResponseEntity.ok(Map.of("status", "UP", "response", result != null ? result : "ok"));
        } catch (RestClientException ex) {
            return ResponseEntity.ok(Map.of("status", "DOWN", "error", ex.getMessage()));
        }
    }

    // Enrich AI matches with user info and apply min score filter
    private List<Map<String, Object>> enrich(List<Map<String, Object>> rawMatches, int minScore) {
        List<Map<String, Object>> out = new ArrayList<>();

        for (Map<String, Object> item : rawMatches) {
            Long matchUserId = toLong(item.get("userId"));
            Integer score = toInteger(item.get("score"));
            if (matchUserId == null) continue;

            int safeScore = (score == null ? 0 : score);
            if (safeScore < minScore) continue;

            User matched = userRepository.findById(matchUserId).orElse(null);
            if (matched == null) continue;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", matched.getId());
            row.put("fullName", matched.getFullName());
            row.put("username", matched.getUsername());
            row.put("score", safeScore);
            row.put("allocated", allocationRepository.existsActiveByUserId(matchUserId, RoomAllocation.Status.ACTIVE));

            out.add(row);
        }

        return out;
    }

    private Map<String, Object> toSurveyPayload(RoommateSurvey survey) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", survey.getUser().getId());
        data.put("preferredStudyTime", survey.getPreferredStudyTime());
        data.put("typicalSleepTime", survey.getTypicalSleepTime());
        data.put("wakeUpTime", safeGet(survey::getWakeUpTime));
        data.put("cleanlinessPreference", survey.getCleanlinessPreference());
        data.put("noiseTolerance", survey.getNoiseTolerance());
        data.put("guestFrequency", safeGet(survey::getGuestFrequency));
        data.put("smokingPreference", survey.getSmokingPreference());
        data.put("personalityType", survey.getPersonalityType());
        return data;
    }

    private Map<String, Object> buildPreferences(RoommateSurvey survey) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("preferredStudyTime", survey.getPreferredStudyTime());
        data.put("typicalSleepTime", survey.getTypicalSleepTime());
        data.put("wakeUpTime", safeGet(survey::getWakeUpTime));
        data.put("cleanlinessPreference", survey.getCleanlinessPreference());
        data.put("noiseTolerance", survey.getNoiseTolerance());
        data.put("guestFrequency", safeGet(survey::getGuestFrequency));
        data.put("smokingPreference", survey.getSmokingPreference());
        data.put("personalityType", survey.getPersonalityType());
        return data;
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try { return Long.parseLong(value.toString()); }
        catch (NumberFormatException e) { return null; }
    }

    private Integer toInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        try { return Integer.parseInt(value.toString()); }
        catch (NumberFormatException e) { return null; }
    }

    private Object safeGet(SupplierLike supplier) {
        try { return supplier.get(); }
        catch (Exception e) { return null; }
    }

    @FunctionalInterface
    private interface SupplierLike {
        Object get();
    }
}
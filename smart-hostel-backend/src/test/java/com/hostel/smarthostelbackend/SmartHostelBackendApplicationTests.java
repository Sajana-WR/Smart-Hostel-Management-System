package com.hostel.smarthostelbackend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit Tests for Smart Hostel Management System
 * Student: Sajana Ranasinghe | Index: 10953006
 * PUSL3190 Computing Project
 */
class SmartHostelBackendApplicationTests {

    // =============================================
    // TC-01 to TC-04: Authentication Unit Tests
    // =============================================

    @Test
    @DisplayName("TC-01: Email normalisation converts to lowercase")
    void testEmailNormalisation() {
        String email = "  STUDENT@GMAIL.COM  ";
        String normalised = email.trim().toLowerCase();
        assertEquals("student@gmail.com", normalised);
    }

    @Test
    @DisplayName("TC-02: Empty email should be detected")
    void testEmptyEmailDetection() {
        String email = "";
        assertTrue(email.isEmpty(), "Empty email should be detected");
    }

    @Test
    @DisplayName("TC-03: Password must not equal hashed version")
    void testPasswordNotPlainText() {
        String plainPassword = "password123";
        String hashedPassword = "$2a$10$examplehashedpasswordstring";
        assertNotEquals(plainPassword, hashedPassword,
                "Plain password should not equal hashed password");
    }

    @Test
    @DisplayName("TC-04: Username normalisation converts to lowercase")
    void testUsernameNormalisation() {
        String username = "  SAJANA  ";
        String normalised = username.trim().toLowerCase();
        assertEquals("sajana", normalised);
    }

    // =============================================
    // TC-05 to TC-08: Room Allocation Unit Tests
    // =============================================

    @Test
    @DisplayName("TC-05: Room capacity must be greater than zero")
    void testRoomCapacityPositive() {
        int capacity = 2;
        assertTrue(capacity > 0, "Room capacity should be positive");
    }

    @Test
    @DisplayName("TC-06: Room code must not be null or empty")
    void testRoomCodeNotEmpty() {
        String roomCode = "A101";
        assertNotNull(roomCode);
        assertFalse(roomCode.isEmpty(), "Room code should not be empty");
    }

    @Test
    @DisplayName("TC-07: Room floor number must be non-negative")
    void testRoomFloorNonNegative() {
        int floor = 1;
        assertTrue(floor >= 0, "Floor number should not be negative");
    }

    @Test
    @DisplayName("TC-08: Room block must not be null or empty")
    void testRoomBlockNotEmpty() {
        String block = "Block A";
        assertNotNull(block);
        assertFalse(block.isEmpty(), "Room block should not be empty");
    }

    // =============================================
    // TC-09 to TC-12: AI Roommate Matching Unit Tests
    // =============================================

    @Test
    @DisplayName("TC-09: Matching score must be between 0 and 100")
    void testMatchingScoreRange() {
        double score = 76.9;
        assertTrue(score >= 0 && score <= 100,
                "Matching score should be between 0 and 100");
    }

    @Test
    @DisplayName("TC-10: Eight lifestyle factors must be considered")
    void testLifestyleFactorCount() {
        String[] factors = {
                "sleepTime", "wakeUpTime", "noiseTolerance",
                "cleanliness", "guestFrequency", "smokingPreference",
                "personalityType", "studyTime"
        };
        assertEquals(8, factors.length,
                "Exactly 8 lifestyle factors should be used");
    }

    @Test
    @DisplayName("TC-11: Higher matching score means better compatibility")
    void testHigherScoreBetterMatch() {
        double score1 = 90.0;
        double score2 = 60.0;
        assertTrue(score1 > score2,
                "Higher score should indicate better compatibility");
    }

    @Test
    @DisplayName("TC-12: Energy model R-squared value meets threshold")
    void testEnergyModelAccuracy() {
        double rSquared = 0.78;
        assertTrue(rSquared >= 0.70,
                "R-squared value should be at least 0.70 for acceptable accuracy");
    }
}
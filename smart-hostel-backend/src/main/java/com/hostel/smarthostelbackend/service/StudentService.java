package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.dto.StudentProfileResponse;
import com.hostel.smarthostelbackend.entity.RoommateSurvey;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final RoommateSurveyRepository surveyRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final RoommateRequestRepository roommateRequestRepository;
    private final MealOrderRepository mealOrderRepository;
    private final RoomAllocationRepository roomAllocationRepository;

    public StudentService(UserRepository userRepository,
                          RoommateSurveyRepository surveyRepository,
                          NotificationRepository notificationRepository,
                          PaymentRepository paymentRepository,
                          ComplaintRepository complaintRepository,
                          RoommateRequestRepository roommateRequestRepository,
                          MealOrderRepository mealOrderRepository,
                          RoomAllocationRepository roomAllocationRepository) {
        this.userRepository = userRepository;
        this.surveyRepository = surveyRepository;
        this.notificationRepository = notificationRepository;
        this.paymentRepository = paymentRepository;
        this.complaintRepository = complaintRepository;
        this.roommateRequestRepository = roommateRequestRepository;
        this.mealOrderRepository = mealOrderRepository;
        this.roomAllocationRepository = roomAllocationRepository;
    }

    // STUDENT-FACING
    public StudentProfileResponse getMyProfile(String email) {
        User user = findUserByEmail(email);
        RoommateSurvey survey = surveyRepository.findByUser_Id(user.getId()).orElse(null);
        return toProfileResponse(user, survey);
    }

    @Transactional
    public StudentProfileResponse updateMyProfile(String email, String fullName,
                                                  String degree, String hometown, String school) {
        User user = findUserByEmail(email);
        user.setFullName(trim(fullName));
        User savedUser = userRepository.save(user);
        RoommateSurvey survey = surveyRepository.findByUser_Id(savedUser.getId()).orElse(null);
        if (survey != null) {
            survey.setDegree(trim(degree));
            survey.setHometown(trim(hometown));
            survey.setSchool(trim(school));
            surveyRepository.save(survey);
        } else {
            survey = new RoommateSurvey();
            survey.setUser(savedUser);
            survey.setDegree(trim(degree));
            survey.setHometown(trim(hometown));
            survey.setSchool(trim(school));
            surveyRepository.save(survey);
        }
        return toProfileResponse(savedUser, survey);
    }

    // ADMIN-FACING
    public List<StudentProfileResponse> getAllStudents() {
        return userRepository.findAllStudents().stream()
                .map(user -> {
                    RoommateSurvey survey = surveyRepository.findByUser_Id(user.getId()).orElse(null);
                    return toProfileResponse(user, survey);
                })
                .collect(Collectors.toList());
    }

    public StudentProfileResponse getStudentById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + id));
        RoommateSurvey survey = surveyRepository.findByUser_Id(user.getId()).orElse(null);
        return toProfileResponse(user, survey);
    }

    public List<StudentProfileResponse> searchStudents(String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return userRepository.findAllStudents().stream()
                .filter(u -> u.getFullName().toLowerCase().contains(lowerKeyword)
                        || u.getEmail().toLowerCase().contains(lowerKeyword)
                        || u.getUsername().toLowerCase().contains(lowerKeyword))
                .map(user -> {
                    RoommateSurvey survey = surveyRepository.findByUser_Id(user.getId()).orElse(null);
                    return toProfileResponse(user, survey);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentProfileResponse adminUpdateStudent(Long id, String fullName,
                                                     String degree, String hometown, String school) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + id));
        user.setFullName(trim(fullName));
        User savedUser = userRepository.save(user);
        RoommateSurvey survey = surveyRepository.findByUser_Id(savedUser.getId()).orElse(null);
        if (survey != null) {
            survey.setDegree(trim(degree));
            survey.setHometown(trim(hometown));
            survey.setSchool(trim(school));
            surveyRepository.save(survey);
        } else {
            survey = new RoommateSurvey();
            survey.setUser(savedUser);
            survey.setDegree(trim(degree));
            survey.setHometown(trim(hometown));
            survey.setSchool(trim(school));
            surveyRepository.save(survey);
        }
        return toProfileResponse(savedUser, survey);
    }

    // ─────────────────────────────────────────────────────────
    // DELETE STUDENT — deletes all related records first
    // ─────────────────────────────────────────────────────────
    @Transactional
    public void deleteStudent(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "Student not found with id: " + id));
        Long uid = user.getId();

        // 1. Notifications
        try {
            notificationRepository.deleteAll(
                    notificationRepository.findAllForUser(uid));
        } catch (Exception e) {
            System.out.println("Notifications skip: " + e.getMessage());
        }

        // 2. Payments
        try {
            paymentRepository.deleteAll(
                    paymentRepository.findByUserId(uid));
        } catch (Exception e) {
            System.out.println("Payments skip: " + e.getMessage());
        }

        // 3. Complaints
        try {
            complaintRepository.deleteAll(
                    complaintRepository.findByUserId(uid));
        } catch (Exception e) {
            System.out.println("Complaints skip: " + e.getMessage());
        }

        // 4. Roommate requests
        try {
            roommateRequestRepository.deleteAll(
                    roommateRequestRepository.findByRequesterId(uid));
            roommateRequestRepository.deleteAll(
                    roommateRequestRepository.findByRequestedId(uid));
        } catch (Exception e) {
            System.out.println("Requests skip: " + e.getMessage());
        }

        // 5. Meal orders
        try {
            mealOrderRepository.deleteAll(
                    mealOrderRepository.findByStudentId(uid));
        } catch (Exception e) {
            System.out.println("MealOrders skip: " + e.getMessage());
        }

        // 6. Room allocations
        try {
            roomAllocationRepository.deleteAll(
                    roomAllocationRepository
                            .findByStudent1IdOrStudent2Id(uid, uid));
        } catch (Exception e) {
            System.out.println("Allocations skip: " + e.getMessage());
        }

        // 7. Roommate survey
        try {
            surveyRepository.findByUser_Id(uid)
                    .ifPresent(surveyRepository::delete);
        } catch (Exception e) {
            System.out.println("Survey skip: " + e.getMessage());
        }

        // 8. Delete student
        userRepository.delete(user);
        System.out.println("Student deleted: " + user.getEmail());
    }

    @Transactional
    public StudentProfileResponse changeRole(Long id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "Student not found with id: " + id));
        user.setRole(newRole.toUpperCase());
        User savedUser = userRepository.save(user);
        RoommateSurvey survey = surveyRepository.findByUser_Id(savedUser.getId()).orElse(null);
        return toProfileResponse(savedUser, survey);
    }

    public long countStudents() {
        return userRepository.findAllStudents().size();
    }

    public long countByRole(String role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole().equalsIgnoreCase(role))
                .count();
    }

    @Transactional
    public void updateRoomPreference(String email, String preference) {
        User user = findUserByEmail(email);
        user.setRoomTypePreference(preference);
        userRepository.save(user);
    }

    // PRIVATE HELPERS
    private User findUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AppException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    private StudentProfileResponse toProfileResponse(User user, RoommateSurvey survey) {
        StudentProfileResponse r = new StudentProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getUsername(),
                user.getRole(),
                user.getStatus(),
                user.getRoomTypePreference(),
                survey != null ? survey.getDegree()   : null,
                survey != null ? survey.getHometown() : null,
                survey != null ? survey.getSchool()   : null,
                user.isSurveyCompleted()
        );
        if (survey != null) {
            r.setPreferredStudyTime(survey.getPreferredStudyTime());
            r.setTypicalSleepTime(survey.getTypicalSleepTime());
            r.setWakeUpTime(survey.getWakeUpTime());
            r.setCleanlinessPreference(survey.getCleanlinessPreference());
            r.setNoiseTolerance(survey.getNoiseTolerance());
            r.setGuestFrequency(survey.getGuestFrequency());
            r.setSmokingPreference(survey.getSmokingPreference());
            r.setPersonalityType(survey.getPersonalityType());
            r.setRoomTempPreference(survey.getRoomTempPreference());
            r.setSharingPreference(survey.getSharingPreference());
        }
        return r;
    }

    private String trim(String v) {
        return v == null ? null : v.trim();
    }
}
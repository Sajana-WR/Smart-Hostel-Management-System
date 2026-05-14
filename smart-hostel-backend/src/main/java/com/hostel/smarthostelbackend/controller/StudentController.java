package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.dto.StudentProfileResponse;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.service.StudentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // ═══════════════════════════════════════════════
    //  STUDENT-FACING ENDPOINTS (JWT required)
    // ═══════════════════════════════════════════════

    // ✅ GET MY PROFILE — returns status so frontend can show pending/rejected screen
    @GetMapping("/me")
    public ResponseEntity<StudentProfileResponse> getMyProfile(Authentication authentication) {
        validateAuth(authentication);
        return ResponseEntity.ok(studentService.getMyProfile(authentication.getName()));
    }

    // ✅ UPDATE ROOM TYPE PREFERENCE (Student, while PENDING)
    @PutMapping("/me/room-preference")
    public ResponseEntity<ApiMessage> updateRoomPreference(
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication) {
        validateAuth(authentication);

        String preference = body.get("roomTypePreference");
        if (preference == null || (!preference.equals("SINGLE") && !preference.equals("DOUBLE"))) {
            return ResponseEntity.badRequest().body(new ApiMessage("Invalid room type. Use SINGLE or DOUBLE"));
        }

        studentService.updateRoomPreference(authentication.getName(), preference);
        return ResponseEntity.ok(new ApiMessage("Room preference updated to " + preference));
    }

    // ✅ UPDATE MY PROFILE
    @PutMapping("/me")
    public ResponseEntity<StudentProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest req,
            Authentication authentication) {
        validateAuth(authentication);
        StudentProfileResponse response = studentService.updateMyProfile(
                authentication.getName(),
                req.getFullName(),
                req.getDegree(),
                req.getHometown(),
                req.getSchool()
        );
        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════
    //  ADMIN-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ GET ALL STUDENTS (Admin)
    @GetMapping("/admin/all")
    public ResponseEntity<List<StudentProfileResponse>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // ✅ GET SINGLE STUDENT BY ID (Admin)
    @GetMapping("/admin/{id}")
    public ResponseEntity<StudentProfileResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // ✅ SEARCH STUDENTS (Admin)
    @GetMapping("/admin/search")
    public ResponseEntity<List<StudentProfileResponse>> searchStudents(
            @RequestParam String keyword) {
        return ResponseEntity.ok(studentService.searchStudents(keyword));
    }

    // ✅ UPDATE STUDENT (Admin)
    @PutMapping("/admin/{id}")
    public ResponseEntity<StudentProfileResponse> adminUpdateStudent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest req) {
        StudentProfileResponse response = studentService.adminUpdateStudent(
                id,
                req.getFullName(),
                req.getDegree(),
                req.getHometown(),
                req.getSchool()
        );
        return ResponseEntity.ok(response);
    }

    // ✅ DELETE STUDENT (Admin)
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiMessage> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(new ApiMessage("Student deleted successfully"));
    }

    // ✅ CHANGE ROLE (Admin)
    @PutMapping("/admin/{id}/role")
    public ResponseEntity<StudentProfileResponse> changeRole(
            @PathVariable Long id,
            @RequestParam String role) {
        return ResponseEntity.ok(studentService.changeRole(id, role));
    }

    // ✅ COUNT STUDENTS (Admin Dashboard)
    @GetMapping("/admin/count")
    public ResponseEntity<Long> countStudents() {
        return ResponseEntity.ok(studentService.countStudents());
    }

    // ═══════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════

    private void validateAuth(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Token required");
        }
    }

    // ✅ Request DTO for update
    public static class UpdateProfileRequest {

        @NotBlank(message = "Full name is required")
        @Size(max = 120, message = "Full name is too long")
        private String fullName;

        private String degree;
        private String hometown;
        private String school;

        public String getFullName()  { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getDegree()    { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getHometown()  { return hometown; }
        public void setHometown(String hometown) { this.hometown = hometown; }

        public String getSchool()    { return school; }
        public void setSchool(String school) { this.school = school; }
    }
}
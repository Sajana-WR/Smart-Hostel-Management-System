package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/approvals")
@PreAuthorize("hasRole('ADMIN')")
public class AdminApprovalController {

    private final UserRepository userRepository;

    public AdminApprovalController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // GET /api/admin/approvals/pending
    // Returns all students with status = PENDING
    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingStudents() {
        List<User> pending = userRepository.findByRoleAndStatus("STUDENT", "PENDING");
        return ResponseEntity.ok(pending);
    }

    // GET /api/admin/approvals/all
    // Returns all students with any status (for history view)
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllStudentStatuses() {
        List<User> all = userRepository.findByRole("STUDENT");
        return ResponseEntity.ok(all);
    }

    // PUT /api/admin/approvals/{id}/approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiMessage> approveStudent(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (!"STUDENT".equals(user.getRole())) {
            return ResponseEntity.badRequest().body(new ApiMessage("Only students can be approved"));
        }

        user.setStatus("APPROVED");
        userRepository.save(user);
        return ResponseEntity.ok(new ApiMessage("Student approved successfully"));
    }

    // PUT /api/admin/approvals/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiMessage> rejectStudent(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (!"STUDENT".equals(user.getRole())) {
            return ResponseEntity.badRequest().body(new ApiMessage("Only students can be rejected"));
        }

        user.setStatus("REJECTED");
        userRepository.save(user);
        return ResponseEntity.ok(new ApiMessage("Student rejected"));
    }
}
package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.dto.ComplaintRequestDTO;
import com.hostel.smarthostelbackend.dto.ComplaintResponseDTO;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.hostel.smarthostelbackend.security.JwtAuthenticationFilter.AuthPrincipal;
import com.hostel.smarthostelbackend.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepo;

    public ComplaintController(ComplaintService complaintService,
                               UserRepository userRepo) {
        this.complaintService = complaintService;
        this.userRepo         = userRepo;
    }

    // ═══════════════════════════════════════════════
    //  STUDENT-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ Submit complaint
    @PostMapping("/submit")
    public ResponseEntity<?> submitComplaint(@RequestBody ComplaintRequestDTO request) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(complaintService.submitComplaint(user, request));
    }

    // ✅ Get my complaints
    @GetMapping("/my-complaints")
    public ResponseEntity<?> getMyComplaints() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(complaintService.getMyComplaints(user.getId()));
    }

    // ✅ Get complaint by ID (student or admin)
    @GetMapping("/{complaintId}")
    public ResponseEntity<?> getComplaint(@PathVariable Long complaintId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(complaintService.getComplaintById(complaintId, user));
    }

    // ═══════════════════════════════════════════════
    //  ADMIN-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ Get ALL complaints (Admin)
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllComplaints() {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    // ✅ Filter by status (Admin)
    @GetMapping("/admin/by-status")
    public ResponseEntity<?> getByStatus(@RequestParam String status) {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(complaintService.getComplaintsByStatus(status));
    }

    // ✅ Filter by category (Admin)
    @GetMapping("/admin/by-category")
    public ResponseEntity<?> getByCategory(@RequestParam String category) {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(complaintService.getComplaintsByCategory(category));
    }

    // ✅ Update status + admin response (Admin)
    @PutMapping("/admin/update/{complaintId}")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable Long complaintId,
                                                   @RequestBody Map<String, Object> body) {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }

        String status        = (String) body.get("status");
        String adminResponse = (String) body.get("adminResponse");

        return ResponseEntity.ok(complaintService.updateComplaintStatus(complaintId, status, adminResponse));
    }

    // ✅ Quick resolve (Admin)
    @PutMapping("/admin/{complaintId}/resolve")
    public ResponseEntity<ComplaintResponseDTO> resolveComplaint(
            @PathVariable Long complaintId,
            @RequestBody(required = false) Map<String, String> body) {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        String adminResponse = (body != null) ? body.get("adminResponse") : null;
        return ResponseEntity.ok(complaintService.resolveComplaint(complaintId, adminResponse));
    }

    // ✅ Quick reject (Admin)
    @PutMapping("/admin/{complaintId}/reject")
    public ResponseEntity<ComplaintResponseDTO> rejectComplaint(
            @PathVariable Long complaintId,
            @RequestBody(required = false) Map<String, String> body) {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        String adminResponse = (body != null) ? body.get("adminResponse") : null;
        return ResponseEntity.ok(complaintService.rejectComplaint(complaintId, adminResponse));
    }

    // ✅ Mark in-progress (Admin)
    @PutMapping("/admin/{complaintId}/in-progress")
    public ResponseEntity<ComplaintResponseDTO> markInProgress(
            @PathVariable Long complaintId,
            @RequestBody(required = false) Map<String, String> body) {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        String adminResponse = (body != null) ? body.get("adminResponse") : null;
        return ResponseEntity.ok(complaintService.markInProgress(complaintId, adminResponse));
    }

    // ✅ Delete complaint (Admin)
    @DeleteMapping("/admin/{complaintId}")
    public ResponseEntity<ApiMessage> deleteComplaint(@PathVariable Long complaintId) {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        complaintService.deleteComplaint(complaintId);
        return ResponseEntity.ok(new ApiMessage("Complaint deleted successfully"));
    }

    // ✅ Complaint analytics (Admin Dashboard)
    @GetMapping("/admin/analytics")
    public ResponseEntity<?> getAnalytics() {
        User user = getAuthenticatedUser();
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(complaintService.getComplaintAnalytics());
    }

    // ═══════════════════════════════════════════════
    //  HELPER
    // ═══════════════════════════════════════════════

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object principal = auth.getPrincipal();

        if (principal instanceof AuthPrincipal ap) {
            return userRepo.findByEmailIgnoreCase(ap.getEmail()).orElse(null);
        }

        String email = principal.toString();
        return userRepo.findByEmailIgnoreCase(email).orElse(null);
    }
}
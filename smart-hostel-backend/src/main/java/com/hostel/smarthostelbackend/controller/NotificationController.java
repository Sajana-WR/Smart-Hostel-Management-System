package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.hostel.smarthostelbackend.security.JwtAuthenticationFilter.AuthPrincipal;
import com.hostel.smarthostelbackend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepo;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepo) {
        this.notificationService = notificationService;
        this.userRepo            = userRepo;
    }

    // ═══════════════════════════════════════════════
    //  STUDENT-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ Get my notifications
    @GetMapping("/my")
    public ResponseEntity<?> getMyNotifications() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(notificationService.getMyNotifications(user.getId()));
    }

    // ✅ Count unread notifications
    @GetMapping("/my/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.countUnread(user.getId())));
    }

    // ✅ Mark one as read
    @PutMapping("/my/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(new ApiMessage("Marked as read"));
    }

    // ✅ Mark all as read
    @PutMapping("/my/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(new ApiMessage("All notifications marked as read"));
    }

    // ═══════════════════════════════════════════════
    //  ADMIN-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ Send notification (Admin)
    @PostMapping("/admin/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, String> body) {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.sendNotification(
                admin,
                body.get("title"),
                body.get("message"),
                body.get("type"),
                body.get("target")
        ));
    }

    // ✅ Save as draft (Admin)
    @PostMapping("/admin/draft")
    public ResponseEntity<?> saveDraft(@RequestBody Map<String, String> body) {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.saveDraft(
                admin,
                body.get("title"),
                body.get("message"),
                body.get("type"),
                body.get("target")
        ));
    }

    // ✅ Send a draft (Admin)
    @PutMapping("/admin/draft/{id}/send")
    public ResponseEntity<?> sendDraft(@PathVariable Long id) {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.sendDraft(id, admin));
    }

    // ✅ Get ALL notifications (Admin)
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllNotifications() {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // ✅ Get notification by ID (Admin)
    @GetMapping("/admin/{id}")
    public ResponseEntity<?> getNotificationById(@PathVariable Long id) {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    // ✅ Filter by status (Admin)
    @GetMapping("/admin/by-status")
    public ResponseEntity<?> getByStatus(@RequestParam String status) {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.getByStatus(status));
    }

    // ✅ Filter by type (Admin)
    @GetMapping("/admin/by-type")
    public ResponseEntity<?> getByType(@RequestParam String type) {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.getByType(type));
    }

    // ✅ Delete notification (Admin)
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiMessage("Notification deleted successfully"));
    }

    // ✅ Analytics (Admin Dashboard)
    @GetMapping("/admin/analytics")
    public ResponseEntity<?> getAnalytics() {
        User admin = getAuthenticatedUser();
        if (admin == null || !admin.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }
        return ResponseEntity.ok(notificationService.getAnalytics());
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
package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.entity.Complaint;
import com.hostel.smarthostelbackend.entity.Payment;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.hostel.smarthostelbackend.security.JwtAuthenticationFilter.AuthPrincipal;
import com.hostel.smarthostelbackend.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final StudentService studentService;
    private final PaymentService paymentService;
    private final ComplaintService complaintService;
    private final CanteenService canteenService;
    private final NotificationService notificationService;
    private final EnergyService energyService;
    private final RoomService roomService;
    private final UserRepository userRepo;

    public DashboardController(StudentService studentService,
                               PaymentService paymentService,
                               ComplaintService complaintService,
                               CanteenService canteenService,
                               NotificationService notificationService,
                               EnergyService energyService,
                               RoomService roomService,
                               UserRepository userRepo) {
        this.studentService      = studentService;
        this.paymentService      = paymentService;
        this.complaintService    = complaintService;
        this.canteenService      = canteenService;
        this.notificationService = notificationService;
        this.energyService       = energyService;
        this.roomService         = roomService;
        this.userRepo            = userRepo;
    }

    // ═══════════════════════════════════════════════
    //  ADMIN DASHBOARD — Single API for all stats
    // ═══════════════════════════════════════════════

    /**
     * GET /api/dashboard/admin/stats
     * Returns all dashboard stats in one call for the admin portal.
     * This avoids multiple API calls from the frontend.
     */
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getAdminDashboardStats() {
        User admin = getAdmin();
        if (admin == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }

        Map<String, Object> stats = new HashMap<>();

        // ── Student Stats ──
        Map<String, Object> studentStats = new HashMap<>();
        studentStats.put("totalStudents",  studentService.countStudents());
        studentStats.put("totalAdmins",    studentService.countByRole("ADMIN"));
        studentStats.put("totalStaff",     studentService.countByRole("CANTEEN_STAFF"));
        stats.put("students", studentStats);

        // ── Payment Stats ──
        try {
            stats.put("payments", paymentService.getFinancialSummary());
        } catch (Exception e) {
            stats.put("payments", Map.of("error", "Could not load payment stats"));
        }

        // ── Complaint Stats ──
        try {
            stats.put("complaints", complaintService.getComplaintAnalytics());
        } catch (Exception e) {
            stats.put("complaints", Map.of("error", "Could not load complaint stats"));
        }

        // ── Canteen Stats ──
        try {
            stats.put("canteen", canteenService.getCanteenAnalytics());
        } catch (Exception e) {
            stats.put("canteen", Map.of("error", "Could not load canteen stats"));
        }

        // ── Notification Stats ──
        try {
            stats.put("notifications", notificationService.getAnalytics());
        } catch (Exception e) {
            stats.put("notifications", Map.of("error", "Could not load notification stats"));
        }

        // ── Energy Stats ──
        try {
            stats.put("energy", energyService.getAnalytics());
        } catch (Exception e) {
            stats.put("energy", Map.of("error", "Could not load energy stats"));
        }

        // ── Quick Summary (top-level numbers for cards) ──
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalStudents",     studentService.countStudents());
        summary.put("openComplaints",    complaintService.countByStatus(Complaint.Status.PENDING));
        summary.put("pendingPayments",   paymentService.countByStatus(Payment.Status.PENDING));
        summary.put("totalPayments",     paymentService.countPayments());
        stats.put("summary", summary);

        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/dashboard/admin/quick
     * Quick stats only — lightweight call for dashboard cards.
     */
    @GetMapping("/admin/quick")
    public ResponseEntity<Map<String, Object>> getQuickStats() {
        User admin = getAdmin();
        if (admin == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin access required"));
        }

        Map<String, Object> quick = new HashMap<>();
        quick.put("totalStudents",   studentService.countStudents());
        quick.put("openComplaints",  complaintService.countByStatus(Complaint.Status.PENDING));
        quick.put("pendingPayments", paymentService.countByStatus(Payment.Status.PENDING));
        quick.put("totalPayments",   paymentService.countPayments());
        quick.put("totalOrders",     canteenService.getAllOrders().size());

        return ResponseEntity.ok(quick);
    }

    // ═══════════════════════════════════════════════
    //  HELPER
    // ═══════════════════════════════════════════════

    private User getAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;

        Object principal = auth.getPrincipal();
        String email;

        if (principal instanceof AuthPrincipal ap) {
            email = ap.getEmail();
        } else {
            email = principal.toString();
        }

        User user = userRepo.findByEmailIgnoreCase(email).orElse(null);
        if (user == null || !user.getRole().equalsIgnoreCase("ADMIN")) return null;
        return user;
    }
}
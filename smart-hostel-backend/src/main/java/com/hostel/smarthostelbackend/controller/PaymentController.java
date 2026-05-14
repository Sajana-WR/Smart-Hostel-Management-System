package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.CreatePaymentRequest;
import com.hostel.smarthostelbackend.dto.PaymentResponse;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.hostel.smarthostelbackend.security.JwtAuthenticationFilter.AuthPrincipal;
import com.hostel.smarthostelbackend.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepo;

    public PaymentController(PaymentService paymentService,
                             UserRepository userRepo) {
        this.paymentService = paymentService;
        this.userRepo       = userRepo;
    }

    // ═══════════════════════════════════════════════
    //  STUDENT-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ GET payment info (room code, amount, already paid)
    @GetMapping("/info/{userId}")
    public ResponseEntity<?> getPaymentInfo(@PathVariable Long userId) {
        User authUser = getAuthenticatedUser();
        if (authUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        if (!authUser.getId().equals(userId) && !authUser.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        return ResponseEntity.ok(paymentService.getPaymentInfo(userId));
    }

    // ✅ Create Stripe PaymentIntent
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent() {
        User authUser = getAuthenticatedUser();
        if (authUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(paymentService.createPaymentIntent(authUser));
    }

    // ✅ Record payment after Stripe confirmation
    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody CreatePaymentRequest req) {
        User authUser = getAuthenticatedUser();
        if (authUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        Map<String, Object> result = paymentService.createPayment(
                authUser, req.monthYear, req.amount, req.method, req.stripePaymentIntentId
        );
        return ResponseEntity.ok(result);
    }

    // ✅ Student payment history
    @GetMapping("/my/{userId}")
    public ResponseEntity<?> myPayments(@PathVariable Long userId) {
        User authUser = getAuthenticatedUser();
        if (authUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        if (!authUser.getId().equals(userId) && !authUser.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
    }

    // ═══════════════════════════════════════════════
    //  ADMIN-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ Get ALL payments (Admin)
    @GetMapping("/admin/all")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // ✅ Get single payment by ID (Admin)
    @GetMapping("/admin/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    // ✅ Verify/approve a pending payment (Admin)
    @PutMapping("/admin/{id}/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.verifyPayment(id));
    }

    // ✅ Reject/fail a payment (Admin)
    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<PaymentResponse> rejectPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.rejectPayment(id));
    }

    // ✅ Filter payments by status (Admin)
    @GetMapping("/admin/by-status")
    public ResponseEntity<List<PaymentResponse>> getByStatus(@RequestParam String status) {
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
    }

    // ✅ Filter payments by month (Admin)
    @GetMapping("/admin/by-month")
    public ResponseEntity<List<PaymentResponse>> getByMonth(@RequestParam String monthYear) {
        return ResponseEntity.ok(paymentService.getPaymentsByMonth(monthYear));
    }

    // ✅ Financial summary/dashboard (Admin)
    @GetMapping("/admin/summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        return ResponseEntity.ok(paymentService.getFinancialSummary());
    }

    // ✅ Count payments (Admin Dashboard)
    @GetMapping("/admin/count")
    public ResponseEntity<Long> countPayments() {
        return ResponseEntity.ok(paymentService.countPayments());
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
package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.dto.PaymentResponse;
import com.hostel.smarthostelbackend.entity.Payment;
import com.hostel.smarthostelbackend.entity.RoomAllocation;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.PaymentRepository;
import com.hostel.smarthostelbackend.repository.RoomAllocationRepository;
import com.hostel.smarthostelbackend.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final BigDecimal DEFAULT_MONTHLY_FEE = new BigDecimal("18500.00");
    private static final Long STRIPE_AMOUNT = 1850000L; // Rs. 18,500 in cents

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;
    private final RoomAllocationRepository allocRepo;

    public PaymentService(PaymentRepository paymentRepo,
                          UserRepository userRepo,
                          RoomAllocationRepository allocRepo) {
        this.paymentRepo = paymentRepo;
        this.userRepo    = userRepo;
        this.allocRepo   = allocRepo;
    }

    // ──────────────────────────────────────────────
    // STUDENT-FACING
    // ──────────────────────────────────────────────

    /**
     * Get payment info for a user (room code, amount, already paid status).
     */
    public Map<String, Object> getPaymentInfo(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        String roomCode  = getRoomCode(userId);
        String monthYear = currentMonthYear();
        boolean alreadyPaid = paymentRepo.existsByUser_IdAndMonthYear(userId, monthYear);

        Map<String, Object> info = new HashMap<>();
        info.put("roomCode",             roomCode != null ? roomCode : "");
        info.put("amount",               DEFAULT_MONTHLY_FEE);
        info.put("monthYear",            monthYear);
        info.put("alreadyPaidThisMonth", alreadyPaid);
        return info;
    }

    /**
     * Create Stripe PaymentIntent.
     */
    public Map<String, String> createPaymentIntent(User authUser) {
        String monthYear = currentMonthYear();

        if (paymentRepo.existsByUser_IdAndMonthYear(authUser.getId(), monthYear)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Payment already exists for this month");
        }

        try {
            Stripe.apiKey = stripeSecretKey;

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(STRIPE_AMOUNT)
                    .setCurrency("lkr")
                    .setDescription("Hostel Room Payment - " + authUser.getEmail() + " - " + monthYear)
                    .putMetadata("userId",    authUser.getId().toString())
                    .putMetadata("monthYear", monthYear)
                    .putMetadata("email",     authUser.getEmail())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret",    intent.getClientSecret());
            response.put("paymentIntentId", intent.getId());
            return response;

        } catch (StripeException e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe error: " + e.getMessage());
        }
    }

    /**
     * Record a payment after Stripe confirmation.
     * ✅ FIXED: Card payments (Stripe verified) → PAID automatically
     *           Cash/Bank Transfer → PENDING for admin verification
     */
    @Transactional
    public Map<String, Object> createPayment(User authUser,
                                             String monthYear,
                                             BigDecimal amount,
                                             String method,
                                             String stripePaymentIntentId) {
        Long userId = authUser.getId();

        if (monthYear == null || amount == null || method == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Missing required fields");
        }

        if (paymentRepo.existsByUser_IdAndMonthYear(userId, monthYear)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Payment already exists for this month");
        }

        // Verify Stripe payment for card payments
        if ("CARD".equalsIgnoreCase(method) && stripePaymentIntentId != null) {
            verifyStripePayment(stripePaymentIntentId);
        }

        String roomCode = getRoomCode(userId);

        Payment p = new Payment();
        p.setUser(authUser);
        p.setMonthYear(monthYear);
        p.setAmount(amount);
        p.setMethod(method);
        p.setRoomCode(roomCode);

        // ✅ FIXED: Card payments verified by Stripe → auto PAID
        //           Cash/Bank Transfer → PENDING for admin verification
        if ("CARD".equalsIgnoreCase(method)) {
            p.setStatus(Payment.Status.PAID);
        } else {
            p.setStatus(Payment.Status.PENDING);
        }

        if (stripePaymentIntentId != null) {
            p.setReference(stripePaymentIntentId);
        }

        paymentRepo.save(p);

        Map<String, Object> result = new HashMap<>();
        result.put("message",   "CARD".equalsIgnoreCase(method)
                ? "Payment recorded successfully"
                : "Payment submitted! Awaiting admin verification.");
        result.put("paymentId", p.getId());
        return result;
    }

    /**
     * Get payment history for a specific user.
     */
    public List<PaymentResponse> getPaymentsByUserId(Long userId) {
        return paymentRepo.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toPaymentResponse)
                .toList();
    }

    // ──────────────────────────────────────────────
    // ADMIN-FACING
    // ──────────────────────────────────────────────

    /**
     * Get ALL payments across all students (admin only).
     */
    public List<PaymentResponse> getAllPayments() {
        return paymentRepo.findAll()
                .stream()
                .map(p -> {
                    PaymentResponse r = toPaymentResponse(p);
                    r.studentName  = p.getUser().getFullName();
                    r.studentEmail = p.getUser().getEmail();
                    return r;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get a single payment by ID (admin only).
     */
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment p = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Payment not found with id: " + paymentId));

        PaymentResponse r = toPaymentResponse(p);
        r.studentName  = p.getUser().getFullName();
        r.studentEmail = p.getUser().getEmail();
        return r;
    }

    /**
     * Verify/approve a pending payment (admin only).
     */
    @Transactional
    public PaymentResponse verifyPayment(Long paymentId) {
        Payment p = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Payment not found with id: " + paymentId));

        if (p.getStatus() == Payment.Status.PAID) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Payment is already verified/paid");
        }

        p.setStatus(Payment.Status.PAID);
        paymentRepo.save(p);

        PaymentResponse r = toPaymentResponse(p);
        r.studentName  = p.getUser().getFullName();
        r.studentEmail = p.getUser().getEmail();
        return r;
    }

    /**
     * Reject/fail a payment (admin only).
     */
    @Transactional
    public PaymentResponse rejectPayment(Long paymentId) {
        Payment p = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Payment not found with id: " + paymentId));

        p.setStatus(Payment.Status.FAILED);
        paymentRepo.save(p);

        PaymentResponse r = toPaymentResponse(p);
        r.studentName  = p.getUser().getFullName();
        r.studentEmail = p.getUser().getEmail();
        return r;
    }

    /**
     * Get payments filtered by status (admin only).
     */
    public List<PaymentResponse> getPaymentsByStatus(String status) {
        Payment.Status paymentStatus;
        try {
            paymentStatus = Payment.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }

        return paymentRepo.findAll()
                .stream()
                .filter(p -> p.getStatus() == paymentStatus)
                .map(p -> {
                    PaymentResponse r = toPaymentResponse(p);
                    r.studentName  = p.getUser().getFullName();
                    r.studentEmail = p.getUser().getEmail();
                    return r;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get payments filtered by month (admin only).
     */
    public List<PaymentResponse> getPaymentsByMonth(String monthYear) {
        return paymentRepo.findAll()
                .stream()
                .filter(p -> p.getMonthYear().equals(monthYear))
                .map(p -> {
                    PaymentResponse r = toPaymentResponse(p);
                    r.studentName  = p.getUser().getFullName();
                    r.studentEmail = p.getUser().getEmail();
                    return r;
                })
                .collect(Collectors.toList());
    }

    /**
     * Financial summary for dashboard (admin only).
     */
    public Map<String, Object> getFinancialSummary() {
        List<Payment> allPayments = paymentRepo.findAll();

        BigDecimal totalCollected = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.Status.PAID)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.Status.PENDING)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalFailed = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.Status.FAILED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long paidCount    = allPayments.stream().filter(p -> p.getStatus() == Payment.Status.PAID).count();
        long pendingCount = allPayments.stream().filter(p -> p.getStatus() == Payment.Status.PENDING).count();
        long failedCount  = allPayments.stream().filter(p -> p.getStatus() == Payment.Status.FAILED).count();

        // Current month stats
        String currentMonth = currentMonthYear();
        BigDecimal currentMonthCollected = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.Status.PAID && p.getMonthYear().equals(currentMonth))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCollected",        totalCollected);
        summary.put("totalPending",          totalPending);
        summary.put("totalFailed",           totalFailed);
        summary.put("paidCount",             paidCount);
        summary.put("pendingCount",          pendingCount);
        summary.put("failedCount",           failedCount);
        summary.put("currentMonthCollected", currentMonthCollected);
        summary.put("currentMonth",          currentMonth);
        summary.put("totalPayments",         allPayments.size());
        return summary;
    }

    /**
     * Count total payments (for dashboard).
     */
    public long countPayments() {
        return paymentRepo.count();
    }

    /**
     * Count payments by status (for dashboard).
     */
    public long countByStatus(Payment.Status status) {
        return paymentRepo.findAll().stream()
                .filter(p -> p.getStatus() == status)
                .count();
    }

    // ──────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────

    private String getRoomCode(Long userId) {
        RoomAllocation alloc = allocRepo.findActiveByUserId(userId).orElse(null);
        if (alloc != null && alloc.getRoom() != null) {
            return alloc.getRoom().getRoomCode();
        }
        return null;
    }

    private String currentMonthYear() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }

    private void verifyStripePayment(String paymentIntentId) {
        try {
            Stripe.apiKey = stripeSecretKey;
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            if (!"succeeded".equals(intent.getStatus())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Stripe payment not completed");
            }
        } catch (StripeException e) {
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not verify Stripe payment: " + e.getMessage());
        }
    }

    private PaymentResponse toPaymentResponse(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.id        = p.getId();
        r.monthYear = p.getMonthYear();
        r.amount    = p.getAmount();
        r.method    = p.getMethod();
        r.status    = p.getStatus().name();
        r.roomCode  = p.getRoomCode();
        r.createdAt = p.getCreatedAt();
        return r;
    }
}
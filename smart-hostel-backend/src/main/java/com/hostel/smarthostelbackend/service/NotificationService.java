package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.entity.Notification;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.NotificationRepository;
import com.hostel.smarthostelbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;           // ✅ NEW

    public NotificationService(NotificationRepository notificationRepo,
                               UserRepository userRepo,
                               EmailService emailService) {
        this.notificationRepo = notificationRepo;
        this.userRepo         = userRepo;
        this.emailService     = emailService;
    }

    // ──────────────────────────────────────────────
    // STUDENT-FACING
    // ──────────────────────────────────────────────

    public List<Map<String, Object>> getMyNotifications(Long userId) {
        List<Notification> notifications = notificationRepo.findAllForUser(userId);
        return notifications.stream()
                .map(this::toResponseMap)
                .collect(Collectors.toList());
    }

    public long countUnread(Long userId) {
        return notificationRepo.countUnreadForUser(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification n = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (n.getUser() != null && !n.getUser().getId().equals(userId)
                && !"ALL".equals(n.getTarget())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Access denied");
        }

        n.setRead(true);
        notificationRepo.save(n);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepo.findAllForUser(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(notifications);
    }

    // ──────────────────────────────────────────────
    // PAYMENT REMINDER — called by scheduler
    // ──────────────────────────────────────────────

    /**
     * Sends a payment reminder in-app notification + email
     * to ALL approved students. Called automatically by PaymentReminderScheduler.
     */
    @Transactional
    public void sendPaymentReminder(String title, String message) {
        // Only send to APPROVED students
        List<User> approvedStudents = userRepo.findByRoleAndStatus("STUDENT", "APPROVED");

        for (User student : approvedStudents) {
            // ✅ In-app notification
            Notification n = new Notification();
            n.setTitle(title);
            n.setMessage(message);
            n.setType(Notification.Type.PAYMENT);
            n.setTarget("ALL");
            n.setCreatedBy(null);        // system-generated, no admin
            n.setUser(student);
            n.setStatus(Notification.Status.SENT);
            n.setSentAt(LocalDateTime.now());
            notificationRepo.save(n);

            // ✅ Email notification
            emailService.sendSimpleEmail(
                    student.getEmail(),
                    title,
                    "Dear " + student.getFullName() + ",\n\n" +
                            message + "\n\n" +
                            "Thank you,\n" +
                            "The Bunker Hostel Management Team"
            );
        }

        System.out.println("[NotificationService] Payment reminders sent to "
                + approvedStudents.size() + " students.");
    }

    // ──────────────────────────────────────────────
    // ADMIN-FACING
    // ──────────────────────────────────────────────

    @Transactional
    public Map<String, Object> sendNotification(User admin, String title, String message,
                                                String type, String target) {
        if (title == null || title.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (message == null || message.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        Notification.Type notifType;
        try {
            notifType = Notification.Type.valueOf(type != null ? type.toUpperCase() : "GENERAL");
        } catch (IllegalArgumentException e) {
            notifType = Notification.Type.GENERAL;
        }

        String resolvedTarget = (target != null && !target.trim().isEmpty()) ? target.trim() : "ALL";

        if ("ALL".equalsIgnoreCase(resolvedTarget)) {
            List<User> students = userRepo.findAllStudents();
            for (User student : students) {
                Notification n = new Notification();
                n.setTitle(title.trim());
                n.setMessage(message.trim());
                n.setType(notifType);
                n.setTarget("ALL");
                n.setCreatedBy(admin);
                n.setUser(student);
                n.setStatus(Notification.Status.SENT);
                n.setSentAt(LocalDateTime.now());
                notificationRepo.save(n);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Notification sent to all students");
            result.put("recipientCount", students.size());
            return result;

        } else {
            try {
                Long targetUserId = Long.parseLong(resolvedTarget);
                User targetUser = userRepo.findById(targetUserId)
                        .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Target user not found"));

                Notification n = new Notification();
                n.setTitle(title.trim());
                n.setMessage(message.trim());
                n.setType(notifType);
                n.setTarget(resolvedTarget);
                n.setCreatedBy(admin);
                n.setUser(targetUser);
                n.setStatus(Notification.Status.SENT);
                n.setSentAt(LocalDateTime.now());
                notificationRepo.save(n);

                Map<String, Object> result = new HashMap<>();
                result.put("message", "Notification sent to " + targetUser.getFullName());
                result.put("notificationId", n.getId());
                return result;

            } catch (NumberFormatException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Invalid target. Use 'ALL' or a user ID");
            }
        }
    }

    @Transactional
    public Map<String, Object> saveDraft(User admin, String title, String message,
                                         String type, String target) {
        if (title == null || title.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        Notification.Type notifType;
        try {
            notifType = Notification.Type.valueOf(type != null ? type.toUpperCase() : "GENERAL");
        } catch (IllegalArgumentException e) {
            notifType = Notification.Type.GENERAL;
        }

        Notification n = new Notification();
        n.setTitle(title.trim());
        n.setMessage(message != null ? message.trim() : "");
        n.setType(notifType);
        n.setTarget(target != null ? target.trim() : "ALL");
        n.setCreatedBy(admin);
        n.setStatus(Notification.Status.DRAFT);
        notificationRepo.save(n);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Draft saved successfully");
        result.put("notificationId", n.getId());
        return result;
    }

    @Transactional
    public Map<String, Object> sendDraft(Long notificationId, User admin) {
        Notification draft = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (draft.getStatus() != Notification.Status.DRAFT) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only drafts can be sent");
        }

        return sendNotification(admin, draft.getTitle(), draft.getMessage(),
                draft.getType().name(), draft.getTarget());
    }

    public List<Map<String, Object>> getAllNotifications() {
        return notificationRepo.findAllOrderByCreatedAtDesc().stream()
                .map(this::toAdminResponseMap)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getNotificationById(Long id) {
        Notification n = notificationRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Notification not found"));
        return toAdminResponseMap(n);
    }

    public List<Map<String, Object>> getByStatus(String status) {
        Notification.Status s;
        try {
            s = Notification.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }
        return notificationRepo.findByStatusOrderByCreatedAtDesc(s).stream()
                .map(this::toAdminResponseMap)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getByType(String type) {
        Notification.Type t;
        try {
            t = Notification.Type.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid type: " + type);
        }
        return notificationRepo.findByTypeOrderByCreatedAtDesc(t).stream()
                .map(this::toAdminResponseMap)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteNotification(Long id) {
        Notification n = notificationRepo.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Notification not found"));
        notificationRepo.delete(n);
    }

    public Map<String, Object> getAnalytics() {
        List<Notification> all = notificationRepo.findAll();

        long total     = all.size();
        long sent      = all.stream().filter(n -> n.getStatus() == Notification.Status.SENT).count();
        long drafts    = all.stream().filter(n -> n.getStatus() == Notification.Status.DRAFT).count();
        long scheduled = all.stream().filter(n -> n.getStatus() == Notification.Status.SCHEDULED).count();

        Map<String, Long> byType = all.stream()
                .collect(Collectors.groupingBy(n -> n.getType().name(), Collectors.counting()));

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("total",     total);
        analytics.put("sent",      sent);
        analytics.put("drafts",    drafts);
        analytics.put("scheduled", scheduled);
        analytics.put("byType",    byType);
        return analytics;
    }

    // ──────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────

    private Map<String, Object> toResponseMap(Notification n) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",        n.getId());
        map.put("title",     n.getTitle());
        map.put("message",   n.getMessage());
        map.put("type",      n.getType().name());
        map.put("read",      n.isRead());
        map.put("sentAt",    n.getSentAt());
        map.put("createdAt", n.getCreatedAt());
        return map;
    }

    private Map<String, Object> toAdminResponseMap(Notification n) {
        Map<String, Object> map = toResponseMap(n);
        map.put("status",    n.getStatus().name());
        map.put("target",    n.getTarget());
        map.put("createdBy", n.getCreatedBy() != null ? n.getCreatedBy().getFullName() : "System");
        map.put("userName",  n.getUser() != null ? n.getUser().getFullName() : null);
        map.put("updatedAt", n.getUpdatedAt());
        return map;
    }
}
package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.dto.ComplaintRequestDTO;
import com.hostel.smarthostelbackend.dto.ComplaintResponseDTO;
import com.hostel.smarthostelbackend.entity.Complaint;
import com.hostel.smarthostelbackend.entity.RoomAllocation;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.ComplaintRepository;
import com.hostel.smarthostelbackend.repository.RoomAllocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepo;
    private final RoomAllocationRepository allocationRepo;

    public ComplaintService(ComplaintRepository complaintRepo,
                            RoomAllocationRepository allocationRepo) {
        this.complaintRepo  = complaintRepo;
        this.allocationRepo = allocationRepo;
    }

    // ──────────────────────────────────────────────
    // STUDENT-FACING
    // ──────────────────────────────────────────────

    /**
     * Submit a new complaint (student must have a room).
     */
    @Transactional
    public Map<String, Object> submitComplaint(User user, ComplaintRequestDTO request) {

        // Check if user has a room
        RoomAllocation userRoom = allocationRepo.findActiveByUserId(user.getId()).orElse(null);
        if (userRoom == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "You must have a room to submit a complaint");
        }

        // Validate input
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Category is required");
        }
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Subject is required");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Description is required");
        }

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setCategory(request.getCategory().trim());
        complaint.setSubject(request.getSubject().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setRoomCode(userRoom.getRoom().getRoomCode());
        complaint.setStatus(Complaint.Status.PENDING);

        complaintRepo.save(complaint);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Complaint submitted successfully");
        result.put("complaintId", complaint.getId());
        return result;
    }

    /**
     * Get complaints for a specific user.
     */
    public List<ComplaintResponseDTO> getMyComplaints(Long userId) {
        List<Complaint> complaints = complaintRepo.findUserComplaints(userId);
        return complaints.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single complaint by ID (checks ownership or admin).
     */
    public ComplaintResponseDTO getComplaintById(Long complaintId, User requestingUser) {
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Complaint not found"));

        // Check ownership or admin
        if (!complaint.getUser().getId().equals(requestingUser.getId())
                && !requestingUser.getRole().equalsIgnoreCase("ADMIN")) {
            throw new AppException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return convertToDTO(complaint);
    }

    // ──────────────────────────────────────────────
    // ADMIN-FACING
    // ──────────────────────────────────────────────

    /**
     * Get ALL complaints (admin only).
     */
    public List<ComplaintResponseDTO> getAllComplaints() {
        return complaintRepo.findAllComplaints().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get complaints filtered by status (admin only).
     */
    public List<ComplaintResponseDTO> getComplaintsByStatus(String status) {
        Complaint.Status complaintStatus;
        try {
            complaintStatus = Complaint.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }

        return complaintRepo.findByStatus(complaintStatus).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get complaints filtered by category (admin only).
     */
    public List<ComplaintResponseDTO> getComplaintsByCategory(String category) {
        return complaintRepo.findAllComplaints().stream()
                .filter(c -> c.getCategory().equalsIgnoreCase(category))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update complaint status + admin response (admin only).
     */
    @Transactional
    public ComplaintResponseDTO updateComplaintStatus(Long complaintId, String status, String adminResponse) {
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Complaint not found"));

        if (status != null && !status.trim().isEmpty()) {
            try {
                Complaint.Status newStatus = Complaint.Status.valueOf(status.toUpperCase());
                complaint.setStatus(newStatus);

                // Auto-set resolvedAt when resolved
                if (newStatus == Complaint.Status.RESOLVED && complaint.getResolvedAt() == null) {
                    complaint.setResolvedAt(LocalDateTime.now());
                }
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
            }
        }

        if (adminResponse != null && !adminResponse.trim().isEmpty()) {
            complaint.setAdminResponse(adminResponse.trim());
        }

        complaintRepo.save(complaint);
        return convertToDTO(complaint);
    }

    /**
     * Resolve a complaint quickly (admin shortcut).
     */
    @Transactional
    public ComplaintResponseDTO resolveComplaint(Long complaintId, String adminResponse) {
        return updateComplaintStatus(complaintId, "RESOLVED", adminResponse);
    }

    /**
     * Reject a complaint (admin only).
     */
    @Transactional
    public ComplaintResponseDTO rejectComplaint(Long complaintId, String adminResponse) {
        return updateComplaintStatus(complaintId, "REJECTED", adminResponse);
    }

    /**
     * Mark complaint as in-progress (admin only).
     */
    @Transactional
    public ComplaintResponseDTO markInProgress(Long complaintId, String adminResponse) {
        return updateComplaintStatus(complaintId, "IN_PROGRESS", adminResponse);
    }

    /**
     * Delete a complaint (admin only).
     */
    @Transactional
    public void deleteComplaint(Long complaintId) {
        Complaint complaint = complaintRepo.findById(complaintId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Complaint not found"));
        complaintRepo.delete(complaint);
    }

    /**
     * Complaint analytics for admin dashboard.
     */
    public Map<String, Object> getComplaintAnalytics() {
        List<Complaint> all = complaintRepo.findAll();

        long total      = all.size();
        long pending     = all.stream().filter(c -> c.getStatus() == Complaint.Status.PENDING).count();
        long inProgress  = all.stream().filter(c -> c.getStatus() == Complaint.Status.IN_PROGRESS).count();
        long resolved    = all.stream().filter(c -> c.getStatus() == Complaint.Status.RESOLVED).count();
        long rejected    = all.stream().filter(c -> c.getStatus() == Complaint.Status.REJECTED).count();

        // Category breakdown
        Map<String, Long> byCategory = all.stream()
                .collect(Collectors.groupingBy(Complaint::getCategory, Collectors.counting()));

        // Room breakdown (top rooms with most complaints)
        Map<String, Long> byRoom = all.stream()
                .filter(c -> c.getRoomCode() != null)
                .collect(Collectors.groupingBy(Complaint::getRoomCode, Collectors.counting()));

        // Average resolution time (for resolved complaints)
        double avgResolutionHours = all.stream()
                .filter(c -> c.getStatus() == Complaint.Status.RESOLVED
                        && c.getResolvedAt() != null && c.getCreatedAt() != null)
                .mapToLong(c -> java.time.Duration.between(c.getCreatedAt(), c.getResolvedAt()).toHours())
                .average()
                .orElse(0.0);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("total",              total);
        analytics.put("pending",            pending);
        analytics.put("inProgress",         inProgress);
        analytics.put("resolved",           resolved);
        analytics.put("rejected",           rejected);
        analytics.put("byCategory",         byCategory);
        analytics.put("byRoom",            byRoom);
        analytics.put("avgResolutionHours", Math.round(avgResolutionHours * 10.0) / 10.0);
        return analytics;
    }

    /**
     * Count complaints by status (for dashboard cards).
     */
    public long countByStatus(Complaint.Status status) {
        return complaintRepo.findByStatus(status).size();
    }

    // ──────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────

    private ComplaintResponseDTO convertToDTO(Complaint complaint) {
        ComplaintResponseDTO dto = new ComplaintResponseDTO();
        dto.setId(complaint.getId());
        dto.setCategory(complaint.getCategory());
        dto.setSubject(complaint.getSubject());
        dto.setDescription(complaint.getDescription());
        dto.setStatus(complaint.getStatus().toString());
        dto.setRoomCode(complaint.getRoomCode());
        dto.setCreatedAt(complaint.getCreatedAt());
        dto.setUpdatedAt(complaint.getUpdatedAt());
        dto.setAdminResponse(complaint.getAdminResponse());
        dto.setResolvedAt(complaint.getResolvedAt());
        dto.setUserName(complaint.getUser().getFullName());
        dto.setUserId(complaint.getUser().getId());
        return dto;
    }
}
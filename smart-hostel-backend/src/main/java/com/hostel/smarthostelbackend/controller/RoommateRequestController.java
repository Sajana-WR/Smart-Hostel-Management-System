package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.RoommateRequestDTO;
import com.hostel.smarthostelbackend.entity.Room;
import com.hostel.smarthostelbackend.entity.RoomAllocation;
import com.hostel.smarthostelbackend.entity.RoommateRequest;
import com.hostel.smarthostelbackend.entity.RoommateSurvey;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.repository.RoomAllocationRepository;
import com.hostel.smarthostelbackend.repository.RoomRepository;
import com.hostel.smarthostelbackend.repository.RoommateRequestRepository;
import com.hostel.smarthostelbackend.repository.RoommateSurveyRepository;
import com.hostel.smarthostelbackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roommates")
@CrossOrigin(origins = "http://localhost:5173")
public class RoommateRequestController {

    private final RoommateRequestRepository requestRepo;
    private final UserRepository userRepo;
    private final RoomAllocationRepository allocationRepo;
    private final RoomRepository roomRepo;
    private final RoommateSurveyRepository surveyRepo;

    public RoommateRequestController(RoommateRequestRepository requestRepo,
                                     UserRepository userRepo,
                                     RoomAllocationRepository allocationRepo,
                                     RoomRepository roomRepo,
                                     RoommateSurveyRepository surveyRepo) {
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
        this.allocationRepo = allocationRepo;
        this.roomRepo = roomRepo;
        this.surveyRepo = surveyRepo;
    }

    // ─────────────────────────────────────────────────────────────
    // 1) SEND REQUEST
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/request")
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Object> body) {

        Long requesterId = toLong(body.get("requesterId"));
        Long requestedId = toLong(body.get("requestedId"));

        if (requesterId == null || requestedId == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid requesterId/requestedId"));

        if (requesterId.equals(requestedId))
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot request yourself"));

        User requester = userRepo.findById(requesterId).orElse(null);
        User requested = userRepo.findById(requestedId).orElse(null);

        if (requester == null || requested == null)
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));

        RoomAllocation requesterAlloc = allocationRepo.findActiveByUserId(requesterId).orElse(null);
        RoomAllocation requestedAlloc = allocationRepo.findActiveByUserId(requestedId).orElse(null);

        if (requesterAlloc != null && requesterAlloc.getStudent2() != null
                && !requesterAlloc.getStudent2().getId().equals(requesterId))
            return ResponseEntity.badRequest().body(Map.of("message", "Your room already has a roommate"));

        if (requestedAlloc != null && requestedAlloc.getStudent2() != null
                && !requestedAlloc.getStudent2().getId().equals(requestedId))
            return ResponseEntity.badRequest().body(Map.of("message", "That student already has a roommate"));

        if (requestRepo.existsPendingBetweenUsers(requesterId, requestedId))
            return ResponseEntity.badRequest().body(Map.of("message", "A pending request already exists between you two"));

        if (requestRepo.existsAcceptedBetweenUsers(requesterId, requestedId))
            return ResponseEntity.badRequest().body(Map.of("message", "You are already matched as roommates"));

        RoommateRequest req = new RoommateRequest();
        req.setRequester(requester);
        req.setRequested(requested);
        req.setStatus(RoommateRequest.Status.PENDING);
        requestRepo.save(req);

        return ResponseEntity.ok(Map.of("message", "Roommate request sent successfully!"));
    }

    // ─────────────────────────────────────────────────────────────
    // 2) VIEW INBOX
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/inbox/{userId}")
    public ResponseEntity<?> inbox(@PathVariable Long userId) {
        return ResponseEntity.ok(
                requestRepo.findByRequested_IdAndStatus(userId, RoommateRequest.Status.PENDING)
        );
    }

    // ─────────────────────────────────────────────────────────────
    // 3) GET ALL REQUESTS FOR USER
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRequests(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));

        List<RoommateRequest> sentRequests = requestRepo.findByRequester_Id(userId);
        List<RoommateRequest> receivedRequests = requestRepo
                .findByRequested_IdAndStatus(userId, RoommateRequest.Status.PENDING);

        List<RoommateRequestDTO> sentDTOs     = sentRequests.stream().map(this::convertToDTO).toList();
        List<RoommateRequestDTO> receivedDTOs = receivedRequests.stream().map(this::convertToDTO).toList();

        return ResponseEntity.ok(Map.of("sent", sentDTOs, "received", receivedDTOs));
    }

    // ─────────────────────────────────────────────────────────────
    // 4) ACCEPT REQUEST
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/accept/{requestId}")
    @Transactional
    public ResponseEntity<?> accept(@PathVariable Long requestId,
                                    @RequestBody Map<String, Object> body) {

        Long acceptorId = toLong(body.get("userId"));
        if (acceptorId == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Missing userId in request body"));

        Optional<RoommateRequest> opt = requestRepo.findById(requestId);
        if (opt.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "Request not found"));

        RoommateRequest req = opt.get();

        if (req.getStatus() != RoommateRequest.Status.PENDING)
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "This request is already " + req.getStatus().name().toLowerCase()
                            + " and cannot be accepted again"
            ));

        Long requesterId = req.getRequester().getId();
        Long requestedId = req.getRequested().getId();

        if (!requestedId.equals(acceptorId))
            return ResponseEntity.badRequest().body(Map.of("message", "Only the requested student can accept"));

        RoomAllocation requesterAlloc = allocationRepo.findActiveByUserId(requesterId).orElse(null);
        RoomAllocation requestedAlloc = allocationRepo.findActiveByUserId(requestedId).orElse(null);

        // CASE 1: Requester has room with empty slot → requested joins
        if (requesterAlloc != null && requesterAlloc.getStudent2() == null && requestedAlloc == null) {
            requesterAlloc.setStudent2(req.getRequested());
            allocationRepo.save(requesterAlloc);
            req.setStatus(RoommateRequest.Status.ACCEPTED);
            requestRepo.save(req);
            rejectOtherPendingRequests(requesterId, requestedId, req.getId());
            return ResponseEntity.ok(Map.of(
                    "message", "Request accepted! You have joined " + req.getRequester().getFullName() + "'s room.",
                    "roomCode", requesterAlloc.getRoom().getRoomCode()
            ));
        }

        // CASE 2: Requested has room with empty slot → requester joins
        if (requestedAlloc != null && requestedAlloc.getStudent2() == null && requesterAlloc == null) {
            requestedAlloc.setStudent2(req.getRequester());
            allocationRepo.save(requestedAlloc);
            req.setStatus(RoommateRequest.Status.ACCEPTED);
            requestRepo.save(req);
            rejectOtherPendingRequests(requesterId, requestedId, req.getId());
            return ResponseEntity.ok(Map.of(
                    "message", "Request accepted! " + req.getRequester().getFullName() + " has joined your room.",
                    "roomCode", requestedAlloc.getRoom().getRoomCode()
            ));
        }

        // CASE 3: Neither has a room → auto-assign both to first available room
        if (requesterAlloc == null && requestedAlloc == null) {
            req.setStatus(RoommateRequest.Status.ACCEPTED);
            requestRepo.save(req);
            rejectOtherPendingRequests(requesterId, requestedId, req.getId());

            List<Room> occupiedRooms = allocationRepo.findAll().stream()
                    .filter(a -> a.getStatus() == RoomAllocation.Status.ACTIVE)
                    .map(RoomAllocation::getRoom)
                    .collect(Collectors.toList());

            Room availableRoom = roomRepo.findAllByOrderByIdAsc().stream()
                    .filter(r -> occupiedRooms.stream()
                            .noneMatch(occupied -> occupied.getId().equals(r.getId())))
                    .findFirst()
                    .orElse(null);

            if (availableRoom != null) {
                RoomAllocation newAlloc = new RoomAllocation(availableRoom, req.getRequester());
                newAlloc.setStudent2(req.getRequested());
                newAlloc.setCheckInDate(LocalDate.now());
                allocationRepo.save(newAlloc);

                return ResponseEntity.ok(Map.of(
                        "message", "Request accepted! You have been automatically assigned to room "
                                + availableRoom.getRoomCode() + ".",
                        "roomCode", availableRoom.getRoomCode(),
                        "autoAssigned", true
                ));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Request accepted! You are now matched as roommates. Admin will assign you a shared room soon.",
                    "requiresAdminAssignment", true
            ));
        }

        // CASE 4: Both already have rooms → block
        if (requesterAlloc != null && requestedAlloc != null)
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Both students already have rooms. Cannot merge."
            ));

        return ResponseEntity.badRequest().body(Map.of("message", "Room slot is no longer available."));
    }

    // ─────────────────────────────────────────────────────────────
    // 5) REJECT REQUEST
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/reject/{requestId}")
    public ResponseEntity<?> reject(@PathVariable Long requestId,
                                    @RequestBody Map<String, Object> body) {
        Long rejectorId = toLong(body.get("userId"));
        if (rejectorId == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Missing userId in request body"));

        RoommateRequest req = requestRepo.findById(requestId).orElse(null);
        if (req == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Request not found"));

        if (!req.getRequested().getId().equals(rejectorId))
            return ResponseEntity.badRequest().body(Map.of("message", "Only the requested student can reject"));

        if (req.getStatus() != RoommateRequest.Status.PENDING)
            return ResponseEntity.badRequest().body(Map.of("message", "Only pending requests can be rejected"));

        req.setStatus(RoommateRequest.Status.REJECTED);
        requestRepo.save(req);

        return ResponseEntity.ok(Map.of("message", "Request rejected"));
    }

    // ─────────────────────────────────────────────────────────────
    // 6) LEAVE ROOM
    // ─────────────────────────────────────────────────────────────
    @PutMapping("/leave-room/{userId}")
    @Transactional
    public ResponseEntity<?> leaveRoom(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));

        RoomAllocation alloc = allocationRepo.findActiveByUserId(userId).orElse(null);
        if (alloc == null)
            return ResponseEntity.badRequest().body(Map.of("message", "You don't have a room"));

        if (alloc.getStudent2() != null && alloc.getStudent2().getId().equals(userId)) {
            alloc.setStudent2(null);
            allocationRepo.save(alloc);
            return ResponseEntity.ok(Map.of(
                    "message", "You have left the room successfully",
                    "roomCode", alloc.getRoom().getRoomCode()
            ));
        } else if (alloc.getStudent1().getId().equals(userId)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "You are the primary occupant. Contact admin to change rooms."
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "You are not assigned to this room"));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 7) CHECK IF USER CAN SEND REQUESTS
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/can-send/{userId}")
    public ResponseEntity<?> canSendRequests(@PathVariable Long userId) {
        RoomAllocation alloc = allocationRepo.findActiveByUserId(userId).orElse(null);

        boolean canSend;
        String reason;
        boolean isStudent2 = false;

        if (alloc == null) {
            canSend = true;
            reason = "You can request a roommate. Admin will assign you a room after matching.";
        } else if (alloc.getStudent2() == null) {
            canSend = true;
            reason = "Your room has an empty slot. You can invite a roommate.";
        } else if (alloc.getStudent2().getId().equals(userId)) {
            canSend = true;
            isStudent2 = true;
            reason = "You are a secondary occupant. You can leave to request someone else.";
        } else {
            canSend = false;
            reason = "Your room is full. You already have a roommate.";
        }

        return ResponseEntity.ok(Map.of(
                "canSend", canSend,
                "reason", reason,
                "hasRoom", alloc != null,
                "isStudent2", isStudent2
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // 8) CANCEL REQUEST
    // ─────────────────────────────────────────────────────────────
    @DeleteMapping("/cancel/{requestId}")
    public ResponseEntity<?> cancelRequest(@PathVariable Long requestId,
                                           @RequestBody Map<String, Object> body) {
        Long userId = toLong(body.get("userId"));
        if (userId == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Missing userId"));

        RoommateRequest req = requestRepo.findById(requestId).orElse(null);
        if (req == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Request not found"));

        if (!req.getRequester().getId().equals(userId))
            return ResponseEntity.badRequest().body(Map.of("message", "Only requester can cancel"));

        if (req.getStatus() != RoommateRequest.Status.PENDING)
            return ResponseEntity.badRequest().body(Map.of("message", "Can only cancel pending requests"));

        requestRepo.delete(req);
        return ResponseEntity.ok(Map.of("message", "Request cancelled"));
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────
    private void rejectOtherPendingRequests(Long userAId, Long userBId, Long acceptedRequestId) {
        List<RoommateRequest> pendingA  = requestRepo.findByRequester_Id(userAId);
        List<RoommateRequest> pendingB  = requestRepo.findByRequester_Id(userBId);
        List<RoommateRequest> receivedA = requestRepo.findByRequested_Id(userAId);
        List<RoommateRequest> receivedB = requestRepo.findByRequested_Id(userBId);

        java.util.Set<RoommateRequest> allRelated = new java.util.HashSet<>();
        allRelated.addAll(pendingA);
        allRelated.addAll(pendingB);
        allRelated.addAll(receivedA);
        allRelated.addAll(receivedB);

        for (RoommateRequest r : allRelated) {
            if (!r.getId().equals(acceptedRequestId)
                    && r.getStatus() == RoommateRequest.Status.PENDING) {
                r.setStatus(RoommateRequest.Status.REJECTED);
                requestRepo.save(r);
            }
        }
    }

    // ✅ FIXED: uses findByUser_Id to match repository method name
    private RoommateRequestDTO convertToDTO(RoommateRequest request) {
        RoommateRequestDTO dto = new RoommateRequestDTO();
        dto.setId(request.getId());

        User requester = request.getRequester();
        dto.setRequesterId(requester.getId());
        dto.setRequesterName(requester.getFullName());
        dto.setRequesterEmail(requester.getEmail());
        dto.setRequesterUsername(requester.getUsername());

        // ✅ FIX: changed from findByUserId to findByUser_Id
        surveyRepo.findByUser_Id(requester.getId()).ifPresent(survey -> {
            dto.setRequesterDegree(survey.getDegree());
            dto.setRequesterHometown(survey.getHometown());
            dto.setRequesterSchool(survey.getSchool());
            dto.setRequesterStudyTime(survey.getPreferredStudyTime());
            dto.setRequesterSleepTime(survey.getTypicalSleepTime());
            dto.setRequesterWakeUpTime(survey.getWakeUpTime());
            dto.setRequesterCleanliness(survey.getCleanlinessPreference());
            dto.setRequesterNoiseTolerance(survey.getNoiseTolerance());
            dto.setRequesterGuestFrequency(survey.getGuestFrequency());
            dto.setRequesterSmoking(survey.getSmokingPreference());
            dto.setRequesterPersonality(survey.getPersonalityType());
            dto.setRequesterRoomTemp(survey.getRoomTempPreference());
            dto.setRequesterSharing(survey.getSharingPreference());
        });

        dto.setRequestedId(request.getRequested().getId());
        dto.setRequestedName(request.getRequested().getFullName());
        dto.setStatus(request.getStatus().toString());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        try { return Long.parseLong(value.toString()); }
        catch (NumberFormatException e) { return null; }
    }
}
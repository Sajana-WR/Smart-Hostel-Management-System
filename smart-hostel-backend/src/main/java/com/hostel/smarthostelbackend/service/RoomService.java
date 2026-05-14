package com.hostel.smarthostelbackend.service;

import com.hostel.smarthostelbackend.dto.MyRoomResponse;
import com.hostel.smarthostelbackend.entity.Room;
import com.hostel.smarthostelbackend.entity.RoomAllocation;
import com.hostel.smarthostelbackend.entity.User;
import com.hostel.smarthostelbackend.exception.AppException;
import com.hostel.smarthostelbackend.repository.RoomAllocationRepository;
import com.hostel.smarthostelbackend.repository.RoomRepository;
import com.hostel.smarthostelbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomAllocationRepository allocationRepository;
    private final UserRepository userRepository;

    public RoomService(RoomRepository roomRepository,
                       RoomAllocationRepository allocationRepository,
                       UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.allocationRepository = allocationRepository;
        this.userRepository = userRepository;
    }

    // ──────────────────────────────────────────────
    // STUDENT-FACING (existing — unchanged)
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MyRoomResponse getMyRoomByUserId(Long userId) {

        RoomAllocation alloc = allocationRepository
                .findByUserIdAndStatus(userId, RoomAllocation.Status.ACTIVE)
                .orElse(null);

        if (alloc == null) return null;

        Room room = alloc.getRoom();
        if (room == null) return null;

        List<MyRoomResponse.RoommateDto> roommates = new ArrayList<>();

        User s1 = alloc.getStudent1();
        User s2 = alloc.getStudent2();

        if (s1 != null && s1.getId() != null && !s1.getId().equals(userId)) {
            roommates.add(new MyRoomResponse.RoommateDto(
                    s1.getId(), s1.getFullName(), s1.getUsername()
            ));
        }
        if (s2 != null && s2.getId() != null && !s2.getId().equals(userId)) {
            roommates.add(new MyRoomResponse.RoommateDto(
                    s2.getId(), s2.getFullName(), s2.getUsername()
            ));
        }

        MyRoomResponse dto = new MyRoomResponse();
        dto.setRoomId(room.getRoomCode());
        dto.setBlock(room.getBlock());
        dto.setFloor(room.getFloor());
        dto.setCheckInDate(alloc.getCheckInDate());
        dto.setRoommates(roommates);

        return dto;
    }

    // ──────────────────────────────────────────────
    // ADMIN-FACING
    // ──────────────────────────────────────────────

    /**
     * Get ALL rooms with occupancy info (admin).
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllRoomsWithOccupancy() {
        List<Room> rooms = roomRepository.findAllByOrderByIdAsc();
        List<RoomAllocation> activeAllocations = allocationRepository.findAll().stream()
                .filter(a -> a.getStatus() == RoomAllocation.Status.ACTIVE)
                .collect(Collectors.toList());

        return rooms.stream().map(room -> {
            Map<String, Object> roomData = new HashMap<>();
            roomData.put("id", room.getId());
            roomData.put("roomCode", room.getRoomCode());
            roomData.put("block", room.getBlock());
            roomData.put("floor", room.getFloor());
            roomData.put("capacity", room.getCapacity());

            // Find active allocation for this room
            Optional<RoomAllocation> alloc = activeAllocations.stream()
                    .filter(a -> a.getRoom().getId().equals(room.getId()))
                    .findFirst();

            int occupied = 0;
            List<Map<String, Object>> occupants = new ArrayList<>();

            if (alloc.isPresent()) {
                RoomAllocation ra = alloc.get();
                if (ra.getStudent1() != null) {
                    occupied++;
                    occupants.add(Map.of(
                            "id", ra.getStudent1().getId(),
                            "name", ra.getStudent1().getFullName(),
                            "email", ra.getStudent1().getEmail()
                    ));
                }
                if (ra.getStudent2() != null) {
                    occupied++;
                    occupants.add(Map.of(
                            "id", ra.getStudent2().getId(),
                            "name", ra.getStudent2().getFullName(),
                            "email", ra.getStudent2().getEmail()
                    ));
                }
            }

            roomData.put("occupied", occupied);
            roomData.put("available", room.getCapacity() - occupied);
            roomData.put("status", occupied >= room.getCapacity() ? "OCCUPIED" : occupied > 0 ? "PARTIAL" : "AVAILABLE");
            roomData.put("occupants", occupants);

            return roomData;
        }).collect(Collectors.toList());
    }

    /**
     * Get a single room with details (admin).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRoomDetails(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Room not found"));

        List<Map<String, Object>> all = getAllRoomsWithOccupancy();
        return all.stream()
                .filter(r -> r.get("id").equals(roomId))
                .findFirst()
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    /**
     * Get room by room code (admin).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRoomByCode(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Room not found: " + roomCode));

        return getRoomDetails(room.getId());
    }

    /**
     * Add a new room (admin).
     */
    @Transactional
    public Room addRoom(String roomCode, String block, Integer floor, Integer capacity) {
        if (roomCode == null || roomCode.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Room code is required");
        }
        if (block == null || block.trim().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Block is required");
        }
        if (floor == null || floor < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Valid floor is required");
        }

        // Check duplicate
        if (roomRepository.findByRoomCode(roomCode.trim()).isPresent()) {
            throw new AppException(HttpStatus.CONFLICT, "Room code already exists: " + roomCode);
        }

        Room room = new Room(roomCode.trim(), block.trim().toUpperCase(), floor,
                capacity != null && capacity > 0 ? capacity : 2);
        return roomRepository.save(room);
    }

    /**
     * Update room details (admin).
     */
    @Transactional
    public Room updateRoom(Long roomId, String block, Integer floor, Integer capacity) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Room not found"));

        if (block != null && !block.trim().isEmpty()) room.setBlock(block.trim().toUpperCase());
        if (floor != null && floor >= 0) room.setFloor(floor);
        if (capacity != null && capacity > 0) room.setCapacity(capacity);

        return roomRepository.save(room);
    }

    /**
     * Delete a room (admin) — only if no active allocation.
     */
    @Transactional
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Room not found"));

        Optional<RoomAllocation> activeAlloc = allocationRepository.findByRoom_IdAndStatus(roomId, RoomAllocation.Status.ACTIVE);
        if (activeAlloc.isPresent()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Cannot delete room with active allocation. Remove students first.");
        }

        roomRepository.delete(room);
    }

    /**
     * Get rooms by block (admin).
     */
    public List<Room> getRoomsByBlock(String block) {
        return roomRepository.findByBlockOrderByFloorAsc(block.toUpperCase().trim());
    }

    /**
     * Get rooms by floor (admin).
     */
    public List<Room> getRoomsByFloor(Integer floor) {
        return roomRepository.findByFloorOrderByRoomCodeAsc(floor);
    }

    /**
     * Room analytics for dashboard (admin).
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRoomAnalytics() {
        List<Map<String, Object>> allRooms = getAllRoomsWithOccupancy();

        long totalRooms = allRooms.size();
        long occupiedRooms = allRooms.stream().filter(r -> "OCCUPIED".equals(r.get("status"))).count();
        long partialRooms = allRooms.stream().filter(r -> "PARTIAL".equals(r.get("status"))).count();
        long availableRooms = allRooms.stream().filter(r -> "AVAILABLE".equals(r.get("status"))).count();

        int totalCapacity = allRooms.stream().mapToInt(r -> (Integer) r.get("capacity")).sum();
        int totalOccupied = allRooms.stream().mapToInt(r -> (Integer) r.get("occupied")).sum();

        // Per block stats
        Map<String, Map<String, Object>> blockStats = new LinkedHashMap<>();
        for (Map<String, Object> room : allRooms) {
            String block = (String) room.get("block");
            blockStats.computeIfAbsent(block, k -> {
                Map<String, Object> bs = new HashMap<>();
                bs.put("total", 0);
                bs.put("occupied", 0);
                bs.put("capacity", 0);
                bs.put("occupiedBeds", 0);
                return bs;
            });

            Map<String, Object> bs = blockStats.get(block);
            bs.put("total", (int) bs.get("total") + 1);
            bs.put("capacity", (int) bs.get("capacity") + (int) room.get("capacity"));
            bs.put("occupiedBeds", (int) bs.get("occupiedBeds") + (int) room.get("occupied"));

            if ("OCCUPIED".equals(room.get("status")) || "PARTIAL".equals(room.get("status"))) {
                bs.put("occupied", (int) bs.get("occupied") + 1);
            }
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRooms", totalRooms);
        analytics.put("occupiedRooms", occupiedRooms);
        analytics.put("partialRooms", partialRooms);
        analytics.put("availableRooms", availableRooms);
        analytics.put("totalCapacity", totalCapacity);
        analytics.put("totalOccupied", totalOccupied);
        analytics.put("occupancyPercent", totalCapacity > 0 ? Math.round((totalOccupied * 100.0) / totalCapacity) : 0);
        analytics.put("blockStats", new TreeMap<>(blockStats)); // ✅ FIXED: sorted A, B, C, D
        return analytics;
    }

    /**
     * Admin manually allocates a student to a room (admin only).
     */
    @Transactional
    public Map<String, Object> allocateStudentToRoom(Long userId, Long roomId, String slot, String checkInDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Student not found with id: " + userId));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Room not found with id: " + roomId));

        // Check if student already has an active allocation
        if (allocationRepository.existsActiveByUserId(userId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Student already has an active room allocation.");
        }

        // Check if room has an existing active allocation
        Optional<RoomAllocation> existingAlloc = allocationRepository.findByRoom_IdAndStatus(roomId, RoomAllocation.Status.ACTIVE);

        java.time.LocalDate date = (checkInDate != null && !checkInDate.isEmpty())
                ? java.time.LocalDate.parse(checkInDate)
                : java.time.LocalDate.now();

        if (existingAlloc.isPresent()) {
            // Room already has an allocation — add as student2 (roommate)
            RoomAllocation alloc = existingAlloc.get();

            if (alloc.isFull()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Room " + room.getRoomCode() + " is already full.");
            }

            if ("student1".equals(slot) && alloc.getStudent1() == null) {
                alloc.setStudent1(user);
            } else if (alloc.getStudent2() == null) {
                alloc.setStudent2(user);
            } else {
                throw new AppException(HttpStatus.BAD_REQUEST, "No available slot in this room.");
            }

            allocationRepository.save(alloc);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Student added to room " + room.getRoomCode() + " successfully");
            result.put("roomCode", room.getRoomCode());
            result.put("studentName", user.getFullName());
            return result;

        } else {
            // No allocation exists — create new one
            RoomAllocation alloc = new RoomAllocation(room, user);
            alloc.setCheckInDate(date);

            allocationRepository.save(alloc);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "Student allocated to room " + room.getRoomCode() + " successfully");
            result.put("roomCode", room.getRoomCode());
            result.put("studentName", user.getFullName());
            return result;
        }
    }

    /**
     * Kept for reference — auto-allocation is disabled.
     */
    @Transactional
    public MyRoomResponse allocateAnyAvailableRoom(Long userId) {
        throw new RuntimeException(
                "❌ AUTO-ALLOCATION IS DISABLED! " +
                        "Room allocation must be done by admin or through roommate request acceptance."
        );
    }
}
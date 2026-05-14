package com.hostel.smarthostelbackend.controller;

import com.hostel.smarthostelbackend.dto.ApiMessage;
import com.hostel.smarthostelbackend.dto.MyRoomResponse;
import com.hostel.smarthostelbackend.entity.Room;
import com.hostel.smarthostelbackend.service.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // ═══════════════════════════════════════════════
    //  STUDENT-FACING (existing — unchanged)
    // ═══════════════════════════════════════════════

    @GetMapping("/me/{userId}")
    public ResponseEntity<?> myRoom(@PathVariable Long userId) {
        try {
            MyRoomResponse dto = roomService.getMyRoomByUserId(userId);

            if (dto == null) {
                return ResponseEntity.ok(Map.of(
                        "hasRoom", false,
                        "message", "No room assigned yet"
                ));
            }

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Server error while loading room details",
                    "error", e.getMessage()
            ));
        }
    }

    // ═══════════════════════════════════════════════
    //  ADMIN-FACING ENDPOINTS
    // ═══════════════════════════════════════════════

    // ✅ Get ALL rooms with occupancy (Admin + Dashboard)
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRoomsWithOccupancy());
    }

    // ✅ Get single room details (Admin)
    @GetMapping("/admin/{id}")
    public ResponseEntity<Map<String, Object>> getRoomDetails(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomDetails(id));
    }

    // ✅ Get room by code (Admin)
    @GetMapping("/admin/by-code")
    public ResponseEntity<Map<String, Object>> getRoomByCode(@RequestParam String roomCode) {
        return ResponseEntity.ok(roomService.getRoomByCode(roomCode));
    }

    // ✅ Add new room (Admin)
    @PostMapping("/admin/add")
    public ResponseEntity<Room> addRoom(@RequestBody Map<String, Object> body) {
        Room room = roomService.addRoom(
                (String) body.get("roomCode"),
                (String) body.get("block"),
                body.get("floor") != null ? Integer.parseInt(body.get("floor").toString()) : null,
                body.get("capacity") != null ? Integer.parseInt(body.get("capacity").toString()) : 2
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    // ✅ Update room (Admin)
    @PutMapping("/admin/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        Room room = roomService.updateRoom(
                id,
                (String) body.get("block"),
                body.get("floor") != null ? Integer.parseInt(body.get("floor").toString()) : null,
                body.get("capacity") != null ? Integer.parseInt(body.get("capacity").toString()) : null
        );
        return ResponseEntity.ok(room);
    }

    // ✅ Delete room (Admin)
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiMessage> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(new ApiMessage("Room deleted successfully"));
    }

    // ✅ Filter by block (Admin)
    @GetMapping("/admin/by-block")
    public ResponseEntity<List<Room>> getRoomsByBlock(@RequestParam String block) {
        return ResponseEntity.ok(roomService.getRoomsByBlock(block));
    }

    // ✅ Filter by floor (Admin)
    @GetMapping("/admin/by-floor")
    public ResponseEntity<List<Room>> getRoomsByFloor(@RequestParam Integer floor) {
        return ResponseEntity.ok(roomService.getRoomsByFloor(floor));
    }

    // ✅ Room analytics (Admin Dashboard)
    @GetMapping("/admin/analytics")
    public ResponseEntity<Map<String, Object>> getRoomAnalytics() {
        return ResponseEntity.ok(roomService.getRoomAnalytics());
    }

    // ✅ Allocate student to room (Admin)
    @PostMapping("/admin/allocate")
    public ResponseEntity<Map<String, Object>> allocateStudent(@RequestBody Map<String, Object> body) {
        Long userId = body.get("userId") != null ? Long.parseLong(body.get("userId").toString()) : null;
        Long roomId = body.get("roomId") != null ? Long.parseLong(body.get("roomId").toString()) : null;
        String slot = (String) body.getOrDefault("slot", "student1");
        String checkInDate = (String) body.get("checkInDate");

        return ResponseEntity.ok(roomService.allocateStudentToRoom(userId, roomId, slot, checkInDate));
    }
}
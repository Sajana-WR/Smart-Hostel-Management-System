package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // ✅ Find by room code (A-101, B-201 etc.)
    Optional<Room> findByRoomCode(String roomCode);

    // ✅ Find rooms by block
    List<Room> findByBlockOrderByFloorAsc(String block);

    // ✅ Find rooms by floor
    List<Room> findByFloorOrderByRoomCodeAsc(Integer floor);

    // ✅ Ordered room list (important for stable allocation)
    List<Room> findAllByOrderByIdAsc();
}
package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.RoomAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface RoomAllocationRepository extends JpaRepository<RoomAllocation, Long> {

    List<RoomAllocation> findByStudent1IdOrStudent2Id(
            Long student1Id, Long student2Id);

    // ✅ FIXED: Added LEFT JOIN FETCH for student1 and student2 to avoid lazy loading issues
    @Query("""
        SELECT ra FROM RoomAllocation ra
        JOIN FETCH ra.room
        LEFT JOIN FETCH ra.student1
        LEFT JOIN FETCH ra.student2
        WHERE ra.status = :status
          AND (ra.student1.id = :userId OR ra.student2.id = :userId)
    """)
    Optional<RoomAllocation> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") RoomAllocation.Status status);

    // ✅ check if ACTIVE allocation exists for user
    @Query("""
        SELECT CASE WHEN COUNT(ra) > 0 THEN true ELSE false END
        FROM RoomAllocation ra
        WHERE ra.status = :status
          AND (ra.student1.id = :userId OR ra.student2.id = :userId)
    """)
    boolean existsByUserIdAndStatus(@Param("userId") Long userId, @Param("status") RoomAllocation.Status status);

    // ✅ find by room ID and status
    Optional<RoomAllocation> findByRoom_IdAndStatus(Long roomId, RoomAllocation.Status status);

    // ✅ find first room with empty slot (student2 is null)
    @Query("""
        SELECT ra FROM RoomAllocation ra
        JOIN FETCH ra.room
        LEFT JOIN FETCH ra.student1
        WHERE ra.status = :status
          AND ra.student2 IS NULL
        ORDER BY ra.id ASC
    """)
    Optional<RoomAllocation> findFirstNotFullByStatus(@Param("status") RoomAllocation.Status status);

    // ✅ Find allocation where both students are present (in any order)
    @Query("""
        SELECT ra FROM RoomAllocation ra
        JOIN FETCH ra.room
        LEFT JOIN FETCH ra.student1
        LEFT JOIN FETCH ra.student2
        WHERE ra.status = 'ACTIVE'
          AND (
              (ra.student1.id = :user1 AND ra.student2.id = :user2)
              OR
              (ra.student1.id = :user2 AND ra.student2.id = :user1)
          )
    """)
    Optional<RoomAllocation> findByBothStudents(@Param("user1") Long user1, @Param("user2") Long user2);

    // Compatibility helpers for controller/service call sites
    default Optional<RoomAllocation> findActiveByUserId(Long userId) {
        return findByUserIdAndStatus(userId, RoomAllocation.Status.ACTIVE);
    }

    default boolean existsActiveByUserId(Long userId) {
        return existsByUserIdAndStatus(userId, RoomAllocation.Status.ACTIVE);
    }

    default boolean existsActiveByUserId(Long userId, RoomAllocation.Status status) {
        return existsByUserIdAndStatus(userId, status);
    }
}
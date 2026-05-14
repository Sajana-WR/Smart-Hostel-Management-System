package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.RoommateSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoommateSurveyRepository extends JpaRepository<RoommateSurvey, Long> {

    // ✅ Find survey by user ID
    Optional<RoommateSurvey> findByUser_Id(Long userId);

    // ✅ Check if survey exists for user
    boolean existsByUser_Id(Long userId);

    // ✅ Get surveys for multiple users (useful for AI matching optimization)
    List<RoommateSurvey> findAllByUser_IdIn(List<Long> userIds);

    // ✅ Get all surveys except a specific user (used in matching)
    @Query("""
            SELECT s
            FROM RoommateSurvey s
            WHERE s.user.id <> :userId
            """)
    List<RoommateSurvey> findAllExcludingUser(@Param("userId") Long userId);
}
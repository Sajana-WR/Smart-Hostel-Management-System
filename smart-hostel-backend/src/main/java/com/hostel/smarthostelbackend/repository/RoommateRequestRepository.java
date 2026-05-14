package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.RoommateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoommateRequestRepository extends JpaRepository<RoommateRequest, Long> {

    List<RoommateRequest> findByRequested_IdAndStatus(Long requestedId, RoommateRequest.Status status);

    List<RoommateRequest> findByRequester_Id(Long requesterId);

    List<RoommateRequest> findByRequested_Id(Long requestedId);
    List<RoommateRequest> findByRequesterId(Long requesterId);
    List<RoommateRequest> findByRequestedId(Long requestedId);

    // ✅ Check if a PENDING request exists between two users (either direction)
    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
        FROM RoommateRequest r
        WHERE r.status = 'PENDING'
          AND (
              (r.requester.id = :a AND r.requested.id = :b)
              OR
              (r.requester.id = :b AND r.requested.id = :a)
          )
    """)
    boolean existsPendingBetweenUsers(@Param("a") Long a, @Param("b") Long b);

    // ✅ NEW: Find a specific PENDING request between two users
    @Query("""
        SELECT r FROM RoommateRequest r
        WHERE r.status = 'PENDING'
          AND r.requester.id = :requesterId
          AND r.requested.id = :requestedId
    """)
    Optional<RoommateRequest> findPendingBetween(@Param("requesterId") Long requesterId,
                                                 @Param("requestedId") Long requestedId);

    // ✅ NEW: Check if an ACCEPTED match already exists between two users (either direction)
    @Query("""
        SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
        FROM RoommateRequest r
        WHERE r.status = 'ACCEPTED'
          AND (
              (r.requester.id = :a AND r.requested.id = :b)
              OR
              (r.requester.id = :b AND r.requested.id = :a)
          )
    """)
    boolean existsAcceptedBetweenUsers(@Param("a") Long a, @Param("b") Long b);

    // Backward-compatible alias
    default List<RoommateRequest> findByRequestedIdAndStatus(Long requestedId, RoommateRequest.Status status) {
        return findByRequested_IdAndStatus(requestedId, status);
    }
}
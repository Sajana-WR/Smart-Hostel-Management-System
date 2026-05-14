package com.hostel.smarthostelbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "roommate_requests",
        indexes = {
                @Index(name = "idx_roommate_req_requester", columnList = "requester_id"),
                @Index(name = "idx_roommate_req_requested", columnList = "requested_id"),
                @Index(name = "idx_roommate_req_status", columnList = "status")
        },
        uniqueConstraints = {
                // ✅ Prevent duplicates for same pair (no matter status)
                @UniqueConstraint(name = "uk_roommate_req_pair", columnNames = {"requester_id", "requested_id"})
        }
)
public class RoommateRequest {

    public enum Status { PENDING, ACCEPTED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_id", nullable = false)
    private User requested;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public RoommateRequest() {}

    public RoommateRequest(User requester, User requested) {
        this.requester = requester;
        this.requested = requested;
        this.status = Status.PENDING;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.status == null) this.status = Status.PENDING;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // -------- getters/setters --------

    public Long getId() { return id; }

    public User getRequester() { return requester; }
    public void setRequester(User requester) { this.requester = requester; }

    public User getRequested() { return requested; }
    public void setRequested(User requested) { this.requested = requested; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
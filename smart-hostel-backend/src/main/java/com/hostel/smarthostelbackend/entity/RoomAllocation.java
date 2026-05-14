package com.hostel.smarthostelbackend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "room_allocations")
public class RoomAllocation {

    public enum Status { ACTIVE, LEFT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which room is allocated
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // Student 1 (required)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "student1_id", nullable = false)
    private User student1;

    // Student 2 (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student2_id")
    private User student2;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status;

    public RoomAllocation() {
        this.checkInDate = LocalDate.now();
        this.status = Status.ACTIVE;
    }

    public RoomAllocation(Room room, User student1) {
        this.room = room;
        this.student1 = student1;
        this.checkInDate = LocalDate.now();
        this.status = Status.ACTIVE;
    }

    // --------------------
    // Helper methods
    // --------------------

    public boolean hasStudent(Long userId) {
        if (userId == null) return false;
        return (student1 != null && userId.equals(student1.getId()))
                || (student2 != null && userId.equals(student2.getId()));
    }

    public boolean isFull() {
        return student1 != null && student2 != null;
    }

    public int occupiedCount() {
        int count = 0;
        if (student1 != null) count++;
        if (student2 != null) count++;
        return count;
    }

    // --------------------
    // Getters and setters
    // --------------------

    public Long getId() {
        return id;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public User getStudent1() {
        return student1;
    }

    public void setStudent1(User student1) {
        this.student1 = student1;
    }

    public User getStudent2() {
        return student2;
    }

    public void setStudent2(User student2) {
        this.student2 = student2;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
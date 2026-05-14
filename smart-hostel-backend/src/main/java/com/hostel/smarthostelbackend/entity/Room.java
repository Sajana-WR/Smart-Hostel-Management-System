package com.hostel.smarthostelbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "rooms",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_room_code", columnNames = "room_code")
        }
)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Example: A-101
    @Column(name = "room_code", nullable = false, length = 20)
    private String roomCode;

    @Column(nullable = false, length = 10)
    private String block; // A / B

    @Column(nullable = false)
    private Integer floor; // 1,2,3

    @Column(nullable = false)
    private Integer capacity;

    public Room() {
        this.capacity = 2; // default
    }

    public Room(String roomCode, String block, Integer floor) {
        this.roomCode = roomCode;
        this.block = block;
        this.floor = floor;
        this.capacity = 2;
    }

    public Room(String roomCode, String block, Integer floor, Integer capacity) {
        this.roomCode = roomCode;
        this.block = block;
        this.floor = floor;
        this.capacity = capacity;
    }

    // --------------------
    // Getters and Setters
    // --------------------

    public Long getId() {
        return id;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getBlock() {
        return block;
    }

    public void setBlock(String block) {
        this.block = block;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
}
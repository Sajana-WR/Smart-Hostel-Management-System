package com.hostel.smarthostelbackend.dto;

import java.time.LocalDate;
import java.util.List;

public class MyRoomResponse {

    private String roomId;      // roomCode (ex: A-101)
    private String block;
    private Integer floor;
    private LocalDate checkInDate;
    private List<RoommateDto> roommates;

    public MyRoomResponse() {
    }

    public MyRoomResponse(String roomId,
                          String block,
                          Integer floor,
                          LocalDate checkInDate,
                          List<RoommateDto> roommates) {
        this.roomId = roomId;
        this.block = block;
        this.floor = floor;
        this.checkInDate = checkInDate;
        this.roommates = roommates;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
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

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public List<RoommateDto> getRoommates() {
        return roommates;
    }

    public void setRoommates(List<RoommateDto> roommates) {
        this.roommates = roommates;
    }

    // ✅ Inner DTO
    public static class RoommateDto {

        private Long id;
        private String fullName;
        private String username;

        public RoommateDto() {
        }

        public RoommateDto(Long id, String fullName, String username) {
            this.id = id;
            this.fullName = fullName;
            this.username = username;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }
}
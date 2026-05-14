package com.hostel.smarthostelbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "nearby_services")
public class NearbyService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(length = 50)
    private String distance;

    @Column(length = 50)
    private String category; // Restaurant, Gym, Transport, Shop, Medical, Cafe

    public NearbyService() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDistance() { return distance; }
    public void setDistance(String distance) { this.distance = distance; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
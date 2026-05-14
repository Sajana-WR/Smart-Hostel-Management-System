package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.NearbyService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NearbyServiceRepository extends JpaRepository<NearbyService, Long> {
    List<NearbyService> findAllByOrderByIdAsc();
}
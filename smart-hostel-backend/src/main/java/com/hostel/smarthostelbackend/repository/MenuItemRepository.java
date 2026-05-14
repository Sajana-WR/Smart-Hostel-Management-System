package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByDateAndAvailableTrue(LocalDate date);
}
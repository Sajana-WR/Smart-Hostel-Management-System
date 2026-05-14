package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.MealOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MealOrderRepository extends JpaRepository<MealOrder, Long> {
    List<MealOrder> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<MealOrder> findByStudentId(Long studentId);
}
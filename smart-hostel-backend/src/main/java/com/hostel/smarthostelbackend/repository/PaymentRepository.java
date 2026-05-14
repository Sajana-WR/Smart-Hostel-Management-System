package com.hostel.smarthostelbackend.repository;

import com.hostel.smarthostelbackend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<Payment> findByUserId(Long userId);

    boolean existsByUser_IdAndMonthYear(Long userId, String monthYear);
}